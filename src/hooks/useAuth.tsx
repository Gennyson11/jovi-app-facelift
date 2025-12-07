import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }
    return data?.role as UserRole;
  };

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userRole = await fetchUserRole(currentSession.user.id);
          if (isMounted) {
            setRole(userRole);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up listener for auth changes - only handle explicit sign in/out
    // Ignore TOKEN_REFRESHED and INITIAL_SESSION to prevent page reloads
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        // Only handle explicit auth changes
        if (event === 'SIGNED_IN') {
          // Only update if user actually changed (new login)
          if (newSession?.user?.id !== user?.id) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            if (newSession?.user) {
              fetchUserRole(newSession.user.id).then(userRole => {
                if (isMounted) setRole(userRole);
              });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setRole(null);
        }
        // Explicitly ignore: TOKEN_REFRESHED, INITIAL_SESSION, PASSWORD_RECOVERY, USER_UPDATED
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      loading,
      signIn,
      signOut,
      isAdmin: role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
