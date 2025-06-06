import { getSession } from "@/actions";
import MainDashboard from "@/components/main-dashboard";

export default async function Home() {
  const session = await getSession();

  return (
    <div>
      <MainDashboard user={session} />
    </div>
  );
}
