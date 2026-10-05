"use client";

import type { ReactNode } from "react";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Boxes, ChevronRight, ClipboardList, FolderTree, Gauge, Image as ImageIcon,
  LayoutTemplate, LogOut, Menu, Package, Plus, RefreshCw, Search, Settings, ShoppingBag,
  Trash2, Users, X, Pencil, CheckCircle2, Clock3, Truck, AlertTriangle
} from "lucide-react";

type Session={id:number;email:string;name:string;role:"super_admin"|"manager"|"order_manager";exp:number};
type Tab="dashboard"|"orders"|"products"|"categories"|"customers"|"homepage"|"settings";

const green="text-emerald-900";

function money(v:any){return `€ ${Number(v||0).toFixed(2).replace(".",",")}`}
function img(v:string){return v||"https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=800"}

export function AdminDashboard({session}:{session:Session}){
  const [tab,setTab]=useState<Tab>("dashboard");
  const [mobileOpen,setMobileOpen]=useState(false);
  const [stats,setStats]=useState<any>(null);
  const [products,setProducts]=useState<any[]>([]);
  const [categories,setCategories]=useState<any[]>([]);
  const [orders,setOrders]=useState<any[]>([]);
  const [customers,setCustomers]=useState<any[]>([]);
  const [sections,setSections]=useState<any[]>([]);
  const [settings,setSettings]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [toast,setToast]=useState("");
  const [modal,setModal]=useState<"product"|"category"|"section"|null>(null);
  const [editing,setEditing]=useState<any>(null);
  const [query,setQuery]=useState("");

  const canManage=session.role!=="order_manager";
  const nav=[
    {id:"dashboard",label:"Dashboard",icon:Gauge,show:true},
    {id:"orders",label:"Bestellingen",icon:ClipboardList,show:true},
    {id:"products",label:"Producten",icon:Package,show:canManage},
    {id:"categories",label:"Categorieën",icon:FolderTree,show:canManage},
    {id:"customers",label:"Klanten",icon:Users,show:true},
    {id:"homepage",label:"Homepage",icon:LayoutTemplate,show:canManage},
    {id:"settings",label:"Instellingen",icon:Settings,show:session.role==="super_admin"},
  ].filter(x=>x.show) as any[];

  async function api(url:string,options?:RequestInit){
    const res=await fetch(url,options);
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||"Actie mislukt");
    return data;
  }

  async function loadAll(){
    setLoading(true);
    try{
      const [s,p,c,o,cu,h,st]=await Promise.all([
        api("/api/admin/stats"),api("/api/products?admin=true"),api("/api/categories"),
        api("/api/orders"),api("/api/customers"),api("/api/homepage-sections"),api("/api/store-settings")
      ]);
      setStats(s);setProducts(p);setCategories(c);setOrders(o);setCustomers(cu);setSections(h);setSettings(st);
    }catch(e:any){showToast(e.message||"Kon data niet laden")}
    finally{setLoading(false)}
  }
  useEffect(()=>{loadAll()},[]);

  function showToast(msg:string){setToast(msg);setTimeout(()=>setToast(""),2800)}
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});location.href="/admin/login"}

  const filteredProducts=useMemo(()=>products.filter(p=>`${p.nameNl} ${p.nameEn}`.toLowerCase().includes(query.toLowerCase())),[products,query]);
  const filteredOrders=useMemo(()=>orders.filter(o=>`${o.orderNumber} ${o.customerName} ${o.customerEmail}`.toLowerCase().includes(query.toLowerCase())),[orders,query]);
  const filteredCustomers=useMemo(()=>customers.filter(c=>`${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(query.toLowerCase())),[customers,query]);

  async function deleteProduct(id:number){if(!confirm("Product verwijderen?"))return;try{await api(`/api/products/${id}`,{method:"DELETE"});showToast("Product verwijderd");loadAll()}catch(e:any){showToast(e.message)}}
  async function deleteCategory(id:number){if(!confirm("Categorie verwijderen?"))return;try{await api(`/api/categories/${id}`,{method:"DELETE"});showToast("Categorie verwijderd");loadAll()}catch(e:any){showToast(e.message)}}
  async function updateOrder(id:number,status:string){try{await api(`/api/orders/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});showToast("Bestelstatus bijgewerkt");loadAll()}catch(e:any){showToast(e.message)}}
  async function deleteOrder(id:number){if(!canManage)return;if(!confirm("Deze bestelling definitief verwijderen?"))return;try{await api(`/api/orders/${id}`,{method:"DELETE"});showToast("Bestelling verwijderd");loadAll()}catch(e:any){showToast(e.message)}}
  async function deleteSection(id:number){if(!confirm("Sectie verwijderen?"))return;try{await api(`/api/homepage-sections/${id}`,{method:"DELETE"});showToast("Sectie verwijderd");loadAll()}catch(e:any){showToast(e.message)}}

  const statCards=[
    ["Bestellingen",stats?.totalOrders||0,ClipboardList,"text-emerald-800","bg-emerald-50"],
    ["Onder beoordeling",stats?.pendingOrders||0,Clock3,"text-amber-700","bg-amber-50"],
    ["Omzet",money(stats?.totalRevenue),BarChart3,"text-blue-700","bg-blue-50"],
    ["Producten",stats?.totalProducts||0,Package,"text-violet-700","bg-violet-50"],
  ];

  return <div className="min-h-screen bg-[#f4f5f1] text-stone-900">
    {toast&&<div className="fixed top-5 right-5 z-[100] rounded-xl bg-stone-900 text-white px-4 py-3 text-sm font-semibold shadow-xl">{toast}</div>}
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a3528] text-white transform transition-transform lg:translate-x-0 ${mobileOpen?"translate-x-0":"-translate-x-full"} lg:block`}>
      <div className="h-full flex flex-col">
        <div className="p-5 border-b border-white/10"><div className="bg-white rounded-2xl p-2"><img src="/images/winwin-logo.png" alt="WIN & WIN" className="h-12 w-full object-contain"/></div><div className="mt-4"><p className="text-xs text-emerald-200">Admin portal</p><p className="font-bold text-sm mt-1 truncate">{session.name}</p></div></div>
        <nav className="p-3 space-y-1 flex-1">{nav.map((item:any)=>{const Icon=item.icon;return <button key={item.id} onClick={()=>{setTab(item.id);setMobileOpen(false);setQuery("")}} className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${tab===item.id?"bg-white text-emerald-950 shadow-sm":"text-emerald-50/75 hover:bg-white/10 hover:text-white"}`}><Icon className="w-4.5"/><span>{item.label}</span>{tab===item.id&&<ChevronRight className="w-4 ml-auto"/>}</button>})}</nav>
        <div className="p-3 border-t border-white/10"><button onClick={logout} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm text-emerald-100/80 hover:bg-white/10"><LogOut className="w-4.5"/>Uitloggen</button></div>
      </div>
    </aside>
    {mobileOpen&&<button aria-label="Close menu" onClick={()=>setMobileOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden"/>}
    <main className="lg:pl-64">
      <header className="h-18 bg-white border-b border-stone-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-7">
        <div className="flex items-center gap-3"><button onClick={()=>setMobileOpen(true)} className="lg:hidden w-10 h-10 rounded-xl border border-stone-200 grid place-items-center"><Menu className="w-5"/></button><div><p className="text-xs text-stone-400">WIN & WIN FRESH BV</p><h1 className="font-black text-lg">{nav.find((n:any)=>n.id===tab)?.label}</h1></div></div>
        <div className="flex items-center gap-2"><button onClick={loadAll} className="w-10 h-10 rounded-xl border border-stone-200 bg-white grid place-items-center hover:bg-stone-50" title="Refresh"><RefreshCw className={`w-4 ${loading?"animate-spin":""}`}/></button><div className="hidden sm:flex items-center gap-2 pl-2"><div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 grid place-items-center font-bold">{session.name?.[0]||"A"}</div><div><p className="text-xs font-bold">{session.name}</p><p className="text-[10px] text-stone-400">{session.role.replace("_"," ")}</p></div></div></div>
      </header>

      <div className="p-4 sm:p-7 max-w-[1500px]">
        {tab==="dashboard"&&<DashboardView stats={stats} orders={orders} products={products} onTab={setTab}/>}
        {tab==="orders"&&<OrdersView orders={filteredOrders} query={query} setQuery={setQuery} onStatus={updateOrder} onDelete={deleteOrder} canDelete={canManage}/>}
        {tab==="products"&&<ProductsView products={filteredProducts} query={query} setQuery={setQuery} onAdd={()=>{setEditing(null);setModal("product")}} onEdit={(p:any)=>{setEditing(p);setModal("product")}} onDelete={deleteProduct}/>}
        {tab==="categories"&&<CategoriesView categories={categories} onAdd={()=>{setEditing(null);setModal("category")}} onEdit={(c:any)=>{setEditing(c);setModal("category")}} onDelete={deleteCategory}/>}
        {tab==="customers"&&<CustomersView customers={filteredCustomers} query={query} setQuery={setQuery}/>}
        {tab==="homepage"&&<HomepageView sections={sections} onAdd={()=>{setEditing(null);setModal("section")}} onEdit={(s:any)=>{setEditing(s);setModal("section")}} onDelete={deleteSection}/>}
        {tab==="settings"&&<SettingsView settings={settings} onSaved={loadAll}/>}
      </div>
    </main>
    {modal==="product"&&<ProductModal product={editing} categories={categories} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);loadAll();showToast(editing?"Product bijgewerkt":"Product toegevoegd")}} api={api}/>}
    {modal==="category"&&<CategoryModal category={editing} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);loadAll();showToast(editing?"Categorie bijgewerkt":"Categorie toegevoegd")}} api={api}/>}
    {modal==="section"&&<SectionModal section={editing} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);loadAll();showToast(editing?"Sectie bijgewerkt":"Sectie toegevoegd")}} api={api}/>}
  </div>
}

