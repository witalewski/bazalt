import { supabase } from './supabase';
import type { User } from '../types';

export async function sendOtp(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: undefined,
    },
  });
  
  if (error) throw error;
  return true;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return {
    id: user.id,
    email: user.email || '',
  };
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
      });
    } else {
      callback(null);
    }
  });
}
