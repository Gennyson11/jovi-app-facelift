import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface OnlineUser {
  odgovor: string;
  odgovor_id: string;
  odgovor_email: string;
  odgovor_name: string | null;
  online_at: string;
}

interface PresenceState {
  [key: string]: OnlineUser[];
}

export function usePresence(userId: string | undefined, userEmail: string | undefined, userName: string | null | undefined) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId || !userEmail) return;

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced');
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: userId,
            user_email: userEmail,
            user_name: userName || userEmail.split('@')[0],
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [userId, userEmail, userName]);

  return channel;
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<{ user_id: string; user_email: string; user_name: string; online_at: string }[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const presenceChannel = supabase.channel('online-users-admin');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: { user_id: string; user_email: string; user_name: string; online_at: string }[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as unknown as { user_id: string; user_email: string; user_name: string; online_at: string }[];
          if (presences && presences.length > 0) {
            users.push(presences[0]);
          }
        });

        setOnlineUsers(users);
        setOnlineCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    return () => {
      presenceChannel.unsubscribe();
    };
  }, []);

  return { onlineUsers, onlineCount };
}
