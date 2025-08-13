import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

interface AttemptRecord {
  count: number;
  lastAttempt: number;
}

const useRateLimit = (key: string, config: RateLimitConfig) => {
  const [attempts, setAttempts] = useState<AttemptRecord>({ count: 0, lastAttempt: 0 });

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAttempt = now - attempts.lastAttempt;
    
    // Reset counter if window has passed
    if (timeSinceLastAttempt > config.windowMs) {
      setAttempts({ count: 0, lastAttempt: 0 });
      return false;
    }
    
    return attempts.count >= config.maxAttempts;
  }, [attempts, config]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    setAttempts(prev => ({
      count: prev.count + 1,
      lastAttempt: now
    }));
  }, []);

  const getRemainingTime = useCallback(() => {
    if (!isRateLimited()) return 0;
    
    const now = Date.now();
    const timeRemaining = config.windowMs - (now - attempts.lastAttempt);
    return Math.max(0, Math.ceil(timeRemaining / 1000)); // Return seconds
  }, [attempts, config, isRateLimited]);

  const reset = useCallback(() => {
    setAttempts({ count: 0, lastAttempt: 0 });
  }, []);

  return {
    isRateLimited: isRateLimited(),
    recordAttempt,
    getRemainingTime: getRemainingTime(),
    reset,
    attemptsRemaining: Math.max(0, config.maxAttempts - attempts.count)
  };
};

export default useRateLimit;