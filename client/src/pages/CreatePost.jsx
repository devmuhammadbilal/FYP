import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { preview } from '../assets';
import { getRandomPrompt, downloadImage } from '../utils';
import { Loader } from '../Components';
import toast, { Toaster } from 'react-hot-toast';

const CreatePost = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  const [form, setForm] = useState({ name: userName, prompt: '', photo: '', userId: userId });
  
  // Track ID of the image once it's auto-saved
  const [currentPostId, setCurrentPostId] = useState(null);
  
  const [generatingImage, setGeneratingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState('');

  const updatePromptWithStyle = (newStyle) => {
    const promptWithoutStyle = form.prompt.replace(/ - \[.*?\]$/, '');
    setForm((prev) => ({ ...prev, prompt: `${promptWithoutStyle} - [${newStyle}]` }));
  };

  // --- GENERATE & AUTO-SAVE ---
  const generateImage = async () => {
    if (form.prompt) {
      const loadingToast = toast.loading('Dreaming up your image...'); 
      
      try {
        setGeneratingImage(true);
        
        // 1. Generate Image via DALL-E
        const response = await fetch('http://localhost:8080/api/v1/dalle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: form.prompt }),
        });
        
        const data = await response.json();

        if(!response.ok) throw new Error(data.message || "Generation failed");

        const generatedPhoto = `data:image/jpeg;base64,${data.photo}`;
        setForm({ ...form, photo: generatedPhoto });

        // 2. AUTO-SAVE to Database immediately
        await autoSaveToDatabase(generatedPhoto);

        toast.success('Masterpiece created & saved!', { id: loadingToast });

      } catch (error) {
        toast.error(`Error: ${error.message}`, { id: loadingToast });
      } finally {
        setGeneratingImage(false);
      }
    } else {
      toast.error('Please enter a prompt first');
    }
  };

  // Helper function to save to DB
  const autoSaveToDatabase = async (photoData) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photo: photoData }), 
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentPostId(result.data._id);
        console.log("Image auto-saved to DB with ID:", result.data._id);
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  // --- SHARE WITH COMMUNITY ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentPostId) {
      setLoading(true);
      const loadingToast = toast.loading('Sharing with community...');

      try {
        await fetch('http://localhost:8080/api/v1/post/post/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: currentPostId }),
        });
        
        toast.success('Shared successfully!', { id: loadingToast });
        
        setTimeout(() => {
          navigate('/');
        }, 1500);

      } catch (err) {
        toast.error('Failed to share post', { id: loadingToast });
      } finally {
        setLoading(false);
      }
    } else {
      toast.error('Please generate an image first');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
    toast('Prompt randomized!', { icon: '🎲', duration: 1500 });
  };

  return (
    // UPDATED: Adjusted padding (pt-24) for mobile
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 pt-24 sm:pt-28">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="mb-8 sm:mb-10 text-center sm:text-left">
        {/* UPDATED: Responsive font size (text-3xl sm:text-4xl) */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Masterpiece</span></h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-xl mx-auto sm:mx-0">Unleash your creativity with AI. Images are saved to your profile automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Panel: Controls */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 sm:p-8 shadow-xl h-fit order-2 lg:order-1"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Prompt Input */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="block text-sm font-bold text-gray-700">Prompt</label>
                <button type="button" onClick={handleSurpriseMe} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-semibold hover:bg-indigo-200 transition">
                  Surprise Me
                </button>
              </div>
              <textarea
                rows={3}
                name="prompt"
                placeholder="A futuristic cyborg exploring neon streets..."
                value={form.prompt}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-4 resize-none shadow-sm"
              />
            </div>

            {/* Style Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Art Style</label>
              <select
                value={style}
                onChange={(e) => {
                  setStyle(e.target.value);
                  updatePromptWithStyle(e.target.value);
                }}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 block p-3 shadow-sm outline-none"
              >
                <option value="">No Style (Raw)</option>
                {['Realistic', 'Cyberpunk', 'Cartoon', '3D Render', 'Oil Painting', 'Watercolor', 'Pop Art', 'Surrealism', 'Vintage'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons - UPDATED: Stack on mobile (flex-col) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <button
                type="button"
                onClick={generateImage}
                disabled={generatingImage}
                className="flex-1 bg-gray-900 text-white font-semibold rounded-xl py-3.5 hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
              >
                {generatingImage ? 'Generating...' : 'Generate & Save'}
              </button>
              
              <button
                type="submit"
                disabled={loading || !currentPostId}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold rounded-xl py-3.5 hover:opacity-90 transition shadow-lg disabled:opacity-50"
              >
                {loading ? 'Sharing...' : 'Share with Community'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Panel: Preview - UPDATED: Order 1 on mobile so user sees image immediately if exists, responsive height */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          // UPDATED: min-h-[300px] instead of fixed h-[400px] for better mobile scaling
          className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-4 shadow-lg flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:h-auto relative group order-1 lg:order-2"
        >
          {form.photo ? (
            <>
              <img src={form.photo} alt={form.prompt} className="w-full h-full object-contain rounded-2xl shadow-sm" />
              
              {/* DOWNLOAD BUTTON */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  type="button"
                  onClick={() => {
                    downloadImage(`generated-${Date.now()}`, form.photo);
                    toast.success('Download started');
                  }}
                  className="bg-white/90 backdrop-blur text-gray-700 p-2 sm:p-3 rounded-xl shadow-lg hover:bg-white hover:text-indigo-600 transition-colors"
                  title="Download Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5M8.25 12.75L12 16.5l3.75-3.75" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <img src={preview} alt="preview" className="w-20 h-20 sm:w-24 sm:h-24 object-contain opacity-40 mx-auto mb-4" />
              <p className="text-sm sm:text-base">Preview will appear here</p>
            </div>
          )}

          {generatingImage && (
            <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center backdrop-blur-sm">
              <Loader />
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
};

export default CreatePost;
