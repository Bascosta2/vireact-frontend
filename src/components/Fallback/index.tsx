import React, { useEffect, useState } from "react";

function Fallback() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Simulate progress increase
    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 80) {
          return prev + 1; // ramp up until 80%
        }
        return prev;
      });
    }, 50); // adjust speed here

    return () => {
      clearInterval(interval);
      // when unmounted (content loaded), snap to 100%
      setProgress(100);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center gap-6 w-64 animate-fadeIn">
        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-[var(--color-dark-secondary)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage + Brand Text */}
        <p className="text-gradient-primary font-heading text-xl tracking-wide">
          {progress}%
        </p>
      </div>
    </div>
  );
}

export default Fallback;
