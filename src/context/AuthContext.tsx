import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { userInitService } from '../services/userInitService';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.accessToken,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

// Mock authentication service (PRD requirement: test@test.com and admin@admin.com)
const mockUsers: Record<string, { password: string; user: User }> = {
  'test@test.com': {
    password: 'test',
    user: { id: 'test-user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User', role: 'user' }
  },
  'admin@admin.com': {
    password: 'admin',
    user: { id: 'admin-user-1', email: 'admin@admin.com', firstName: 'Admin', lastName: 'User', role: 'admin' }
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize auth from localStorage
    const token = localStorage.getItem('scsx_accessToken');
    const user = localStorage.getItem('scsx_user');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: userData,
            accessToken: token
          }
        });
      } catch (error) {
        localStorage.removeItem('scsx_accessToken');
        localStorage.removeItem('scsx_user');
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = mockUsers[email];
      
      if (!mockUser || mockUser.password !== password) {
        throw new Error('Invalid credentials');
      }

      const accessToken = `mock-jwt-token-${Date.now()}`;
      
      localStorage.setItem('scsx_accessToken', accessToken);
      localStorage.setItem('scsx_user', JSON.stringify(mockUser.user));
      
      // Initialize user profile in data service
      userInitService.initializeUser(
        mockUser.user.id,
        mockUser.user.email,
        mockUser.user.firstName,
        mockUser.user.lastName,
        mockUser.user.role
      );
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: mockUser.user,
          accessToken
        }
      });
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed'
      });
      throw error;
    }
  };

  const register = async (email: string, _password: string, _firstName?: string, _lastName?: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user already exists
      if (mockUsers[email]) {
        throw new Error('User already exists');
      }

      // For now, just use mock authentication
      // In production, this would call a real API
      throw new Error('Registration not available in mock mode. Please use test@test.com or admin@admin.com');
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed'
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('scsx_accessToken');
    localStorage.removeItem('scsx_user');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};