import { getSession } from "@/lib/session";
import MainDashboard from "@/components/main-dashboard";
import LandingPage from "@/components/landing-page";

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    return (
      <div>
        <MainDashboard user={session} />
      </div>
    );
  }

  return <LandingPage />;
}
