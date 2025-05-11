import React, { useEffect } from 'react';

// Auto-slide effect
useEffect(() => {
    const interval = setInterval(() => {
        moveSlide(1);
    }, 10000); // Mengubah interval menjadi 10000 ms (10 detik)
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
}, [currentSlide]); 