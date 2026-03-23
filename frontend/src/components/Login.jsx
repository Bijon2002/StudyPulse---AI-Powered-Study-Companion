import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Zap } from 'lucide-react';
import { saveUser } from '../utils/storage';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Mock authentication - in production, use Firebase
    const users = JSON.parse(localStorage.getItem('studypulse_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      saveUser(userWithoutPassword);
      onLogin(userWithoutPassword);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-blue-100"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-sky-600 bg-clip-text text-transparent mb-2">
            StudyPulse
          </h1>
          <p className="text-blue-600 font-medium">Your Smart Study Companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            Sign In
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold transition"
            >
              Sign Up
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-xs text-center">
            Demo: Use any email/password you registered with
          </p>
        </div>
      </motion.div>
    </div>
  );
}
