import '../src/App.css';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  // This file intentionally minimal; pages will mount the SPA client-only.
  return <Component {...pageProps} />;
}
