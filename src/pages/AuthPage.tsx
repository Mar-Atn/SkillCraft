// Unified Authentication Page - Login and Registration
// Preserves all existing authentication flows while adding user registration

import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleAuthSuccess = () => {
    // Auth success is handled by the AuthContext and redirects automatically
    console.log('✅ Authentication successful');
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <>
      {isLogin ? (
        <LoginForm 
          onSuccess={handleAuthSuccess} 
          onSwitchToRegister={switchToRegister}
        />
      ) : (
        <RegisterForm 
          onSuccess={handleAuthSuccess} 
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
}