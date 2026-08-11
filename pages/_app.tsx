import '../src/App.css';
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
