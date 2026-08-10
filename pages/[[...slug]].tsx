import dynamic from 'next/dynamic';
import React from 'react';

// Catch-all route to let the client-side router handle SPA routes
const SPA = dynamic(() => import('../src/App'), { ssr: false });

export default function CatchAll() {
  return <SPA />;
}
