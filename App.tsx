import React, { useState, useEffect } from 'react';
import { Fireworks } from './components/Fireworks';
import { generateBlessing } from './services/geminiService';
import { GreetingResponse, AppState } from './types';
import { soundFX } from './utils/sound';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.CLOSED);
  const [greeting, setGreeting] = useState<GreetingResponse | null>(null);
  // Buffer for the next greeting to allow instant refresh
  const [nextGreeting, setNextGreeting] = useState<GreetingResponse | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showShareOverlay, setShowShareOverlay] = useState(false);

  // Prefetch greeting and buffer on mount
  useEffect(() => {
    // 1. Fetch the initial greeting
    generateBlessing().then(setGreeting);
    // 2. Silently fetch the next one into the buffer
    generateBlessing().then(setNextGreeting);
  }, []);

  const handleOpen = () => {
    soundFX.init(); // Unlock AudioContext
    soundFX.playPop();
    setAppState(AppState.OPENING);

    setTimeout(() => {
      setAppState(AppState.OPENED);
      soundFX.playSparkle();
    }, 800);
  };

  const handleRefresh = async () => {
    soundFX.playPop();

    if (nextGreeting) {
      // Fast path: Use the pre-fetched greeting immediately
      setGreeting(nextGreeting);
      soundFX.playSparkle();
      
      // Clear buffer and fetch the *next* next one in background
      setNextGreeting(null);
      generateBlessing().then(setNextGreeting);
    } else {
      // Slow path: Buffer empty (clicked too fast), fetch normally
      setLoading(true);
      const newGreeting = await generateBlessing();
      setGreeting(newGreeting);
      setLoading(false);
      soundFX.playSparkle();
      
      // Try to fill buffer again
      generateBlessing().then(setNextGreeting);
    }
  };

  const handleShare = () => {
    const ua = navigator.userAgent.toLowerCase();
    const isWeChatOrQQ = ua.indexOf('micromessenger') !== -1 || ua.indexOf('qq/') !== -1;
    const currentUrl = window.location.href;
    const isValidUrl = currentUrl.startsWith('http');

    if (navigator.share && !isWeChatOrQQ && isValidUrl) {
      navigator.share({
        title: greeting?.title || "新年快乐",
        text: greeting?.lines ? greeting.lines.join('\n') : "祝你新年快乐，万事如意！",
        url: currentUrl,
      }).catch((err) => {
        console.error("Share failed:", err);
        // If share fails (e.g. user canceled or not supported despite check), show overlay as fallback
        setShowShareOverlay(true);
      });
    } else {
      setShowShareOverlay(true);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#2a0a0a] overflow-hidden flex flex-col items-center justify-center text-yellow-100">
      <Fireworks active={appState === AppState.OPENED} />
      
      {/* Background Decor: Lanterns */}
      <div className="absolute top-0 left-4 w-16 h-24 bg-red-800 rounded-b-xl opacity-80 animate-float z-10 border-t-4 border-yellow-600 shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center justify-center">
        <span className="text-yellow-400 font-calligraphy text-2xl">福</span>
        <div className="absolute -bottom-8 left-1/2 w-1 h-8 bg-yellow-600 -translate-x-1/2"></div>
      </div>
      <div className="absolute top-0 right-4 w-16 h-24 bg-red-800 rounded-b-xl opacity-80 animate-float z-10 border-t-4 border-yellow-600 shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center justify-center" style={{ animationDelay: '1s' }}>
        <span className="text-yellow-400 font-calligraphy text-2xl">春</span>
        <div className="absolute -bottom-8 left-1/2 w-1 h-8 bg-yellow-600 -translate-x-1/2"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 w-full max-w-md px-6">
        
        {/* State: CLOSED - The Red Envelope */}
        {appState === AppState.CLOSED && (
          <div 
            onClick={handleOpen}
            className="cursor-pointer transform transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="relative bg-gradient-to-b from-red-600 to-red-800 w-64 h-96 mx-auto rounded-xl shadow-2xl border-2 border-red-400 overflow-hidden group">
              {/* Envelope Flap */}
              <div className="absolute top-0 left-0 w-full h-32 bg-red-700 rounded-b-[100%] shadow-lg border-b-2 border-red-900 z-20 flex items-center justify-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-glow">
                   <span className="text-red-800 font-bold text-xl">開</span>
                </div>
              </div>

              {/* Envelope Body Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-10">
                <h1 className="font-calligraphy text-5xl text-yellow-300 drop-shadow-md mb-2">新年快乐</h1>
                <p className="text-red-200 text-sm tracking-widest uppercase opacity-80">Tap to Open</p>
              </div>
            </div>
          </div>
        )}

        {/* State: OPENING - Animation placeholder if needed, mostly handled by CSS transition logic */}
        
        {/* State: OPENED - The Card */}
        {appState === AppState.OPENED && (
           <div className="animate-fade-in-up transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
             <div className="bg-[#fff1e6] text-red-900 p-8 rounded-lg shadow-[0_0_50px_rgba(251,191,36,0.4)] border-4 border-yellow-600 relative overflow-hidden">
                {/* Decorative corners */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-red-800"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-red-800"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-red-800"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-red-800"></div>

                {/* Content */}
                <div className="text-center relative z-10">
                  <div className="mb-6">
                    <div className="inline-block w-20 h-20 bg-red-800 rounded-full flex items-center justify-center text-4xl text-yellow-300 font-calligraphy shadow-lg mb-2">
                       {greeting ? greeting.luckyWord : "福"}
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 mt-2 font-serif tracking-widest border-b-2 border-red-200 inline-block pb-1">
                      {greeting ? greeting.title : "吉祥如意"}
                    </h2>
                  </div>

                  <div className="space-y-3 mb-8">
                    {greeting ? (
                      greeting.lines.map((line, idx) => (
                        <p key={idx} className="text-xl font-medium tracking-widest text-red-900 font-serif" style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.2}s backwards` }}>
                          {line}
                        </p>
                      ))
                    ) : (
                      <p className="animate-pulse text-red-500">正在祈福中...</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleRefresh}
                      disabled={loading}
                      className="w-full bg-red-800 hover:bg-red-700 text-yellow-200 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 border border-yellow-600/30"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 text-yellow-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <span className="text-lg">🎲</span>
                          <span>再求一签</span>
                        </>
                      )}
                    </button>

                    <button 
                      onClick={handleShare}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-red-900 py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2 border border-red-900/10"
                    >
                      <span className="text-lg">🧧</span>
                      <span>分享给好友 (微信/QQ)</span>
                    </button>
                  </div>
                </div>
                
                {/* Background watermark */}
                <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                  <span className="font-calligraphy text-9xl text-red-900 rotate-12">龙</span>
                </div>
             </div>
           </div>
        )}
      </div>

      {/* Share Overlay */}
      {showShareOverlay && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex flex-col items-end p-8 animate-fade-in"
          onClick={() => setShowShareOverlay(false)}
        >
          <div className="mr-4 mb-4 animate-bounce">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6" />
              <path d="M10 14L21 3" />
            </svg>
          </div>
          <div className="text-white text-xl font-bold text-right space-y-2 leading-relaxed">
            <p>点击右上角 <span className="text-2xl">...</span></p>
            <p>选择 <span className="text-yellow-400">发送给朋友</span></p>
            <p>或 <span className="text-yellow-400">分享到朋友圈</span></p>
            <p className="text-sm font-normal text-gray-300 mt-4">把这份好运传递下去！</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}