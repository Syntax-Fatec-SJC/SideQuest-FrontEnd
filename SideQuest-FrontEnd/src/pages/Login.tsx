import { useState } from 'react';
import LoginForm from '../components/LoginForm';
// import SignupForm from '../components/SignupForm';
import AuthToggle from '../components/AuthToggle';

const Login: React.FC = () => {
  const [active, setActive] = useState(false);

  const handleLoginSubmit = (loginData: { email: string; password: string }) => {
    console.log('Login submitted:', loginData);
  };

  // const handleSignupSubmit = (signupData: { name: string; email: string; password: string }) => {
  //   console.log('Signup submitted:', signupData);
  // };

  const toggleToLogin = () => setActive(false);
  const toggleToSignup = () => setActive(true);

  return (
    <div className={`container ${active ? 'active' : ''} min-h-screen flex items-center justify-center px-2`}
      style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a192f, #172a45)' }}>
      
      {/* Sign Up Component */}
      {/* <SignupForm onSubmit={handleSignupSubmit} /> */}

      {/* Sign In Component */}
      <LoginForm onSubmit={handleLoginSubmit} />

      {/* Auth Toggle Component */}
      <AuthToggle onToggleToLogin={toggleToLogin} onToggleToSignup={toggleToSignup} />
    </div>
  );
};

export default Login;