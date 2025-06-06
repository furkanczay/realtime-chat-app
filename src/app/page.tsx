import { getSession } from "@/lib/session";
import MainDashboard from "@/components/main-dashboard";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    return redirect("/login");
  }

  return (
    <div>
      <MainDashboard user={session} />
    </div>
  );
}
