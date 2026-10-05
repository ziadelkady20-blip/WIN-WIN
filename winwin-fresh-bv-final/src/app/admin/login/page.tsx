"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LockKeyhole, ArrowRight } from "lucide-react";

export default function AdminLoginPage(){
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setLoading(true); setError("");
    try{
      const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Invalid credentials");
      router.replace("/admin");
      router.refresh();
    }catch(err:any){setError(err.message||"Login failed");}finally{setLoading(false);}
  }

  return <main className="min-h-screen bg-[#0a2f23] flex items-center justify-center p-5">
    <div className="w-full max-w-md">
      <div className="text-center mb-8"><div className="inline-flex p-3 rounded-2xl bg-white"><Image src="/images/winwin-logo.png" width={250} height={90} alt="WIN & WIN FRESH BV" className="h-14 w-auto object-contain"/></div><p className="mt-4 text-xs uppercase tracking-[.22em] text-emerald-200">Management Portal</p></div>
      <form onSubmit={submit} className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl">
        <h1 className="text-2xl font-black text-stone-900">Admin aanmelden</h1>
        <p className="mt-2 text-sm text-stone-500">Beheer producten, bestellingen en website-inhoud.</p>
        {error&&<div className="mt-5 rounded-xl bg-red-50 border border-red-100 text-red-800 p-3 text-sm">{error}</div>}
        <label className="block mt-6"><span className="text-xs font-semibold">E-mailadres</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 px-3.5 outline-none focus:border-emerald-700"/></label>
        <label className="block mt-4"><span className="text-xs font-semibold">Wachtwoord</span><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-1.5 w-full h-12 rounded-xl border border-stone-200 px-3.5 outline-none focus:border-emerald-700"/></label>
        <button disabled={loading} className="mt-6 w-full h-12 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">{loading?"Bezig...":"Aanmelden"}<ArrowRight className="w-4"/></button>
        <p className="mt-5 text-center text-[11px] text-stone-400 flex justify-center gap-1"><LockKeyhole className="w-3.5"/> Secure admin access</p>
      </form>
    </div>
  </main>
}
