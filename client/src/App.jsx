import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom';
import { CreatePost, Home, Profile, CollabRoom } from './pages';
import { Login, ProtectedRoute, Register, ForgotPassword } from './Components'; 

const App = ({ isLoggedIn, userName, handleLoginSuccess }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    handleLoginSuccess(false, ''); 
    navigate("/");
    window.location.reload();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-white/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* LOGO SECTION */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Text hidden on mobile to save space, visible on tablet+ */}
            <span className="hidden sm:block font-bold text-xl tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
              ImageGenie
            </span>
          </Link>

          {/* ACTIONS SECTION */}
          <div className="flex items-center gap-2 sm:gap-6">
            
            {/* UPDATED: Removed Icon, Text is now visible on ALL screens */}
            <Link 
              to="/collab" 
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-2 py-2 rounded-lg hover:bg-gray-50"
            >
              Collab Room
            </Link>

            {/* CREATE BUTTON */}
            <Link to="/create-post" className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-3 py-2 sm:px-5 sm:py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-gray-900/20 hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              <span>Create</span>
            </Link>

            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white hover:ring-indigo-100 transition-all"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {userName.charAt(0).toUpperCase()}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-fade-in-down transform origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                    >
                      Your Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const AppWrapper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const handleLoginSuccess = (userName) => {
    setIsLoggedIn(true);
    setUserName(userName);
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('userName');
    if (token && username) {
      setIsLoggedIn(true);
      setUserName(username);
    }
  }, []);

  return (
    <BrowserRouter>
      <App isLoggedIn={isLoggedIn} userName={userName} handleLoginSuccess={handleLoginSuccess} />
      
      <main className="w-full bg-[#f9fafe] min-h-screen"> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login handleLoginSuccess={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/collab" element={<ProtectedRoute><CollabRoom /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default AppWrapper;