import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, resetAuthStatus } from '../../redux/slices/authSlice';
import { Mail, User, ArrowLeft } from 'lucide-react';
import logo from '../../assets/furryfriend.png';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import PasswordStrength from '../../components/ui/PasswordStrength';
import AuthButton from '../../components/ui/AuthButton';
import SocialLoginButton from '../../components/ui/SocialLoginButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const AuthPage = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, isSuccess, message, isAuthenticated, user } = useSelector((state) => state.auth);

  // Reset form when mode changes
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      confirmPassword: '',
      acceptTerms: false,
    }
  });

  useEffect(() => {
    reset();
    dispatch(resetAuthStatus());
  }, [mode, reset, dispatch]);

  useEffect(() => {
    if (isError) {
      // TODO: Replace with Toast notification later
      console.error(message);
    }

    let timeout;
    if (isSuccess || isAuthenticated) {
      timeout = setTimeout(() => {
        if (user?.role === 'vet') {
          navigate('/clinic/dashboard');
        } else if (user?.role === 'grooming') {
          navigate('/grooming/dashboard');
        } else if (user?.role === 'boarding') {
          navigate('/boarding/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isError, isSuccess, isAuthenticated, message, navigate, user]);

  const passwordValue = watch('password', '');

  const handleToggleMode = () => {
    navigate(isLogin ? '/register' : '/login');
  };

  const onSubmit = (data) => {
    if (isLogin) {
      dispatch(loginUser({ email: data.email, password: data.password }));
    } else {
      dispatch(registerUser({ 
        fullName: data.fullName, 
        email: data.email, 
        password: data.password 
      }));
    }
  };

  // Google SVG Icon Component
  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  // Facebook SVG Icon Component
  const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
    </svg>
  );

  return (
    <AuthLayout>
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full bg-white/90 backdrop-blur-md p-5 sm:p-6 xl:p-8 rounded-[24px] shadow-2xl shadow-black/10 border border-white/50"
      >
        <div className="mb-4 xl:mb-5">
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src={logo} alt="FurryFriend Logo" className="w-12 h-12 xl:w-14 xl:h-14 object-contain drop-shadow-sm" />
              <span className="font-poppins text-xl xl:text-2xl font-bold text-primary tracking-tight mt-1">FurryFriend</span>
            </Link>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-primary hover:bg-gray-100/50 transition-colors focus:outline-none"
              title="Back to home"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
          
          <h2 className="font-poppins text-xl xl:text-2xl font-bold text-gray-800 mb-1">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-500 text-xs xl:text-sm leading-relaxed">
            {isLogin ? "Sign in to continue managing your furry friends with AI-powered care." : "Start your journey to smarter pet care today."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 xl:space-y-3">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                key="fullName"
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  label="Full Name"
                  icon={User}
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <PasswordInput
              label="Password"
              error={errors.password?.message}
              {...register('password')}
            />
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <PasswordStrength password={passwordValue} />
              </motion.div>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                key="confirmPassword"
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
                className="space-y-2.5 xl:space-y-3"
              >
                <PasswordInput
                  label="Confirm Password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                
                <div className="flex items-start gap-2.5 mt-2">
                  <div className="flex items-center h-4 mt-0.5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary/20 accent-primary cursor-pointer"
                      {...register('acceptTerms')}
                    />
                  </div>
                  <label htmlFor="terms" className="text-[11px] xl:text-xs text-gray-500 font-medium cursor-pointer leading-tight">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-xs text-red-500 mt-1">{errors.acceptTerms.message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {isLogin && (
            <div className="flex justify-end">
              <a href="#" className="text-[11px] xl:text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                Forgot password?
              </a>
            </div>
          )}

          <div className="pt-1">
            <AuthButton isLoading={isLoading} isSuccess={isSuccess}>
              {isLogin ? "Sign In" : "Create Account"}
            </AuthButton>
            {isError && (
              <p className="text-xs text-red-500 text-center mt-2">{message}</p>
            )}
          </div>
        </form>

        <p className="text-center text-gray-500 text-[11px] xl:text-xs mt-3 xl:mt-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={handleToggleMode}
            className="font-semibold text-primary hover:text-primary-hover transition-colors ml-1 focus:outline-none"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

      </motion.div>
    </AuthLayout>
  );
};

export default AuthPage;
