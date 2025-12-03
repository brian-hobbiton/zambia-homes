'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/data';
import { users } from '@/lib/data';

type Role = 'TENANT' | 'LANDLORD' | 'ADMIN' | null;

const getRoleFromLocalStorage = (): Role => {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('userRole');
  if (role === 'TENANT' || role === 'LANDLORD' || role === 'ADMIN') {
    return role;
  }
  return null;
};

const getUserFromRole = (role: Role): User | null => {
    switch (role) {
        case 'TENANT':
            return users.find(u => u.role === 'TENANT') || null;
        case 'LANDLORD':
            return users.find(u => u.role === 'LANDLORD') || null;
        case 'ADMIN':
            return users.find(u => u.role === 'ADMIN') || null;
        default:
            return null;
    }
};

export function useAuth() {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRole = getRoleFromLocalStorage();
    setRole(storedRole);
    setUser(getUserFromRole(storedRole));
    setLoading(false);
  }, []);

  const login = (newRole: 'TENANT' | 'LANDLORD' | 'ADMIN') => {
    localStorage.setItem('userRole', newRole);
    setRole(newRole);
    setUser(getUserFromRole(newRole));
  };

  const logout = () => {
    localStorage.removeItem('userRole');
    setRole(null);
    setUser(null);
  };

  return { user, role, login, logout, loading };
}
