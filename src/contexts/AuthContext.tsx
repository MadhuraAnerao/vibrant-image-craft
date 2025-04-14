
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { User, AuthState, UserRole } from '../types/auth';

// Sample user data - in a real app, you would fetch from an API
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user' as UserRole,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'user' as UserRole,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'user' as UserRole,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Michael Wang',
    email: 'michael@example.com',
    role: 'user' as UserRole,
    createdAt: new Date().toISOString(),
  }
];

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { value } = await Preferences.get({ key: 'user' });
        
        if (value) {
          const user = JSON.parse(value);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, you would validate credentials against an API
      // For this demo, we're just checking against our mock data
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return false;
      }

      // In a real app, you would verify the password here
      // For demo purposes, any password is accepted

      await Preferences.set({
        key: 'user',
        value: JSON.stringify(user),
      });

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'user') => {
    try {
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return false;
      }

      // Create new user
      const newUser: User = {
        id: `${MOCK_USERS.length + 1}`,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      };

      // In a real app, you would send this to an API
      // For demo purposes, we'll just store it locally
      MOCK_USERS.push(newUser);

      await Preferences.set({
        key: 'user',
        value: JSON.stringify(newUser),
      });

      setState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await Preferences.remove({ key: 'user' });
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const getAllUsers = () => {
    // Only return users (not admins) for the admin panel
    return MOCK_USERS.filter(user => user.role === 'user');
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
