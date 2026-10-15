import React, { useEffect, useRef, useState } from 'react';
import { createEcLogo } from './ecLogoScene';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

// The 3D EC monogram for the home intro. The scene lives in ecLogoScene.js; this
// shell mounts it, and falls back to the flat favicon if WebGL is unavailable.
export default function EcLogo3D({ className = '' }) {
  const stageRef = useRef(null);
  const [supported] = useState(hasWebGL);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !supported) return undefined;
    const logo = createEcLogo(stage);
    return () => logo.dispose();
  }, [supported]);

  if (!supported) {
    return <img src="/icons/favicon-192x192.png" alt="" aria-hidden className={`${className} object-contain object-left`} />;
  }
  return (
    <div
      ref={stageRef}
      role="img"
      aria-label="EC monogram"
      title="Click me"
      className={`${className} cursor-pointer select-none`}
    />
  );
}
