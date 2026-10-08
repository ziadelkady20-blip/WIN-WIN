"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { Search, ShoppingBag, Menu, X, ChevronRight, ShieldCheck, Truck } from "lucide-react";

export function Header() {
  const { lang, setLang, t } = useLanguage();
  const { totalItemsCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/shop", label: t.nav.products },
    { href: "/categories", label: t.nav.categories },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
    { href: "/track-order", label: lang === "nl" ? "Bestelling volgen" : "Track order" },
  ];

  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) {
    // Admin has its own dedicated shell
    return null;
  }

  return (
    <>
      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full bg-[#eee9db] transition-all duration-200 border-b border-[#d9d3c4] ${isScrolled ? "shadow-sm" : ""}`}
      >
        <div className="mx-auto max-w-[1540px] px-5 sm:px-8 lg:px-10">
          <div className="flex h-[88px] items-center justify-between gap-5">
            {/* Brand logo */}
            <Link href="/" className="flex items-center shrink-0" aria-label="WIN & WIN FRESH BV">
              <img
                src="/images/winwin-logo.png"
                alt="WIN & WIN FRESH BV"
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 text-[15px] font-medium transition-colors hover:text-[#14533f] ${isActive ? "font-semibold text-[#14533f]" : "text-[#5f5a51]"}`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14533f] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex relative flex-1 max-w-[330px] items-center"
            >
              <input
                type="text"
                placeholder={t.nav.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#d8d2c4] bg-[#f8f5ed] pl-10 pr-4 text-sm text-[#3f3c35] outline-none transition-all focus:border-[#14533f] focus:bg-white focus:ring-1 focus:ring-[#14533f]/20"
              />
              <Search className="w-4 h-4 text-[#827d72] absolute left-3.5 pointer-events-none" />
            </form>

            {/* Right Tools: Language Switcher + Cart + Mobile Hamburger */}
            <div className="flex items-center gap-3.5">
              {/* Language Switcher */}
              <div className="flex items-center rounded-lg border border-[#d5cfc1] bg-[#f8f5ed] p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLang("nl")}
                  className={`px-2 py-1 rounded transition-colors ${
                    lang === "nl"
                      ? "bg-white text-[#14533f] shadow-sm font-bold"
                      : "text-[#777167] hover:text-[#17382b]"
                  }`}
                >
                  NL
                </button>
                <span className="text-[#d0c9bb]">|</span>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 rounded transition-colors ${
                    lang === "en"
                      ? "bg-white text-emerald-900 shadow-2xs font-bold"
                      : "text-[#777167] hover:text-stone-900"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Cart Button */}
              <Link
                href="/cart"
                aria-label={t.nav.cart}
                className="relative flex items-center justify-center h-11 w-11 rounded-full border border-[#d5cfc1] bg-[#f8f5ed] text-[#4d4a43] transition-colors hover:bg-white hover:text-[#14533f]"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#14533f] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-[#eee9db]">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {/* Mobile Search button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden flex items-center justify-center h-11 w-11 rounded-full border border-[#d5cfc1] bg-[#f8f5ed] text-[#4d4a43]"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Mobile Hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center h-11 w-11 rounded-xl border border-[#d5cfc1] bg-[#f8f5ed] text-[#4d4a43]"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search expanded */}
          {searchOpen && (
            <div className="py-3 md:hidden border-t border-[#ddd7ca]">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder={t.nav.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-[#f8f5ed] text-[#3f3c35] rounded-xl border border-[#d8d2c4] focus:outline-hidden focus:border-[#14533f]"
                  autoFocus
                />
                <Search className="w-4 h-4 text-[#827d72] absolute left-3.5" />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#eee9db] border-b border-[#d9d3c4] px-4 pt-2 pb-6 shadow-lg">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium ${
                    pathname === link.href
                      ? "bg-[#dfe8df] text-[#14533f] font-semibold"
                      : "text-[#5f5a51] hover:bg-[#f8f5ed]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-[#ddd7ca] flex items-center justify-between px-3 text-xs text-stone-500">
                <span>{lang === "nl" ? "Taal / Language:" : "Language / Taal:"}</span>
                <div className="flex items-center gap-2 font-bold">
                  <button
                    onClick={() => setLang("nl")}
                    className={`px-2 py-1 rounded ${lang === "nl" ? "bg-emerald-800 text-white" : "text-stone-600"}`}
                  >
                    Nederlands
                  </button>
                  <button
                    onClick={() => setLang("en")}
                    className={`px-2 py-1 rounded ${lang === "en" ? "bg-emerald-800 text-white" : "text-stone-600"}`}
                  >
                    English
                  </button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
