
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
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
    onLogin(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ perspective: '1000px' }}>
      <div
        className={`w-full max-w-md p-8 transition-transform duration-1000 transform-style-preserve-3d ${isRotated ? 'animate-rotate-in' : 'opacity-0'}`}
      >
        <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-400/30">
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl opacity-20 blur-xl -z-10"></div>
          <div className="p-8">
            <h2 className="text-4xl font-bold text-center text-white mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transform hover:scale-105 transition-all duration-300"
              >
                SUBMIT
              </button>
               {error && <p className="text-red-400 text-sm mt-4 text-left">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