function Toolbar({query,setQuery,placeholder,action}:{query:string;setQuery:(v:string)=>void;placeholder:string;action?:ReactNode}){
  return <div className="flex flex-col sm:flex-row gap-3 justify-between"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={placeholder} className="w-full h-11 rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-emerald-700"/></div>{action}</div>
}
function Empty({text}:{text:string}){return <div className="surface bg-white p-12 text-center text-stone-500 text-sm">{text}</div>}

function DashboardView({stats,orders,products,onTab}:{stats:any;orders:any[];products:any[];onTab:(x:Tab)=>void}){
  return <div className="space-y-6">
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[["Bestellingen",stats?.totalOrders||0,ClipboardList,"bg-emerald-50","text-emerald-800"],["Onder beoordeling",stats?.pendingOrders||0,Clock3,"bg-amber-50","text-amber-700"],["Omzet",money(stats?.totalRevenue),BarChart3,"bg-blue-50","text-blue-700"],["Producten",stats?.totalProducts||0,Package,"bg-violet-50","text-violet-700"]].map(([label,value,Icon,bg,color]:any)=><div key={label} className="bg-white border border-stone-200 rounded-2xl p-5"><div className={`w-10 h-10 rounded-xl ${bg} ${color} grid place-items-center`}><Icon className="w-5"/></div><p className="mt-5 text-xs text-stone-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}</div>
    <div className="grid xl:grid-cols-[1.25fr_.75fr] gap-5">
      <div className="bg-white border border-stone-200 rounded-2xl p-5"><div className="flex justify-between items-center"><div><h2 className="font-bold">Recente bestellingen</h2><p className="text-xs text-stone-400 mt-1">Laatste activiteiten</p></div><button onClick={()=>onTab("orders")} className="text-xs font-bold text-emerald-800">Alle bestellingen →</button></div><div className="mt-5 space-y-2">{orders.slice(0,7).map(o=><div key={o.id} className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0"><div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 grid place-items-center"><ShoppingBag className="w-4"/></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{o.orderNumber} · {o.customerName}</p><p className="text-[11px] text-stone-400">{new Date(o.createdAt).toLocaleString("nl-NL")}</p></div><div className="text-right"><p className="text-sm font-bold">{money(o.total)}</p><Status status={o.status}/></div></div>)}</div></div>
      <div className="bg-white border border-stone-200 rounded-2xl p-5"><h2 className="font-bold">Best verkocht</h2><div className="mt-5 space-y-4">{(stats?.topProducts||[]).map((p:any,i:number)=><div key={i}><div className="flex justify-between text-sm"><span className="font-semibold">{p.productName}</span><span className="text-stone-500">{p.totalSoldPieces} kg</span></div><div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden"><div className="h-full bg-emerald-700 rounded-full" style={{width:`${Math.min(100,20+Number(p.totalSoldKg))}%`}}/></div></div>)}</div><button onClick={()=>onTab("products")} className="mt-6 text-xs font-bold text-emerald-800">Producten beheren →</button></div>
    </div>
    <div className="bg-white border border-stone-200 rounded-2xl p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Voorraadwaarschuwing</h2><AlertTriangle className="w-4 text-amber-600"/></div><div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{(stats?.lowStockItems||[]).map((p:any)=><div key={p.id} className="flex gap-3 p-3 rounded-xl bg-amber-50"><img src={img(p.mainImage)} className="w-10 h-10 rounded-lg object-cover" alt=""/><div><p className="text-sm font-semibold">{p.nameNl}</p><p className="text-xs text-amber-800">{p.stockQuantity} stuks</p></div></div>)}</div></div>
  </div>
}

function Status({status}:{status:string}){const map:any={under_review:["Onder beoordeling","bg-amber-50 text-amber-800"],confirmed:["Bevestigd","bg-blue-50 text-blue-800"],preparing:["In voorbereiding","bg-violet-50 text-violet-800"],out_for_delivery:["Onderweg","bg-cyan-50 text-cyan-800"],delivered:["Geleverd","bg-emerald-50 text-emerald-800"],cancelled:["Geannuleerd","bg-red-50 text-red-800"]};const [label,cls]=map[status]||[status,"bg-stone-100 text-stone-700"];return <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>}

function OrdersView({orders,query,setQuery,onStatus,onDelete,canDelete}:{orders:any[];query:string;setQuery:(x:string)=>void;onStatus:(id:number,status:string)=>void;onDelete:(id:number)=>void;canDelete:boolean}){
  return <div className="space-y-5"><Toolbar query={query} setQuery={setQuery} placeholder="Zoek op ordernummer, klant of e-mail"/><div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">{orders.length===0?<Empty text="Geen bestellingen gevonden."/>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-stone-50 text-xs text-stone-500"><tr><th className="text-left p-4">Order</th><th className="text-left p-4">Klant</th><th className="text-left p-4">Datum</th><th className="text-left p-4">Totaal</th><th className="text-left p-4">Status</th><th className="p-4">Actie</th></tr></thead><tbody>{orders.map(o=><tr key={o.id} className="border-t border-stone-100"><td className="p-4 font-bold">{o.orderNumber}</td><td className="p-4"><p className="font-semibold">{o.customerName}</p><p className="text-xs text-stone-400">{o.customerEmail}</p></td><td className="p-4 text-xs text-stone-500">{new Date(o.createdAt).toLocaleDateString("nl-NL")}</td><td className="p-4 font-bold">{money(o.total)}</td><td className="p-4"><Status status={o.status}/></td><td className="p-4"><select value={o.status} onChange={e=>onStatus(o.id,e.target.value)} className="h-9 rounded-lg border border-stone-200 text-xs px-2"><option value="under_review">Under review</option><option value="confirmed">Confirmed</option><option value="preparing">Preparing</option><option value="out_for_delivery">Out for delivery</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>{canDelete&&<button onClick={()=>onDelete(o.id)} title="Bestelling verwijderen" className="ml-2 h-9 w-9 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 grid place-items-center"><Trash2 className="w-4"/></button>}</td></tr>)}</tbody></table></div>}</div></div>
}

function ProductsView({products,query,setQuery,onAdd,onEdit,onDelete}:{products:any[];query:string;setQuery:(x:string)=>void;onAdd:()=>void;onEdit:(p:any)=>void;onDelete:(id:number)=>void}){
  return <div className="space-y-5"><Toolbar query={query} setQuery={setQuery} placeholder="Zoek producten..." action={<button onClick={onAdd} className="h-11 px-4 rounded-xl bg-emerald-900 text-white font-bold text-sm inline-flex items-center gap-2"><Plus className="w-4"/>Nieuw product</button>}/><div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">{products.length===0?<Empty text="Geen producten."/>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-stone-50 text-xs text-stone-500"><tr><th className="p-4 text-left">Product</th><th className="p-4 text-left">Categorie</th><th className="p-4 text-left">Prijs / stuk</th><th className="p-4 text-left">Voorraad</th><th className="p-4 text-left">Status</th><th className="p-4">Acties</th></tr></thead><tbody>{products.map(p=><tr key={p.id} className="border-t border-stone-100"><td className="p-4"><div className="flex gap-3 items-center min-w-[250px]"><img src={img(p.mainImage)} className="w-11 h-11 rounded-lg object-cover" alt=""/><div><p className="font-semibold">{p.nameNl}</p><p className="text-xs text-stone-400">{p.nameEn}</p></div></div></td><td className="p-4 text-xs">{p.categoryNameNl||"—"}</td><td className="p-4 font-bold">{money(p.salePricePerKg||p.pricePerKg)}</td><td className="p-4 text-xs">{p.stockQuantity} stuks</td><td className="p-4"><div className="flex flex-wrap gap-1.5">{p.isPublished?<span className="text-emerald-800 text-xs font-bold">Published</span>:<span className="text-stone-400 text-xs">Hidden</span>}{p.isFeatured&&<span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">Featured</span>}</div></td><td className="p-4"><div className="flex justify-center gap-1"><button onClick={()=>onEdit(p)} className="w-9 h-9 rounded-lg hover:bg-stone-100 grid place-items-center"><Pencil className="w-4"/></button><button onClick={()=>onDelete(p.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 grid place-items-center"><Trash2 className="w-4"/></button></div></td></tr>)}</tbody></table></div>}</div></div>
}

function CategoriesView({categories,onAdd,onEdit,onDelete}:{categories:any[];onAdd:()=>void;onEdit:(c:any)=>void;onDelete:(id:number)=>void}){
  return <div className="space-y-5"><div className="flex justify-between items-center"><div><h2 className="text-2xl font-black">Categorieën</h2><p className="text-sm text-stone-500 mt-1">Beheer de structuur van het assortiment.</p></div><button onClick={onAdd} className="h-11 px-4 rounded-xl bg-emerald-900 text-white font-bold text-sm inline-flex items-center gap-2"><Plus className="w-4"/>Nieuwe categorie</button></div><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{categories.map(c=><div key={c.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden"><img src={img(c.image)} alt="" className="w-full aspect-[2/1] object-cover"/><div className="p-4"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{c.nameNl}</h3><p className="text-xs text-stone-400">{c.nameEn}</p></div><span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.isActive?"bg-emerald-50 text-emerald-800":"bg-stone-100 text-stone-500"}`}>{c.isActive?"Active":"Hidden"}</span></div><div className="mt-4 flex gap-2"><button onClick={()=>onEdit(c)} className="flex-1 h-9 rounded-lg border border-stone-200 text-xs font-bold inline-flex justify-center items-center gap-1"><Pencil className="w-3.5"/>Edit</button><button onClick={()=>onDelete(c.id)} className="h-9 w-9 rounded-lg border border-red-100 text-red-600 grid place-items-center"><Trash2 className="w-3.5"/></button></div></div></div>)}</div></div>
}

function CustomersView({customers,query,setQuery}:{customers:any[];query:string;setQuery:(x:string)=>void}){
  return <div className="space-y-5"><Toolbar query={query} setQuery={setQuery} placeholder="Zoek klanten..."/><div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">{customers.length===0?<Empty text="Geen klanten gevonden."/>:<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-stone-50 text-xs text-stone-500"><tr><th className="p-4 text-left">Klant</th><th className="p-4 text-left">Telefoon</th><th className="p-4 text-left">Bestellingen</th><th className="p-4 text-left">Besteed</th><th className="p-4 text-left">Laatste order</th></tr></thead><tbody>{customers.map(c=><tr key={c.id} className="border-t border-stone-100"><td className="p-4"><p className="font-semibold">{c.name}</p><p className="text-xs text-stone-400">{c.email}</p></td><td className="p-4 text-xs">{c.phone}</td><td className="p-4">{c.totalOrders}</td><td className="p-4 font-bold">{money(c.totalSpent)}</td><td className="p-4 text-xs text-stone-500">{new Date(c.lastOrderDate).toLocaleDateString("nl-NL")}</td></tr>)}</tbody></table></div>}</div></div>
}

function HomepageView({sections,onAdd,onEdit,onDelete}:{sections:any[];onAdd:()=>void;onEdit:(s:any)=>void;onDelete:(id:number)=>void}){
  return <div className="space-y-5"><div className="flex justify-between items-center"><div><h2 className="text-2xl font-black">Homepage builder</h2><p className="text-sm text-stone-500 mt-1">Bepaal welke secties zichtbaar zijn en in welke volgorde.</p></div><button onClick={onAdd} className="h-11 px-4 rounded-xl bg-emerald-900 text-white font-bold text-sm inline-flex items-center gap-2"><Plus className="w-4"/>Sectie toevoegen</button></div><div className="space-y-3">{sections.map((s,i)=><div key={s.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-stone-100 grid place-items-center text-stone-500 font-bold">{i+1}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">{s.sectionType}</span><span className={`w-2 h-2 rounded-full ${s.isActive?"bg-emerald-600":"bg-stone-300"}`}/></div><p className="font-bold mt-1">{s.titleNl}</p><p className="text-xs text-stone-400">{s.titleEn}</p></div><button onClick={()=>onEdit(s)} className="w-9 h-9 rounded-lg hover:bg-stone-100 grid place-items-center"><Pencil className="w-4"/></button><button onClick={()=>onDelete(s.id)} className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 grid place-items-center"><Trash2 className="w-4"/></button></div>)}</div></div>
}

function SettingsView({settings,onSaved}:{settings:any;onSaved:()=>void}){
  const [form,setForm]=useState(settings||{}); const [saving,setSaving]=useState(false);
  useEffect(()=>setForm(settings||{}),[settings]);
  if(!settings) return <Empty text="Instellingen laden..."/>;
  const set=(k:string,v:string)=>setForm((f:any)=>({...f,[k]:v}));
  const save=async()=>{setSaving(true);try{const r=await fetch("/api/store-settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(!r.ok)throw new Error();await r.json();onSaved();}finally{setSaving(false)}};
  return <div className="max-w-3xl space-y-5"><div><h2 className="text-2xl font-black">Winkelinstellingen</h2><p className="text-sm text-stone-500 mt-1">Alleen Super Admin kan deze gegevens wijzigen.</p></div><div className="bg-white border border-stone-200 rounded-2xl p-6 grid sm:grid-cols-2 gap-4">{["storeName","phone","email","address","kvkNumber","vatNumber","openingHoursNl","openingHoursEn","whatsappNumber","instagramUrl","facebookUrl"].map(k=><label key={k} className="block sm:col-span-1"><span className="text-xs font-semibold text-stone-600">{k}</span><input value={form[k]||""} onChange={e=>set(k,e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm"/></label>)}<div className="sm:col-span-2"><button onClick={save} disabled={saving} className="h-11 px-5 rounded-xl bg-emerald-900 text-white font-bold">{saving?"Opslaan...":"Instellingen opslaan"}</button></div></div></div>
}

function Modal({children,onClose,title}:{children:ReactNode;onClose:()=>void;title:string}){return <div className="fixed inset-0 z-[90] bg-black/40 p-4 grid place-items-center"><div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"><div className="sticky top-0 z-10 bg-white border-b border-stone-100 p-5 flex items-center justify-between"><h2 className="font-black text-xl">{title}</h2><button onClick={onClose} className="w-9 h-9 rounded-lg hover:bg-stone-100 grid place-items-center"><X className="w-5"/></button></div>{children}</div></div>}

function ProductModal({product,categories,onClose,onSaved,api}:{product:any;categories:any[];onClose:()=>void;onSaved:()=>void;api:any}){
  const [f,setF]=useState<any>(product||{nameNl:"",nameEn:"",descriptionNl:"",descriptionEn:"",categoryId:"",pricePerKg:"",salePricePerKg:"",unit:"piece",mainImage:"",additionalImages:[],stockQuantity:"100",stockStatus:"in_stock",origin:"Nederland",isFeatured:false,isSeasonal:false,isOrganic:false,isNew:false,badges:[],isPublished:true,sortOrder:0});
  const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}));
  const save=async(e:any)=>{e.preventDefault();await api(product?`/api/products/${product.id}`:"/api/products",{method:product?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...f,additionalImages:typeof f.additionalImages==="string"?f.additionalImages.split("\n").map((x:string)=>x.trim()).filter(Boolean):f.additionalImages})});onSaved()};
  const toggle=(k:string)=>{
    const labels:any={isFeatured:"Uitgelicht op homepage",isSeasonal:"Seizoensproduct",isOrganic:"Biologisch",isNew:"Nieuw product",isPublished:"Zichtbaar op website"};
    return <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer"><input type="checkbox" checked={!!f[k]} onChange={e=>set(k,e.target.checked)}/>{labels[k]||k}</label>;
  };
  return <Modal onClose={onClose} title={product?"Product bewerken":"Nieuw product"}><form onSubmit={save} className="p-6 space-y-5"><div className="grid sm:grid-cols-2 gap-4">{[["nameNl","Naam Nederlands"],["nameEn","Name English"],["pricePerKg","Prijs per stuk"],["salePricePerKg","Actieprijs per stuk"],["stockQuantity","Voorraad (stuks)"],["origin","Herkomst"],["mainImage","Hoofdafbeelding URL"],["slug","Slug (optioneel)"]].map(([k,l])=><label key={k} className="block"><span className="text-xs font-semibold">{l}</span><input required={["nameNl","pricePerKg","mainImage"].includes(k)} value={f[k]||""} onChange={e=>set(k,e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm"/></label>)}</div><div className="grid sm:grid-cols-2 gap-4"><label><span className="text-xs font-semibold">Categorie</span><select value={f.categoryId||""} onChange={e=>set("categoryId",e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm"><option value="">Geen</option>{categories.map(c=><option key={c.id} value={c.id}>{c.nameNl}</option>)}</select></label><label><span className="text-xs font-semibold">Stock status</span><select value={f.stockStatus||"in_stock"} onChange={e=>set("stockStatus",e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm"><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option></select></label></div><div className="grid sm:grid-cols-2 gap-4"><label><span className="text-xs font-semibold">Beschrijving NL</span><textarea value={f.descriptionNl||""} onChange={e=>set("descriptionNl",e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-stone-200 p-3 text-sm"/></label><label><span className="text-xs font-semibold">Description EN</span><textarea value={f.descriptionEn||""} onChange={e=>set("descriptionEn",e.target.value)} rows={4} className="mt-1.5 w-full rounded-lg border border-stone-200 p-3 text-sm"/></label></div><label><span className="text-xs font-semibold">Extra image URLs (1 per line)</span><textarea value={Array.isArray(f.additionalImages)?f.additionalImages.join("\n"):f.additionalImages||""} onChange={e=>set("additionalImages",e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-stone-200 p-3 text-sm"/></label><div className="flex flex-wrap gap-4">{["isFeatured","isSeasonal","isOrganic","isNew","isPublished"].map(k=>toggle(k))}</div><div><span className="text-xs font-semibold">Badges</span><div className="flex flex-wrap gap-2 mt-2">{["NEW","SALE","POPULAR","SEASONAL","ORGANIC","LIMITED"].map(b=><label key={b} className={`px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer ${f.badges?.includes(b)?"bg-emerald-50 border-emerald-200 text-emerald-900":"border-stone-200"}`}><input type="checkbox" className="hidden" checked={f.badges?.includes(b)} onChange={e=>set("badges",e.target.checked?[...(f.badges||[]),b]:(f.badges||[]).filter((x:string)=>x!==b))}/>{b}</label>)}</div></div><div className="flex justify-end gap-2 pt-3 border-t border-stone-100"><button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-stone-200 font-bold">Annuleren</button><button className="h-11 px-5 rounded-xl bg-emerald-900 text-white font-bold">Opslaan</button></div></form></Modal>
}

function CategoryModal({category,onClose,onSaved,api}:{category:any;onClose:()=>void;onSaved:()=>void;api:any}){
  const [f,setF]=useState<any>(category||{nameNl:"",nameEn:"",slug:"",descriptionNl:"",descriptionEn:"",image:"",isActive:true,sortOrder:0});
  const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}));
  const save=async(e:any)=>{e.preventDefault();await api(category?`/api/categories/${category.id}`:"/api/categories",{method:category?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});onSaved()};
  return <Modal onClose={onClose} title={category?"Categorie bewerken":"Nieuwe categorie"}><form onSubmit={save} className="p-6 space-y-4"><div className="grid sm:grid-cols-2 gap-4">{[["nameNl","Naam Nederlands"],["nameEn","Name English"],["slug","Slug"],["image","Afbeelding URL"]].map(([k,l])=><label key={k}><span className="text-xs font-semibold">{l}</span><input required={["nameNl","slug"].includes(k)} value={f[k]||""} onChange={e=>set(k,e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm"/></label>)}</div><div className="grid sm:grid-cols-2 gap-4"><textarea value={f.descriptionNl||""} onChange={e=>set("descriptionNl",e.target.value)} placeholder="Beschrijving NL" rows={4} className="rounded-lg border border-stone-200 p-3 text-sm"/><textarea value={f.descriptionEn||""} onChange={e=>set("descriptionEn",e.target.value)} placeholder="Description EN" rows={4} className="rounded-lg border border-stone-200 p-3 text-sm"/></div><label className="flex gap-2 items-center text-sm font-semibold"><input type="checkbox" checked={!!f.isActive} onChange={e=>set("isActive",e.target.checked)}/>Actief</label><div className="flex justify-end gap-2 pt-3 border-t border-stone-100"><button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-stone-200 font-bold">Annuleren</button><button className="h-11 px-5 rounded-xl bg-emerald-900 text-white font-bold">Opslaan</button></div></form></Modal>
}

function SectionModal({section,onClose,onSaved,api}:{section:any;onClose:()=>void;onSaved:()=>void;api:any}){
  const [f,setF]=useState<any>(section||{sectionType:"banner",titleNl:"",titleEn:"",subtitleNl:"",subtitleEn:"",contentNl:"",contentEn:"",imageUrl:"",buttonTextNl:"",buttonTextEn:"",buttonLink:"/shop",isActive:true,sortOrder:0,config:{}});
  const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}));
  const save=async(e:any)=>{e.preventDefault();await api(section?`/api/homepage-sections/${section.id}`:"/api/homepage-sections",{method:section?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});onSaved()};
  return <Modal onClose={onClose} title={section?"Homepage sectie bewerken":"Homepage sectie toevoegen"}><form onSubmit={save} className="p-6 space-y-4"><div className="grid sm:grid-cols-2 gap-4"><label><span className="text-xs font-semibold">Type</span><select value={f.sectionType} onChange={e=>set("sectionType",e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm">{["hero","features","categories","featured_products","seasonal_products","special_offers","about","quality","delivery","banner","newsletter","custom"].map(x=><option key={x}>{x}</option>)}</select></label><label><span className="text-xs font-semibold">Sort order</span><input type="number" value={f.sortOrder||0} onChange={e=>set("sortOrder",Number(e.target.value))} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3"/></label></div><div className="grid sm:grid-cols-2 gap-4">{[["titleNl","Titel NL"],["titleEn","Title EN"],["subtitleNl","Subtitel NL"],["subtitleEn","Subtitle EN"],["imageUrl","Image URL"],["buttonLink","Button link"],["buttonTextNl","Button NL"],["buttonTextEn","Button EN"]].map(([k,l])=><label key={k}><span className="text-xs font-semibold">{l}</span><input value={f[k]||""} onChange={e=>set(k,e.target.value)} className="mt-1.5 w-full h-10 rounded-lg border border-stone-200 px-3 text-sm"/></label>)}</div><div className="grid sm:grid-cols-2 gap-4"><textarea value={f.contentNl||""} onChange={e=>set("contentNl",e.target.value)} placeholder="Content NL" rows={4} className="rounded-lg border border-stone-200 p-3 text-sm"/><textarea value={f.contentEn||""} onChange={e=>set("contentEn",e.target.value)} placeholder="Content EN" rows={4} className="rounded-lg border border-stone-200 p-3 text-sm"/></div><label className="flex gap-2 items-center text-sm font-semibold"><input type="checkbox" checked={!!f.isActive} onChange={e=>set("isActive",e.target.checked)}/>Visible</label><div className="flex justify-end gap-2 pt-3 border-t border-stone-100"><button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-stone-200 font-bold">Annuleren</button><button className="h-11 px-5 rounded-xl bg-emerald-900 text-white font-bold">Opslaan</button></div></form></Modal>
}
