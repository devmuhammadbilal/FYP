import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, Loader } from '../Components';
import HeroSection from '../Components/Sections/HeroSection';
import toast, { Toaster } from 'react-hot-toast'; 

// 1. DEFINE THE API URL DYNAMICALLY
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const RenderCards = ({ data, title }) => {
  if (data?.length > 0) {
    return data.map((post, index) => (
      <Card key={post._id} {...post} index={index} />
    ));
  }
  return (
    <h2 className="mt-5 font-bold text-[#6469ff] text-xl uppercase col-span-full text-center">
      {title}
    </h2>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedResults, setSearchedResults] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const showcaseRef = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // 2. USE THE DYNAMIC URL HERE
        // It will use Render URL on Vercel, and Localhost on your PC
        const response = await fetch(`${API_URL}/api/v1/post`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          setAllPosts(result.data.reverse());
        } else {
          throw new Error('Failed to fetch posts');
        }
      } catch (error) {
        toast.error("Failed to load community posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchText(val);
    clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      const searchResults = allPosts.filter((item) =>
        item.name.toLowerCase().includes(val.toLowerCase()) ||
        item.prompt.toLowerCase().includes(val.toLowerCase())
      );
      setSearchedResults(searchResults);
    }, 500));
  };

  return (
    <div className="w-full bg-[#f9fafe] min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      <HeroSection onViewGallery={() => showcaseRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 mt-10 sm:mt-16" ref={showcaseRef}>
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 sm:mb-10">
          <div className="w-full md:w-auto text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#222328]">Community Showcase</h1>
            <p className="mt-2 text-[#666e75] text-sm sm:text-[16px] max-w-[500px] mx-auto md:mx-0">
              Browse through a collection of imaginative and visually stunning images.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <input
              type="text"
              name="text"
              placeholder="Search posts..."
              value={searchText}
              onChange={handleSearchChange}
              className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[#6469ff] focus:border-transparent block w-full p-3 pl-10 shadow-sm transition-all group-hover:shadow-md outline-none"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-[#666e75] text-xl mb-6 text-center md:text-left">
                Showing results for <span className="text-[#222328] font-bold">{searchText}</span>
              </h2>
            )}
            
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-[300px] grid-flow-dense" 
            >
              <RenderCards data={searchText ? searchedResults : allPosts} title="No posts found" />
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
