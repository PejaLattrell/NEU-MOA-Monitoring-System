import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { BookOpen, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import schoolBanner from '../assets/schoolBanner.png';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const { loginWithGoogle, currentUser, userRole } = useAuth();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect based on role
  if (currentUser && userRole) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'faculty') return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
  }

  const handleLogin = async () => {
    try {
      setError('');
      setIsLoggingIn(true);
      await loginWithGoogle();
      // Navigation is handled by DefaultRoleRedirect or App component observing AuthContext
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40rem] h-[40rem] bg-amber-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-[20%] -left-[10%] w-[35rem] h-[35rem] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70" style={{ animationDelay: '2s', animationDuration: '7s' }}></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[45rem] h-[45rem] bg-slate-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-10 border border-white"
      >
        <div className="bg-slate-900 p-8 text-center flex flex-col items-center border-b-4 border-amber-500">
          <img src={schoolBanner} alt="NEU Logo" className="h-20 w-20 rounded-full mb-4 object-cover shadow-lg border-2 border-amber-500/50" />
          <h1 className="text-3xl font-bold text-white mb-2">NEU MOA Portal</h1>
          <p className="text-amber-400 font-medium">Monitoring & Approval System</p>
        </div>
        
        <div className="p-8">
          <p className="text-gray-600 text-center mb-8">
            Please sign in using your institutional Google email to access the MOA dashboard.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start gap-3">
              <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold bg-white text-gray-700 border border-gray-200 transition-all shadow-sm
              ${isLoggingIn 
                ? 'cursor-not-allowed opacity-70' 
                : 'hover:bg-gray-50 hover:shadow-md hover:border-gray-300 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-200'
              }
            `}
          >
            {isLoggingIn ? (
               <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                <GoogleIcon />
                <span className="text-base tracking-wide">Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
