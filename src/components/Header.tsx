import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useConnectModal, useAccountModal, useChainModal } from "@rainbow-me/rainbowkit";
import { useWallet } from "../hooks/useWallet";
import logo from "../assets/logo/logoNovaFi.png";

const NAV_LINKS = [
  { label: "Swap", path: "/swap" },
  { label: "Liquidity", path: "/liquidity" },
  { label: "Overview", path: "/overview" },
  { label: "NFTs", path: "/nft" },
  { label: "Blog", path: "/blog" },
  { label: "Coins", path: "/coins" },
];

export function Header() {
  const { account, balance, isWrongNetwork, isConnecting } = useWallet();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const truncate = (addr: string) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-indigo-900/30 bg-[#03030f]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="novaFi" className="h-11 w-auto object-contain drop-shadow-lg" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? "bg-indigo-950 border border-indigo-700/50 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/swap"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-indigo-800/50 text-slate-300 hover:border-cyan-500/40 hover:text-white hover:bg-white/5 transition-all"
            >
              Buy &amp; Sell
            </Link>
            <button
              onClick={() =>
                isWrongNetwork
                  ? openChainModal?.()
                  : account
                  ? openAccountModal?.()
                  : openConnectModal?.()
              }
              disabled={isConnecting}
              aria-label={account ? "Wallet account" : "Connect wallet"}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-wait ${
                isWrongNetwork
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/20"
                  : "bg-gradient-to-r from-cyan-500 to-violet-600 shadow-cyan-500/20"
              }`}
            >
              {isConnecting ? (
                "Connecting…"
              ) : isWrongNetwork ? (
                "Wrong network"
              ) : account ? (
                <>
                  {balance && (
                    <span className="hidden sm:inline text-white/80 font-medium mr-2">
                      {parseFloat(balance).toFixed(3)} BNB
                    </span>
                  )}
                  {truncate(account)}
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-indigo-900/30 bg-[#03030f]/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(path)
                    ? "bg-indigo-950 border border-indigo-700/50 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/swap"
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-4 py-2.5 rounded-xl text-sm font-medium text-center border border-indigo-800/50 text-slate-300 hover:border-cyan-500/40 hover:text-white transition-all"
            >
              Buy &amp; Sell
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
