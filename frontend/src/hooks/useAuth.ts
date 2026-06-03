'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

// Use this hook in any component that needs the current user
export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  return { user, token, isAuthenticated, logout };
}

// Use this hook to REQUIRE authentication.
// If not logged in, redirects to /login automatically.
export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/dashboard'); // Wrong role, redirect to safe page
    }
  }, [isAuthenticated, user, router, allowedRoles]);

  return { user, isAuthenticated };
}

// Use this to fetch and store the full user profile after login
export async function fetchAndStoreUser(token: string, setAuth: Function) {
  try {
    const res = await authApi.me();
    setAuth(res.data, token);
  } catch {
    Cookies.remove('access_token');
  }
}