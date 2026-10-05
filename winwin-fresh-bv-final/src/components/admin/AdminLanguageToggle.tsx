"use client";

import { useEffect, useRef, useState } from "react";

type Language = "nl" | "en";

const translations: Record<string, string> = {
  "Admin portal": "Admin portal",
  "Bestellingen": "Orders",
  "Producten": "Products",
  "Categorieën": "Categories",
  "Klanten": "Customers",
  "Homepage": "Homepage",
  "Instellingen": "Settings",
  "Uitloggen": "Log out",
  "Onder beoordeling": "Pending review",
  "Omzet": "Revenue",
  "Recente bestellingen": "Recent orders",
  "Laatste activiteiten": "Latest activity",
  "Alle bestellingen →": "All orders →",
  "Best verkocht": "Best sellers",
  "Producten beheren →": "Manage products →",
  "Voorraadwaarschuwing": "Low stock warning",
  "Product verwijderen?": "Delete product?",
  "Product verwijderd": "Product deleted",
  "Categorie verwijderen?": "Delete category?",
  "Categorie verwijderd": "Category deleted",
  "Bestelstatus bijgewerkt": "Order status updated",
  "Sectie verwijderen?": "Delete section?",
  "Sectie verwijderd": "Section deleted",
  "Actie mislukt": "Action failed",
  "Kon data niet laden": "Could not load data",
  "Product bijgewerkt": "Product updated",
  "Product toegevoegd": "Product added",
  "Categorie bijgewerkt": "Category updated",
  "Categorie toegevoegd": "Category added",
  "Sectie bijgewerkt": "Section updated",
  "Sectie toegevoegd": "Section added",
  "Zoeken": "Search",
  "Zoek producten...": "Search products...",
  "Zoek bestellingen...": "Search orders...",
  "Zoek klanten...": "Search customers...",
  "Toevoegen": "Add",
  "Bewerken": "Edit",
  "Verwijderen": "Delete",
  "Opslaan": "Save",
  "Annuleren": "Cancel",
  "Sluiten": "Close",
  "Naam": "Name",
  "E-mail": "Email",
  "Telefoon": "Phone",
  "Status": "Status",
  "Acties": "Actions",
  "Prijs": "Price",
  "Voorraad": "Stock",
  "Categorie": "Category",
  "Beschrijving": "Description",
  "Afbeelding": "Image",
  "Voltooid": "Completed",
  "In behandeling": "Processing",
  "Verzonden": "Shipped",
  "Geannuleerd": "Cancelled",
  "Nieuw": "New",
  "Totaal": "Total",
  "Datum": "Date",
  "Klant": "Customer",
  "Adres": "Address",
  "Betaling": "Payment",
  "Productenlijst": "Product list",
  "Categorieën beheren": "Manage categories",
  "Website-inhoud": "Website content",
  "Winkelinstellingen": "Store settings",
  "Opslaan...": "Saving...",
  "Bijwerken": "Update",
  "Aan": "On",
  "Uit": "Off",
  "Actief": "Active",
  "Inactief": "Inactive",
  "Sectie": "Section",
  "Titel": "Title",
  "Ondertitel": "Subtitle",
  "Volgorde": "Order",
  "Zichtbaar": "Visible",
  "Geen gegevens": "No data",
  "Geen bestellingen": "No orders",
  "Geen producten": "No products",
  "Geen categorieën": "No categories",
  "Geen klanten": "No customers",
  "Refresh": "Refresh",
  "Ververs": "Refresh",
  "Alle": "All",
  "Dashboard": "Dashboard",
  "Groenten": "Vegetables",
  "Fruit": "Fruit",
  "Vlees": "Meat",
  "Zuivel": "Dairy",
  "Dranken": "Drinks",
};

const reverseTranslations = Object.fromEntries(
  Object.entries(translations).map(([nl, en]) => [en, nl])
);

function translateText(value: string, language: Language) {
  const dictionary = language === "en" ? translations : reverseTranslations;
  return dictionary[value] ?? value;
}

function translateDom(language: Language) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const parent = current.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
    nodes.push(current as Text);
  }

  for (const node of nodes) {
    const original = node.nodeValue ?? "";
    const translated = translateText(original, language);
    if (translated !== original) node.nodeValue = translated;
  }

  document.querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label]").forEach((el) => {
    for (const attr of ["placeholder", "title", "aria-label"]) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      const translated = translateText(value, language);
      if (translated !== value) el.setAttribute(attr, translated);
    }
  });
}

export function AdminLanguageToggle() {
  const [language, setLanguage] = useState<Language>("nl");
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("winwin-admin-language") as Language | null;
    const initial = saved === "en" ? "en" : "nl";
    setLanguage(initial);
    document.documentElement.lang = initial;

    if (initial === "en") {
      window.setTimeout(() => translateDom("en"), 0);
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement.lang === "en") translateDom("en");
    });
    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;

    return () => observer.disconnect();
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    window.localStorage.setItem("winwin-admin-language", next);
    document.documentElement.lang = next;
    translateDom(next);
  }

  return (
    <div className="fixed right-5 top-5 z-[200] flex items-center rounded-xl border border-stone-200 bg-white/95 p-1 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={() => changeLanguage("nl")}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${language === "nl" ? "bg-[#0a3528] text-white" : "text-stone-500 hover:bg-stone-100"}`}
        aria-label="Nederlands"
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${language === "en" ? "bg-[#0a3528] text-white" : "text-stone-500 hover:bg-stone-100"}`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
