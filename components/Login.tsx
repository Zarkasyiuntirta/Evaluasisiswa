
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error: string;
  isExiting: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, error, isExiting }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    // Trigger the rotation animation shortly after the component mounts
    const timer = setTimeout(() => setIsRotated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExiting) return; // Prevent multiple submissions during animation
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden perspective-container" style={{ perspective: '1000px' }}>
      <div
        className={`w-full max-w-md transition-all duration-1000 transform-style-preserve-3d 
          ${isRotated ? 'animate-rotate-in' : 'opacity-0'}
          ${isExiting ? 'animate-warp-out' : ''}`}
      >
        <div className="relative">
          {/* Colorful, pulsating glow for the "light on/off" effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-75 blur-xl -z-10 animate-pulse"></div>
          
          <div className="relative bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/30 ring-1 ring-white/10">
            <div className="p-8">
              {/* Colorful gradient text for the title */}
              <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 mb-2 drop-shadow-[0_0_10px_rgba(200,150,255,0.7)]">
                EVALUATION
              </h2>
              <p className="text-center text-cyan-200 mb-8">Student Dashboard</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-[length:200%_auto] rounded-lg hover:bg-right focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transform hover:scale-105 transition-all duration-500"
                >
                  SUBMIT
                </button>
                 {error && <p className="text-red-400 text-sm mt-4 text-left">{error}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
