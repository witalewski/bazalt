import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { getCurrentUser, onAuthStateChange } from '../lib/auth';

export function useAuth() {
  const { user, setUser, isAuthenticated, isLoading, setLoading } = useStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
    });

    unsubscribe = subscription.unsubscribe;

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || initializing,
  };
}
