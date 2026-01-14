import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/formulary';

export function useUserRole() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setRole('user'); // Default to user role
        } else if (roles && roles.length > 0) {
          // Prioritize admin > clinician > user
          if (roles.some(r => r.role === 'admin')) {
            setRole('admin');
          } else if (roles.some(r => r.role === 'clinician')) {
            setRole('clinician');
          } else {
            setRole('user');
          }
        } else {
          setRole('user'); // Default to user role if no roles found
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = role === 'admin';
  const isClinician = role === 'clinician' || role === 'admin';
  const isAuthenticated = role !== null;

  return { role, isAdmin, isClinician, isAuthenticated, isLoading, userId };
}
