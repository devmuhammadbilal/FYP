import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Card, Loader } from '../Components'; 
import toast, { Toaster } from 'react-hot-toast'; 

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) { 
          setLoading(false); 
          return; 
        }

        const { data } = await axios.get('http://localhost:8080/api/v1/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(data.user);
        // Reverse posts to show newest first, matching Home feed
        setUserPosts(data.posts.reverse()); 
        
      } catch (error) {
        console.error(error);
        toast.error("Failed to load profile data"); 
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Professional Loading State
  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-20 pt-32 text-gray-500 text-lg">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    // UPDATED: Adjusted padding (pt-24 p-4) for mobile
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl pt-24 sm:pt-32">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Glass Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        // UPDATED: Responsive padding (p-6 sm:p-8)
        className="rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12 flex flex-col md:flex-row items-center gap-6"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-lg flex-shrink-0">
          {userData.username[0].toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          {/* UPDATED: Responsive font size (text-3xl sm:text-4xl) */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{userData.username}</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">{userData.email}</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
            {userPosts.length} Creations
          </div>
        </div>
      </motion.div>

      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 pl-2 border-l-4 border-indigo-500">My Collection</h3>
      
      {userPosts.length > 0 ? (
        // --- UPDATED GRID LAYOUT ---
        // UPDATED: gap-4 for mobile, gap-6 for desktop
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[300px] grid-flow-dense"
        >
          {userPosts.map((post, index) => (
            <Card key={post._id} {...post} index={index} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">You haven't created any magic yet.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
