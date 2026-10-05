"use client";

import { useEffect } from "react";

const replacements: Record<string, string> = {
  "Prijs / kg": "Prijs / stuk",
  "Actieprijs / kg": "Actieprijs / stuk",
  "Voorraad kg": "Voorraad stuks",
  "Verkoop per kilo": "Verkoop per stuk",
  "Sold per kg": "Sold per piece",
  "Tijdelijk extra voordeel per kg": "Tijdelijk extra voordeel per stuk",
  "Special per-kg pricing": "Special per-piece pricing",
};

function fixText(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const text of nodes) {
    let value = text.nodeValue || "";
    let next = value;
    for (const [from, to] of Object.entries(replacements)) next = next.replaceAll(from, to);
    if (next !== value) text.nodeValue = next;
  }
}

export function PiecePricingFix() {
  useEffect(() => {
    fixText(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.TEXT_NODE) fixText(node);
          else if (node.nodeType === Node.ELEMENT_NODE) fixText(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
