import { getSession } from "@/actions";
import ChatRoom from "@/components/chat-room";

export default async function Home() {
  const session = await getSession();
  
  return (
    <div>
      <ChatRoom username={session.username!} />
    </div>
  );
}
