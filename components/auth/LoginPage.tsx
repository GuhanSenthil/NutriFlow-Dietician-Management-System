import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { AppUser, Role } from '../../types';
import { api } from '../../services/api';
import Button from '../common/Button';
import Icon from '../common/Icon';

type AuthMode = 'signin' | 'signup';
type SelectedRole = Role.PATIENT | Role.DIETICIAN | Role.ADMIN;

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(Role.PATIENT);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const { showToast } = useToast();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1920&q=80',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, [images.length]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.signIn(email, password);
      if (user.role !== selectedRole) {
          throw new Error(`Please login via the ${user.role.toLowerCase()} tab.`);
      }
      setUser(user);
      showToast('Signed in successfully!', 'success');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (selectedRole === Role.ADMIN) {
        showToast('Admin registration is not allowed.', 'error');
        return;
    }
    setLoading(true);
    try {
      const newUser = await api.signUp(name, email, password, selectedRole as Role.PATIENT | Role.DIETICIAN);
      setUser(newUser);
      showToast('Account created successfully!', 'success');
    // FIX: Corrected syntax for the catch block by removing the arrow function '=>'.
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleTabs: SelectedRole[] = [Role.PATIENT, Role.DIETICIAN, Role.ADMIN];
  const sampleCredentials = {
      [Role.PATIENT]: 'alice@nutriflow.com',
      [Role.DIETICIAN]: 'emily@nutriflow.com',
      [Role.ADMIN]: 'admin@nutriflow.com'
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image Slideshow */}
      {images.map((src, index) => (
          <div
              key={src}
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
              style={{
                  backgroundImage: `url(${src})`,
                  opacity: index === currentImageIndex ? 1 : 0,
                  zIndex: 0,
              }}
          />
      ))}
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      <div className="max-w-md w-full space-y-8 z-20">
        <div>
           <div className="flex items-center justify-center space-x-3 mb-4">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12">
              <defs>
                <radialGradient id="appleGradient-login" cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EA580C" />
                </radialGradient>
                <linearGradient id="leafGradient-login" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <filter id="shadow-login" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="2.5" floodColor="#000" floodOpacity="0.25" />
                </filter>
              </defs>
              <g filter="url(#shadow-login)">
                <path d="M 80,55 C 80,75 65,90 50,90 C 35,90 20,75 20,55 C 20,35 35,20 50,20 C 53,20 65,20 80,35 C 90,40 80,45 80,55 Z" fill="url(#appleGradient-login)" />
                <path d="M 50,22 C 45,22 42,27 50,27 C 58,27 55,22 50,22 Z" fill="#C2410C" />
                <path d="M 50,88 C 47,88 45,85 50,85 C 55,85 53,88 50,88 Z" fill="#C2410C" />
                <path d="M 50,22 C 50,15 55,10 60,8 L 62,15 C 57,17 52,20 50,22 Z" fill="#78350F" />
                <path d="M 60,18 C 75,5 85,15 70,25 Z" fill="url(#leafGradient-login)" />
              </g>
            </svg>
            <span className="text-4xl font-bold text-white">NutriFlow</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </h2>
        </div>

        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-200 rounded-full p-1 flex space-x-1">
              <button onClick={() => setMode('signin')} className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'signin' ? 'bg-white shadow' : 'text-gray-600'}`}>Sign In</button>
              <button onClick={() => setMode('signup')} className={`px-6 py-2 rounded-full text-sm font-medium ${mode === 'signup' ? 'bg-white shadow' : 'text-gray-600'}`}>Sign Up</button>
            </div>
          </div>
          
          <div className="mb-4">
              <div className="flex border-b">
                  {roleTabs.map(role => (
                      <button 
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`flex-1 py-2 text-center text-sm font-medium border-b-2 ${selectedRole === role ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        disabled={mode === 'signup' && role === Role.ADMIN}
                      >
                          {role.charAt(0) + role.slice(1).toLowerCase()}
                      </button>
                  ))}
              </div>
          </div>

          <form className="space-y-6" onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}>
            {mode === 'signup' && (
              <div className="relative">
                <input id="name" name="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary-600 bg-transparent" placeholder="John Doe" />
                <label htmlFor="name" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Full Name</label>
              </div>
            )}
            
            <div className="relative">
                <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary-600 bg-transparent" placeholder="john@doe.com" />
                <label htmlFor="email-address" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Email address</label>
            </div>

            <div className="relative">
                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary-600 bg-transparent" placeholder="Password" />
                <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Password</label>
            </div>

            {mode === 'signup' && (
              <div className="relative">
                <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-primary-600 bg-transparent" placeholder="Confirm Password" />
                <label htmlFor="confirm-password" className="absolute left-0 -top-3.5 text-gray-600 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Confirm Password</label>
              </div>
            )}
            
            {mode === 'signin' && (
                <div className="text-xs text-gray-500">
                    <p>Sample login: <code className="bg-gray-100 p-1 rounded">{sampleCredentials[selectedRole]}</code></p>
                    <p>Password: <code className="bg-gray-100 p-1 rounded">password</code></p>
                </div>
            )}

            <div>
              <Button type="submit" isLoading={loading} className="w-full">
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;