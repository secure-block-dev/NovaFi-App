import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { Buffer } from "buffer";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingNavbar from "./components/landing/Navbar";
import LandingFooter from "./components/landing/Footer";
import BackToTopButton from "./components/landing/BackToTopButton";
import { NetworkGuard } from "./components/NetworkGuard";

type AppProps = {
  children?: ReactNode;
};

const landingRoutes = ["/", "/trading", "/about"];
const publicRoutes = ["/", "/login", "/about", "/trading", "/cookies", "/privacy-policy", "/terms-conditions"];
const protectedRoutes = ["/swap", "/overview", "/liquidity", "/coins", "/blog", "/nft"];

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
    <BackToTopButton />
  </div>
);

function App({ children }: AppProps) {
  const router = useRouter();
  const isLandingRoute = landingRoutes.includes(router.pathname);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if (!(window as any).Buffer) {
        (window as any).Buffer = Buffer;
      }
    }

    if (typeof window === "undefined") return;

    const handleRouteChangeComplete = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };

    try {
      const auth = require("../scripts/auth-helper.js");

      if (router.pathname === "/") {
        if (auth && typeof auth.redirectIfAuthenticated === "function") {
          void auth.redirectIfAuthenticated(router);
        }
        return;
      }

      if (router.pathname === "/login") {
        if (auth && typeof auth.isLoggedIn === "function" && auth.isLoggedIn()) {
          router.push("/swap");
        }
        return;
      }

      const shouldProtect = protectedRoutes.includes(router.pathname);
      if (shouldProtect && auth && typeof auth.isLoggedIn === "function" && !auth.isLoggedIn()) {
        router.push("/login");
      }
    } catch (error) {
      console.warn("Auth helper not available:", error);
    }
  }, [router.pathname]);

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
