import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminLanguageToggle } from "@/components/admin/AdminLanguageToggle";

export default async function AdminPage(){
  const session=await getAdminSession();
  if(!session) redirect("/admin/login");
  return <>
    <AdminLanguageToggle />
    <AdminDashboard session={session}/>
  </>;
}
