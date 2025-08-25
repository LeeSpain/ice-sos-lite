import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useFreeTrialPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show on homepage
    if (location.pathname !== '/') {
      return;
    }

    // Check if user has already seen or completed trial signup
    const hasSeenPopup = localStorage.getItem('icesostrequest-trial-popup-seen');
    const hasSignedUp = localStorage.getItem('icesostrequest-trial-signup');
    
    if (hasSeenPopup || hasSignedUp) {
      return;
    }

    // Show popup after 5 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
      localStorage.setItem('icesostrequest-trial-popup-seen', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return {
    showPopup,
    closePopup
  };
};