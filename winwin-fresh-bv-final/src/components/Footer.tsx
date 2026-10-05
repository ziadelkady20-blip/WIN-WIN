"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Truck, Clock, Phone, Mail, MapPin, Check } from "lucide-react";

export function Footer() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-20">
      {/* Top Value Badges */}
      <div className="border-b border-stone-800 bg-stone-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-stone-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {lang === "nl" ? "Gekoelde Bezorging" : "Refrigerated Delivery"}
                </h4>
                <p className="text-xs text-stone-400">
                  {lang === "nl" ? "Binnen 24-48 uur gekoeld in heel NL" : "Within 24-48h cooled across NL"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {lang === "nl" ? "100% Versgarantie" : "100% Freshness Guarantee"}
                </h4>
                <p className="text-xs text-stone-400">
                  {lang === "nl" ? "Niet tevreden? Kosteloos vervangen" : "Not satisfied? Free replacement"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {lang === "nl" ? "Gastbestelling" : "Instant Guest Checkout"}
                </h4>
                <p className="text-xs text-stone-400">
                  {lang === "nl" ? "Geen account nodig om te bestellen" : "No account required to order"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                <span className="font-bold text-sm text-emerald-400">€0</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {lang === "nl" ? "Gratis Bezorging" : "Free Delivery"}
                </h4>
                <p className="text-xs text-stone-400">
                  {lang === "nl" ? "Vanaf €35,- bestelwaarde" : "On orders over €35"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-900 rounded-lg flex items-center justify-center p-1.5 shadow-inner">
                <svg viewBox="0 0 40 40" className="w-full h-full text-emerald-400" fill="none">
                  <path
                    d="M 12 26 C 12 14, 24 9, 34 11 C 34 21, 29 31, 18 31 C 15 31, 12 29, 12 26 Z"
                    fill="currentColor"
                  />
                  <circle cx="28" cy="27" r="4" fill="#dc2626" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-white tracking-tight">WIN &amp; WIN</span>
                <span className="text-[10px] tracking-[0.2em] font-bold text-emerald-400 uppercase">
                  FRESH BV • NEDERLAND
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              {t.footer.aboutText}
            </p>

            <div className="pt-2 text-xs text-stone-400 space-y-1">
              <p>
                <span className="font-semibold text-stone-300">KVK:</span> 87492011 |{" "}
                <span className="font-semibold text-stone-300">BTW:</span> NL864321908B01
              </p>
              <p className="text-stone-500">
                Geregistreerd in het handelsregister te Amsterdam, Nederland.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/shop" className="hover:text-emerald-400 transition-colors">
                  {t.nav.products}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-emerald-400 transition-colors">
                  {t.nav.categories}
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=sale" className="hover:text-emerald-400 transition-colors">
                  {lang === "nl" ? "Aanbiedingen" : "Special Offers"}
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=organic" className="hover:text-emerald-400 transition-colors">
                  {lang === "nl" ? "Biologisch" : "Organic Produce"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.customerService}
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-400 transition-colors">
                  {t.nav.cart}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-stone-500 hover:text-stone-300 transition-colors text-xs">
                  {lang === "nl" ? "Beheerdersportaal" : "Admin Portal"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              {t.footer.contactUs}
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Koopliedenweg 14, 1013 AB Amsterdam</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+31 20 894 3320</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@winandwinfresh.nl</span>
              </div>
            </div>

            {/* Newsletter input */}
            <div className="pt-2">
              <span className="block text-xs font-medium text-stone-300 mb-1.5">
                {lang === "nl" ? "Wekelijkse vers-update" : "Weekly harvest bulletin"}
              </span>
              {subscribed ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Check className="w-4 h-4" />
                  <span>{lang === "nl" ? "Ingeschreven! Dank u wel." : "Subscribed! Thank you."}</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5">
                  <input
                    type="email"
                    required
                    placeholder={lang === "nl" ? "Uw e-mailadres" : "Your email address"}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-stone-800 border border-stone-700 rounded text-white focus:outline-hidden focus:border-emerald-500 flex-1"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
                  >
                    OK
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>
            © {new Date().getFullYear()} WIN &amp; WIN FRESH BV. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Nederlandse Groothandel &amp; Thuisbezorging</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
