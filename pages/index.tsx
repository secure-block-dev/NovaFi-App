import dynamic from 'next/dynamic';
import React from 'react';

const SPA = dynamic(() => import('../src/App'), { ssr: false });

export default function IndexPage() {
  return <SPA />;
}
