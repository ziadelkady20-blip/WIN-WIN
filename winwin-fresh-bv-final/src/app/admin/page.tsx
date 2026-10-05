import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLanguageToggle } from "@/components/admin/AdminLanguageToggle";
import { PiecePricingFix } from "@/components/admin/PiecePricingFix";

export default async function AdminPage(){
  const session=await getAdminSession();
  if(!session) redirect("/admin/login");
  return <>
    <AdminLanguageToggle />
    <PiecePricingFix />
    <AdminDashboard session={session}/>
  </>;
}
