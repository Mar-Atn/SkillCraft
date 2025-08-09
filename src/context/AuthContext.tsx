import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { userInitService } from '../services/userInitService';
import { userManagementService } from '../services/userManagementService';

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

// PRESERVED: Original functionality now enhanced with user management service

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
      // Simulate API delay to preserve UX timing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ENHANCED: Use user management service instead of hardcoded users
      const authenticatedUser = userManagementService.authenticateUser(email, password);
      
      const accessToken = `mock-jwt-token-${Date.now()}`;
      
      // Convert to AuthContext User format (preserving existing interface)
      const user: User = {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        firstName: authenticatedUser.firstName,
        lastName: authenticatedUser.lastName,
        role: authenticatedUser.role
      };
      
      localStorage.setItem('scsx_accessToken', accessToken);
      localStorage.setItem('scsx_user', JSON.stringify(user));
      
      // PRESERVED: Initialize user profile in data service (critical for existing flows)
      userInitService.initializeUser(
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.role
      );
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
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

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API delay to preserve UX timing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ENHANCED: Enable real user registration
      const newUser = userManagementService.registerUser(email, password, firstName, lastName);
      
      const accessToken = `mock-jwt-token-${Date.now()}`;
      
      // Convert to AuthContext User format (preserving existing interface)
      const user: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      };
      
      localStorage.setItem('scsx_accessToken', accessToken);
      localStorage.setItem('scsx_user', JSON.stringify(user));
      
      // PRESERVED: Initialize user profile in data service (critical for existing flows)
      userInitService.initializeUser(
        user.id,
        user.email,
        user.firstName,
        user.lastName,
        user.role
      );
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          accessToken
        }
      });
      
      console.log('✅ User registered and logged in:', email);
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