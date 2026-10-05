"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, Truck, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/i18n";
import { useLanguage } from "@/context/LanguageContext";

export default function OrderConfirmationPage(){
  const {lang,t}=useLanguage();
  const params=useSearchParams();
  const orderNumber=params.get("order");
  const token=params.get("token");
  const [order,setOrder]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{if(orderNumber) fetch(`/api/orders/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(token||"")}`).then(r=>r.json()).then(setOrder).finally(()=>setLoading(false)); else setLoading(false)},[orderNumber]);
  if(loading) return <div className="min-h-[60vh] grid place-items-center"><div className="h-10 w-10 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin"/></div>;
  if(!order?.id) return <div className="container-page py-24 text-center"><h1 className="text-2xl font-bold">Order not found</h1><Link href="/shop" className="inline-flex mt-5 text-emerald-800">Continue shopping</Link></div>;
  return <div className="min-h-[70vh] bg-[#faf8f2]"><div className="container-page py-12 sm:py-16 max-w-4xl">
    <div className="text-center"><div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center"><CheckCircle2 className="w-9 h-9"/></div><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-800">{t.confirmation.status}</p><h1 className="mt-2 text-4xl font-black">{t.confirmation.title}</h1><p className="mt-2 text-stone-500">{t.confirmation.subtitle}</p></div>
    <div className="surface bg-white p-6 sm:p-8 mt-9"><div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100"><div><p className="text-xs text-stone-500">{t.confirmation.orderNumber}</p><p className="text-xl font-black text-emerald-900 tracking-wide">{order.orderNumber}</p><p className="mt-1 text-xs text-stone-400">{lang==="nl"?"Bewaar deze referentie om je bestelling te volgen.":"Keep this reference to track your order."}</p></div><div className="text-right"><p className="text-xs text-stone-500">{t.confirmation.orderDate}</p><p className="font-semibold">{new Date(order.createdAt).toLocaleString(lang==="nl"?"nl-NL":"en-GB")}</p></div></div>
      <div className="grid md:grid-cols-2 gap-5 mt-6"><div className="rounded-xl bg-stone-50 p-5"><p className="text-xs uppercase tracking-wider font-bold text-stone-500">{t.confirmation.customerDetails}</p><p className="mt-2 font-semibold">{order.customerName}</p><p className="text-sm text-stone-500">{order.customerEmail}</p><p className="text-sm text-stone-500">{order.customerPhone}</p></div><div className="rounded-xl bg-stone-50 p-5"><div className="flex items-center gap-2 text-stone-500 text-xs uppercase tracking-wider font-bold"><MapPin className="w-4"/>{t.confirmation.deliveryAddress}</div><p className="mt-2 font-semibold">{order.street} {order.houseNumber}</p><p className="text-sm text-stone-500">{order.postalCode} {order.city}, {order.country}</p></div></div>
      <div className="mt-6 space-y-3">{order.items?.map((i:any)=><div key={i.id} className="flex gap-3 items-center border-b border-stone-100 pb-3"><img src={i.productImage} alt="" className="w-12 h-12 rounded-lg object-cover bg-stone-50"/><div className="flex-1"><p className="font-semibold text-sm">{i.productName}</p><p className="text-xs text-stone-500">{i.quantity} {i.unit}</p></div><strong>{formatPrice(i.totalPrice,lang)}</strong></div>)}</div>
      <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span className="text-stone-500">{t.cart.subtotal}</span><span>{formatPrice(order.subtotal,lang)}</span></div><div className="flex justify-between"><span className="text-stone-500">{t.cart.deliveryFee}</span><span>{Number(order.deliveryFee)===0?t.cart.freeDelivery:formatPrice(order.deliveryFee,lang)}</span></div><div className="flex justify-between border-t border-stone-100 pt-3 text-lg font-black"><span>{t.cart.total}</span><span className="text-emerald-900">{formatPrice(order.total,lang)}</span></div></div>
    </div>
    <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-100 p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-800">{lang==="nl"?"Bestelstatus":"Order status"}</p><p className="mt-1 font-black text-emerald-950">{({under_review:lang==="nl"?"Onder beoordeling":"Under review",confirmed:lang==="nl"?"Bevestigd":"Confirmed",preparing:lang==="nl"?"Wordt voorbereid":"Preparing",out_for_delivery:lang==="nl"?"Onderweg":"Out for delivery",delivered:lang==="nl"?"Bezorgd":"Delivered",cancelled:lang==="nl"?"Geannuleerd":"Cancelled"} as any)[order.status] || order.status}</p></div><Link href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900">{lang==="nl"?"Bestelling volgen":"Track order"}<ArrowRight className="w-4"/></Link></div></div>
    <div className="grid sm:grid-cols-2 gap-3 mt-6"><Link href="/shop" className="h-12 rounded-xl bg-emerald-900 text-white font-bold grid place-items-center">{t.confirmation.continueShopping}</Link><Link href="/" className="h-12 rounded-xl border border-stone-300 bg-white font-bold grid place-items-center">{t.confirmation.returnHome}</Link></div>
    <div className="mt-6 flex gap-3 rounded-xl bg-white border border-stone-200 p-5"><Truck className="w-5 text-emerald-800"/><div><p className="font-bold text-sm">{t.confirmation.deliveryWindow}</p><p className="text-xs text-stone-500 mt-1">{t.confirmation.deliveryWindowDesc}</p></div></div>
  </div></div>
}
