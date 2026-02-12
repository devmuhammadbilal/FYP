import React from 'react';
import { motion } from 'framer-motion';
import { downloadImage } from '../utils';
import toast from 'react-hot-toast'; 

const Card = ({ _id, name, prompt, photo, index }) => {
  
  // Logic: 
  // Pattern repeats every 10 items (5 items per block)
  // Index 0, 10, 20... -> Big Left
  // Index 5, 15, 25... -> Big Right
  
  const isBigLeft = index % 10 === 0;
  const isBigRight = index % 10 === 5;

  // Determine classes based on position
  // UPDATED: Added min-height classes for Mobile so cards aren't too short
  let spanClasses = 'col-span-1 row-span-1 min-h-[280px]';
  
  if (isBigLeft) {
    // Mobile: Standard width, Taller height | Desktop: 2x2 Grid
    spanClasses = 'col-span-1 lg:col-span-2 lg:row-span-2 min-h-[320px] lg:min-h-auto';
  } else if (isBigRight) {
    // Mobile: Standard width | Desktop: 2x2 Grid + Force Column Start
    spanClasses = 'col-span-1 lg:col-span-2 lg:row-span-2 lg:col-start-3 min-h-[320px] lg:min-h-auto';
  }

  // --- FIX FOR MIXED CONTENT WARNINGS ---
  // Ensure the photo URL uses https if it's currently http
  const securePhoto = photo?.replace("http://", "https://");

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`
        group relative rounded-2xl shadow-sm hover:shadow-xl overflow-hidden bg-white border border-gray-100 cursor-pointer
        ${spanClasses} 
      `}
      // UPDATED: Add touch support for mobile overlay toggle
      onClick={() => {}} 
    >
      <div className="w-full h-full overflow-hidden bg-gray-100">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full object-cover block"
          src={securePhoto} // <--- UPDATED: Uses the secure HTTPS URL
          alt={prompt}
          loading="lazy"
        />
      </div>
      
      {/* Modern Gradient Overlay */}
      {/* UPDATED: Added focus-within and active classes for better mobile touch response */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
        
        <div className="transform translate-y-4 group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium line-clamp-3 leading-relaxed drop-shadow-md">
            {prompt}
          </p>

          <div className="mt-4 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white/20">
                {name[0].toUpperCase()}
              </div>
              <p className="text-white text-xs font-semibold tracking-wide drop-shadow-sm">{name}</p>
            </div>
            
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation(); 
                downloadImage(_id, photo);
                toast.success('Download started'); 
              }}
              // UPDATED: active:scale-95 for button press feedback on mobile
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white text-white hover:text-indigo-600 active:scale-95 transition-all duration-200 shadow-sm"
              title="Download Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5M8.25 12.75L12 16.5l3.75-3.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;
