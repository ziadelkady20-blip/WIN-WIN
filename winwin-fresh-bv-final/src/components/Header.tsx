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
      {/* Top Banner Strip */}
      <div className="bg-emerald-950 text-emerald-100/90 text-[12px] py-1.5 px-4 font-medium transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {lang === "nl"
                  ? "Gratis gekoelde bezorging vanaf €35,- in heel Nederland"
                  : "Free refrigerated delivery on orders over €35 across the Netherlands"}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-4 divide-x divide-emerald-800 text-emerald-300">
            <span className="hidden md:inline-block">
              {lang === "nl" ? "Klantenservice: +31 20 894 3320" : "Customer care: +31 20 894 3320"}
            </span>
            <Link
              href="/admin"
              className="pl-3 hover:text-white transition-colors text-[11px] uppercase tracking-wider font-semibold"
            >
              {t.nav.admin}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
          isScrolled ? "shadow-sm border-stone-200" : "border-stone-200/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand logo */}
            <Link href="/" className="flex items-center shrink-0" aria-label="WIN & WIN FRESH BV">
              <img
                src="/images/winwin-logo.png"
                alt="WIN & WIN FRESH BV"
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-emerald-800 relative py-1 ${
                      isActive ? "text-emerald-900 font-semibold" : "text-stone-600"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex relative flex-1 max-w-xs items-center"
            >
              <input
                type="text"
                placeholder={t.nav.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9.5 pl-9 pr-3 text-xs bg-stone-100 hover:bg-stone-100/80 focus:bg-white text-stone-900 rounded-full border border-stone-200 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Right Tools: Language Switcher + Cart + Mobile Hamburger */}
            <div className="flex items-center gap-3.5">
              {/* Language Switcher */}
              <div className="flex items-center rounded-lg border border-stone-200 p-0.5 text-xs font-semibold bg-stone-50">
                <button
                  type="button"
                  onClick={() => setLang("nl")}
                  className={`px-2 py-1 rounded transition-colors ${
                    lang === "nl"
                      ? "bg-white text-emerald-900 shadow-2xs font-bold"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  NL
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-1 rounded transition-colors ${
                    lang === "en"
                      ? "bg-white text-emerald-900 shadow-2xs font-bold"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Cart Button */}
              <Link
                href="/cart"
                aria-label={t.nav.cart}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 transition-colors"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                    {totalItemsCount}
                  </span>
                )}
              </Link>

              {/* Mobile Search button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 text-stone-700 border border-stone-200"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Mobile Hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-stone-700 hover:text-stone-900 border border-stone-200 bg-stone-50"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search expanded */}
          {searchOpen && (
            <div className="py-3 md:hidden border-t border-stone-100">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder={t.nav.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-stone-100 text-stone-900 rounded-full border border-stone-200 focus:outline-hidden focus:border-emerald-700"
                  autoFocus
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 shadow-lg">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium ${
                    pathname === link.href
                      ? "bg-emerald-50 text-emerald-900 font-semibold"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between px-3 text-xs text-stone-500">
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
