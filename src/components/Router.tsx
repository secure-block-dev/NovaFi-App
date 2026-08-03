import React, { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import LandingNavbar from "./landing/Navbar";
import LandingFooter from "./landing/Footer";

const SwapView       = lazy(() => import("../views/SwapView"));
const LiquidityView  = lazy(() => import("../views/LiquidityView"));
const OverviewView   = lazy(() => import("../views/OverviewView"));
const CoinDetailsView = lazy(() => import("../views/CoinDetailsView"));
const NFTView        = lazy(() => import("../views/NFTView"));
const BlogView       = lazy(() => import("../views/BlogView"));
const NotFound       = lazy(() => import("../views/NotFound"));

const LandingHomeView    = lazy(() => import("../views/landing/LandingHomeView"));
const LandingTradingView = lazy(() => import("../views/landing/LandingTradingView"));
const LandingAboutView   = lazy(() => import("../views/landing/LandingAboutView"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
  </div>
);

const Layout = () => (
  <>
    <Header />
    <main className="min-h-screen">
      <Outlet />
    </main>
    <Footer />
  </>
);

// Marketing site (Home/Trading/About) — its own nav/footer, distinct from the
// dApp's wallet-connect Header. Scoped to a wrapper div (not <body>) so its
// bg-nova-* theme doesn't leak into the /swap, /liquidity, etc. dApp routes.
const LandingLayout = () => (
  <div className="min-h-screen bg-nova-bg text-nova-text">
    <LandingNavbar />
    <main>
      <Outlet />
    </main>
    <LandingFooter />
  </div>
);

export function Routers() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/"        element={<LandingHomeView />} />
          <Route path="/trading" element={<LandingTradingView />} />
          <Route path="/about"   element={<LandingAboutView />} />
        </Route>

        <Route element={<Layout />}>
          <Route path="/swap"      element={<SwapView />} />
          <Route path="/liquidity" element={<LiquidityView />} />
          <Route path="/overview"  element={<OverviewView />} />
          <Route path="/coins"     element={<CoinDetailsView />} />
          <Route path="/nft"       element={<NFTView />} />
          <Route path="/blog"      element={<BlogView />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default Routers;
