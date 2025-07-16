import { useEffect, useState } from 'react';

interface IntroScreenProps {
  onComplete: () => void;
}

const IntroScreen = ({ onComplete }: IntroScreenProps) => {
  const [text, setText] = useState('');
  const [showScreen, setShowScreen] = useState(true);
  const fullText = 'Your FBA Profit Calculator is loading...';

  useEffect(() => {
    // Typewriter effect
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);

    // Auto-hide after 4 seconds
    const hideTimer = setTimeout(() => {
      setShowScreen(false);
      setTimeout(onComplete, 1000); // Wait for fade out animation
    }, 4000);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!showScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary to-emerald-600 transition-opacity duration-1000 ease-in-out opacity-0" />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center transition-opacity duration-1000 ease-in-out">
      <div className="text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <span className="text-3xl">📊</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-scale-in">
          Amazon FBA
        </h1>
        
        <div className="text-xl md:text-2xl text-white/90 h-8 flex items-center justify-center">
          <span className="font-mono">{text}</span>
          <span className="animate-pulse ml-1">|</span>
        </div>
        
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-0"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-400"></div>
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;