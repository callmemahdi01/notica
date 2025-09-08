// src/components/SplashScreen.jsx

import React, { useState, useEffect, useCallback } from 'react';

const SplashScreen = ({ onSplashEnd }) => {
  const [showApp, setShowApp] = useState(false);

  const handleSplashEnd = useCallback(() => {
    setShowApp(true);
    if (onSplashEnd) onSplashEnd();
  }, [onSplashEnd]);

  useEffect(() => {
    const timer = setTimeout(handleSplashEnd, 1500);

    return () => clearTimeout(timer);
  }, [handleSplashEnd]);

  if (showApp) return null;

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: "Vazirmatn", sans-serif;
          overflow: hidden;
          height: 100vh;
          direction: rtl;
        }

        #splash {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          z-index: 9999;
          animation: fadeOut 0.5s ease forwards;
          animation-delay: 2.5s;
        }

        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
          opacity: 0;
          animation: fadeInUp 1.1s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }

        .text-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 1.3rem;
          margin-top: 15px;
          color: #fff;
          justify-content: center;
          overflow: hidden;
          direction: ltr;
        }
        
        .word {
          transform: translateY(100%);
          opacity: 0;
          animation: rise 0.6s ease forwards;
        }
        
        @keyframes rise {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .word:nth-child(1) { animation-delay: 0.1s; }
        .word:nth-child(2) { animation-delay: 0.3s; }
        .word:nth-child(3) { animation-delay: 0.5s; }
        .word:nth-child(4) { animation-delay: 0.7s; }
        .word:nth-child(5) { animation-delay: 0.9s; }
        .word:nth-child(6) { animation-delay: 1.1s; }
      `}</style>
      
      <div id="splash">
        <div className="logo">Notica</div>
        <div className="text-container">
          <span className="word">the</span>
          <span className="word">key</span>
          <span className="word">to</span>
          <span className="word">unlock</span>
          <span className="word">your</span>
          <span className="word">exam.</span>
        </div>
      </div>
    </>
  );
};

export default SplashScreen;