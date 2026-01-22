import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import fairies from '../../assets/herosecimg/fairies.png';
import comic_book from '../../assets/herosecimg/comic_book_cover.png';
import astronomer_cat from '../../assets/herosecimg/astronomer_cat.png';
import popart from '../../assets/herosecimg/popart.png';
import tropicalfish from '../../assets/herosecimg/tropical_fish.png';

const HeroSection = ({ onViewGallery }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const sampleImages = [fairies, comic_book, tropicalfish, popart, astronomer_cat];

  const features = [
    { icon: '🚀', title: 'Real-Time', desc: 'Collaborate instantly' },
    { icon: '🎨', title: 'AI Power', desc: 'DALL-E 3 Integration' },
    { icon: '✨', title: 'Creative', desc: 'Unlimited styles' },
    { icon: '🛡️', title: 'Secure', desc: 'Private rooms' },
  ];

  // Auto-rotate images in the grid
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentImage((prev) => (prev + 1) % sampleImages.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [sampleImages.length, isHovered]);

  return (
    // UPDATED: Adjusted padding for mobile (pt-20 pb-8) vs desktop (lg:pt-24 lg:pb-12)
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f9fafe] pt-20 pb-8 lg:pt-24 lg:pb-12">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* UPDATED: Responsive blob sizes (w-[300px] on mobile) */}
        <div className="absolute top-[-10%] left-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[20%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] animate-blob animation-delay-4000"></div>
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* LEFT: Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Professional Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm mb-6 transition-transform hover:scale-105 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-600 tracking-wide uppercase">Now with Multiplayer</span>
            </div>

            {/* Heading - UPDATED: text-3xl for mobile */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
              Dream it. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600">
                Create it Together.
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              The world's first collaborative AI art studio. Join a room, brainstorm prompts with friends, and generate visuals in real-time.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <button 
                onClick={() => navigate('/create-post')}
                className="group px-6 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-base shadow-xl shadow-indigo-500/20 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Start Creating</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </button>
              
              <button
                onClick={onViewGallery}
                className="px-6 py-3.5 rounded-2xl bg-white text-gray-700 font-bold text-base border border-gray-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
              >
                Explore Gallery
              </button>
            </div>
            
            {/* Features Mini Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-200 pt-6">
              {features.map((feature, index) => (
                <div key={index} className="text-left group cursor-default flex flex-col items-center sm:items-start">
                  <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* RIGHT: Interactive Image Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 flex justify-center perspective-1000 mt-6 lg:mt-0"
          >
            <div 
              className="relative w-full max-w-lg bg-white/50 backdrop-blur-sm p-3 sm:p-4 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/60"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Grid Container - UPDATED: h-[280px] for mobile */}
              <div className="image-grid-enhanced h-[280px] sm:h-[380px] w-full gap-2 sm:gap-3">
                {sampleImages.map((image, index) => (
                  <div 
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`
                      image-enhanced image-${index+1} 
                      ${currentImage === index ? 'ring-2 sm:ring-4 ring-indigo-500 ring-offset-2 z-10 scale-[1.02] shadow-lg' : 'opacity-90 hover:opacity-100'}
                    `}
                    style={{backgroundImage: `url(${image})`}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                  </div>
                ))}
              </div>

              {/* Floating "Online Users" Card - Kept hidden on small mobile, visible on sm+ */}
              <div className="absolute -right-2 sm:-right-4 -bottom-4 sm:-bottom-6 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 hidden sm:block animate-float z-20">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-yellow-200 border-2 border-white flex items-center justify-center text-xs">🐱</div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-xs">🐶</div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-xs">🦊</div>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-gray-800">1k+ Creators</p>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Online now
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Styles for Grid and Animations */}
      <style jsx>{`
        .image-grid-enhanced {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
        }
        .image-enhanced {
          border-radius: 12px;
          background-size: cover;
          background-position: center;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          width: 100%;
          height: 100%;
        }
        @media (min-width: 640px) {
          .image-enhanced {
            border-radius: 16px;
          }
        }
        .image-1 { grid-area: 1 / 1 / 3 / 2; }
        .image-2 { grid-area: 1 / 2 / 2 / 3; }
        .image-3 { grid-area: 1 / 3 / 2 / 4; }
        .image-4 { grid-area: 2 / 2 / 3 / 3; }
        .image-5 { grid-area: 2 / 3 / 3 / 4; }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;