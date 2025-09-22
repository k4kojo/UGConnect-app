import React, { useEffect, useState } from 'react';

// A thin, fixed top loading bar that progresses smoothly from 0 to 100% once when loading
const TopLoadingBar = ({ loading = false, colorClass = 'bg-blue-600', trackClass = 'bg-blue-200/50' }) => {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timeouts = [];

    if (loading && !isAnimating) {
      setIsAnimating(true);
      setProgress(0);
      
      // Progressive loading with realistic timing (fast start, slower towards end)
      const progressSteps = [
        { progress: 15, delay: 50 },
        { progress: 35, delay: 200 },
        { progress: 55, delay: 500 },
        { progress: 75, delay: 900 },
        { progress: 90, delay: 1400 },
        { progress: 95, delay: 2000 }
      ];
      
      progressSteps.forEach(({ progress: targetProgress, delay }) => {
        const timeoutId = setTimeout(() => {
          setProgress(prev => loading ? targetProgress : prev);
        }, delay);
        timeouts.push(timeoutId);
      });
      
    } else if (!loading && isAnimating) {
      // Complete the progress bar smoothly
      setProgress(100);
      
      // Hide after completion animation
      const timeoutId = setTimeout(() => {
        setProgress(0);
        setIsAnimating(false);
      }, 300);
      timeouts.push(timeoutId);
    } else if (!loading && !isAnimating) {
      // Reset immediately if not loading and not animating
      setProgress(0);
    }

    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [loading, isAnimating]);

  // When not loading and progress is 0, render nothing
  if (!loading && progress === 0 && !isAnimating) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 h-1 ${trackClass} z-50`}>
      <div
        className={`h-1 ${colorClass} transition-all duration-200 ease-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopLoadingBar;
