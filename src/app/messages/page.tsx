import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DirectMessagePane } from "@/components/messages/DirectMessagePane";
import Link from "next/link";

export const instant = false;

interface MessagesPageProps {
  searchParams: Promise<{ partnerid?: string; username?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { partnerid, username } = await searchParams;

  const existingRooms = await db.directMessage.findMany({
    where: { OR: [{ senderId: session.user.id }, { receiverId: session.user.id }] },
    orderBy: { createdAt: "desc" },
    include: { sender: true, receiver: true },
  });

  let activePartnerId = partnerid || null;
  let activePartnerUsername = username || "";

  if (!activePartnerId && existingRooms.length > 0) {
    const lastMsg = existingRooms[0];
    activePartnerId = lastMsg.senderId === session.user.id ? lastMsg.receiverId : lastMsg.senderId;
    activePartnerUsername = (lastMsg.senderId === session.user.id ? lastMsg.receiver.username : lastMsg.sender.username) || "";
  }

  const messages = activePartnerId
    ? await db.directMessage.findMany({
        where: {
          OR: [
            { senderId: session.user.id, receiverId: activePartnerId },
            { senderId: activePartnerId, receiverId: session.user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="py-6 max-w-5xl mx-auto h-[80vh] flex gap-4 animate-fadeIn px-4">
      <div className="w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 overflow-y-auto space-y-2">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Chats</h3>
        {partnerid && !existingRooms.some(r => r.senderId === partnerid || r.receiverId === partnerid) && (
          <Link href={`/messages?partnerid=${partnerid}&username=${username}`} className="block px-3 py-2 text-xs font-bold bg-orange-50 dark:bg-orange-950/20 text-orange-600 rounded-lg border border-orange-200 dark:border-orange-900/40">
            💬 u/{username} (New)
          </Link>
        )}
        {existingRooms.map((room) => {
          const partner = room.senderId === session.user.id ? room.receiver : room.sender;
          const isActive = activePartnerId === partner.id;
          return (
            <Link key={room.id} href={`/messages?partnerid=${partner.id}&username=${partner.username}`} className={`block px-3 py-2 text-xs font-semibold rounded-lg border ${isActive ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" : "border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-950"}`}>
              u/{partner.username}
            </Link>
          );
        })}
      </div>
      <div className="flex-1">
        {activePartnerId ? (
          <DirectMessagePane initialMessages={messages} currentUserId={session.user.id} receiverId={activePartnerId} receiverUsername={activePartnerUsername} />
        ) : (
          <div className="h-full border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-xs text-gray-400 font-medium italic">Select a conversation split.</div>
        )}
      </div>
    </div>
  );
}
