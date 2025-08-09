import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const ShareSphereLogo = () => {
  const [fadeIndex, setFadeIndex] = useState(0);
  const text = 'ShareSphere'.split('');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIndex((prev) => (prev + 1) % text.length);
    }, 300); // Adjust speed of wave (300ms per letter)
    return () => clearInterval(interval);
  }, [text.length]);

  return (
    <div className="flex items-center justify-center p-6">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-[pulse_2s_ease-in-out_infinite]"
      >
        <circle cx="40" cy="40" r="35" fill="url(#grad1)" />
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="url(#grad2)"
          strokeWidth="4"
          className="animate-[spin_5s_linear_infinite]"
        />
        <g className="animate-[bounce_1.5s_ease-in-out_infinite]">
          <Globe
            size={36}
            strokeWidth={2.5}
            color="#E0E0E0"
            className="transform translate-x-[22px] translate-y-[22px]"
          />
        </g>
        <path
          d="M40 15C28.9543 15 20 23.9543 20 35C20 46.0457 28.9543 55 40 55C51.0457 55 60 46.0457 60 35"
          stroke="#312E81"
          strokeWidth="5"
          strokeLinecap="round"
          className="animate-[spin_4s_linear_infinite]"
        />
        <path
          d="M40 20C31.7157 20 25 26.7157 25 35C25 43.2843 31.7157 50 40 50"
          stroke="#6B46C1"
          strokeWidth="4"
          strokeLinecap="round"
          className="animate-[spin_6s_linear_infinite_reverse]"
        />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#312E81', stopOpacity: 0.95 }} />
            <stop offset="100%" style={{ stopColor: '#6B46C1', stopOpacity: 0.95 }} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#6B46C1', stopOpacity: 0.85 }} />
            <stop offset="100%" style={{ stopColor: '#312E81', stopOpacity: 0.85 }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="ml-4 relative flex flex-col items-start">
        <div
          className="h-1 w-full bg-gradient-to-r from-indigo-900 to-purple-800 animate-[sparkle_3.3s_ease-in-out_infinite]"
          style={{ transform: 'translateY(-8px)' }}
        ></div>
        <div className="flex">
          {text.map((letter, index) => (
            <span
              key={index}
              className={`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 transition-all duration-500
                ${Math.abs((fadeIndex - index + text.length) % text.length) <= 2 ? 'opacity-0 blur-sm' : 'opacity-100'}`}
            >
              {letter}
            </span>
          ))}
        </div>
        <div
          className="h-1 mt-2 w-full bg-gradient-to-r from-purple-800 to-indigo-900 animate-[sparkle_3.3s_ease-in-out_infinite_reverse]"
          style={{ transform: 'translateY(8px)' }}
        ></div>
        <style jsx>{`
          .blur-sm {
            filter: blur(4px);
          }
          @keyframes sparkle {
            0% {
              opacity: 0.3;
              transform: translateY(-8px) scaleX(0.8);
              box-shadow: 0 0 5px rgba(107, 70, 193, 0.5);
            }
            50% {
              opacity: 1;
              transform: translateY(-8px) scaleX(1);
              box-shadow: 0 0 15px rgba(107, 70, 193, 1);
            }
            100% {
              opacity: 0.3;
              transform: translateY(-8px) scaleX(0.8);
              box-shadow: 0 0 5px rgba(107, 70, 193, 0.5);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ShareSphereLogo;