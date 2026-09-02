import { useState, useEffect } from 'react';

export function useWebGL() {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      // Some strict anti-fingerprinting browsers (like Brave Aggressive mode)
      // return null or an empty object instead of a real WebGLRenderingContext.
      if (!gl || typeof gl.getParameter !== 'function') {
        setSupported(false);
      }
    } catch (e) {
      setSupported(false);
    }
  }, []);

  return supported;
}
