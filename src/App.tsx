import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { Buffer } from "buffer";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingNavbar from "./components/landing/Navbar";
import LandingFooter from "./components/landing/Footer";
import { NetworkGuard } from "./components/NetworkGuard";

type AppProps = {
  children?: ReactNode;
};

const landingRoutes = ["/", "/trading", "/about"];

const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

const LandingLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-nova-bg text-nova-text">
    <LandingNavbar />
    <main>{children}</main>
    <LandingFooter />
  </div>
);

function App({ children }: AppProps) {
  const router = useRouter();
  const isLandingRoute = landingRoutes.includes(router.pathname);

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Buffer) {
      (window as any).Buffer = Buffer;
    }
  }, []);

  return (
    <>
      <NetworkGuard />
      <div className="relative w-full overflow-x-hidden min-h-screen" id="dashboard">
        {isLandingRoute ? <LandingLayout>{children}</LandingLayout> : <Layout>{children}</Layout>}
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
