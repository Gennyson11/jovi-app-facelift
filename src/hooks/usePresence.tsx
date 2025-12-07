import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const PRESENCE_CHANNEL_NAME = 'jovitools-online-users';

export function usePresence(userId: string | undefined, userEmail: string | undefined, userName: string | null | undefined) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId || !userEmail) return;

    console.log('Setting up presence for user:', userId, userEmail);

    const presenceChannel = supabase.channel(PRESENCE_CHANNEL_NAME, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced for user:', userId);
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);
        if (status === 'SUBSCRIBED') {
          const trackResult = await presenceChannel.track({
            user_id: userId,
            user_email: userEmail,
            user_name: userName || userEmail.split('@')[0],
            online_at: new Date().toISOString(),
          });
          console.log('Track result:', trackResult);
        }
      });

    setChannel(presenceChannel);

    return () => {
      console.log('Unsubscribing presence for user:', userId);
      presenceChannel.unsubscribe();
    };
  }, [userId, userEmail, userName]);

  return channel;
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<{ user_id: string; user_email: string; user_name: string; online_at: string }[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    console.log('Setting up admin presence listener');

    const presenceChannel = supabase.channel(PRESENCE_CHANNEL_NAME);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('Admin received presence state:', state);
        
        const users: { user_id: string; user_email: string; user_name: string; online_at: string }[] = [];
        
        Object.keys(state).forEach((key) => {
          const presences = state[key] as unknown as { user_id: string; user_email: string; user_name: string; online_at: string }[];
          if (presences && presences.length > 0) {
            users.push(presences[0]);
          }
        });

        console.log('Parsed online users:', users);
        setOnlineUsers(users);
        setOnlineCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe((status) => {
        console.log('Admin presence channel status:', status);
      });

    return () => {
      console.log('Unsubscribing admin presence listener');
      presenceChannel.unsubscribe();
    };
  }, []);

  return { onlineUsers, onlineCount };
}
