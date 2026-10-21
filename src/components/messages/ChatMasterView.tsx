import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessageSidebar } from "./MessageSidebar";
import { DirectMessagePane, MessageItem } from "./DirectMessagePane";
import { connection } from "next/server";

interface ChatMasterViewProps {
    searchParamsPromise: Promise<{ u?: string }>;
}

export async function ChatMasterView({ searchParamsPromise }: ChatMasterViewProps) {
    await connection();
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { u: targetUserId } = await searchParamsPromise;
    let chatPaneElement = (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400 dark:text-gray-500 font-medium italic h-full bg-white dark:bg-gray-900 transition-colors">
            💬 Select a conversation thread from the sidebar panel to begin chatting!
        </div>
    );

    // If a user reference string exists in the URL parameters, fetch the conversation log
    if (targetUserId && targetUserId !== session.user.id) {
        const targetUser = await db.user.findUnique({
            where: { id: targetUserId },
            select: { id: true, username: true },
        });

        if (targetUser) {
            const rawDMs = await db.directMessage.findMany({
                where: {
                    OR: [
                        { senderId: session.user.id, receiverId: targetUserId },
                        { senderId: targetUserId, receiverId: session.user.id },
                    ],
                },
                orderBy: { createdAt: "asc" },
            });

            const initialMessages: MessageItem[] = rawDMs.map((dm) => ({
                id: dm.id,
                text: dm.text,
                senderId: dm.senderId,
                receiverId: dm.receiverId,
                createdAt: dm.createdAt.toISOString(),
            }));

            chatPaneElement = (
                <div className="flex-1">
                    <DirectMessagePane
                        initialMessages={initialMessages}
                        currentUserId={session.user.id}
                        receiverId={targetUser.id}
                        receiverUsername={targetUser.username || "anonymous"}
                    />
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col md:flex-row border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-gray-900 transition-colors">
            <MessageSidebar currentUserId={session.user.id} activeChatUserId={targetUserId} />
            {chatPaneElement}
        </div>
    );
}