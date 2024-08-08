// utils/timeout.js
export const withTimeout = (promise, ms) => {
    let timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
  
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
  };
  