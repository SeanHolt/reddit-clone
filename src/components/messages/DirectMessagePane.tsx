"use client";

import { useState, useEffect, useRef } from "react";

export interface MessageItem {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    createdAt: string | Date;
}

interface DirectMessagePaneProps {
    initialMessages: MessageItem[];
    currentUserId: string;
    receiverId: string;
    receiverUsername: string;
}

export function DirectMessagePane({ initialMessages, currentUserId, receiverId, receiverUsername }: DirectMessagePaneProps) {
    const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // 1. Live Chat Syncing Background Polling Hook
    useEffect(() => {
        if (!receiverId) return;

        const pollIncomingMessages = async () => {
            // Pinpoint the client's latest known timestamp marker threshold cleanly
            const lastMsg = messages[messages.length - 1];
            const afterTime = lastMsg ? (typeof lastMsg.createdAt === "string" ? lastMsg.createdAt : lastMsg.createdAt.toISOString()) : new Date(0).toISOString();

            try {
                const url = `/api/messages/sync?partnerId=${receiverId}&after=${encodeURIComponent(afterTime)}`;
                const res = await fetch(url);
                if (!res.ok) return;

                const newMessages: MessageItem[] = await res.json();

                // Append newly fetched rows to the state array without causing visual shifts
                if (newMessages.length > 0) {
                    setMessages((prev) => [...prev, ...newMessages]);
                }
            } catch (err) {
                console.error("POLLING_SYNC_ERROR:", err);
            }
        };

        // Instantiate a light background short-polling timer every 4000ms
        const timer = setInterval(pollIncomingMessages, 4000);
        return () => clearInterval(timer);
    }, [receiverId, messages]);
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        const pendingText = text.trim();
        setText("");

        // Optimistic Update: Instantly inject your text row locally to make the UI feel ultra-snappy
        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMsg: MessageItem = {
            id: optimisticId,
            text: pendingText,
            senderId: currentUserId,
            receiverId,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId, text: pendingText }),
            });

            if (!res.ok) throw new Error("Message delivery failure.");

            // Remove placeholder ID tracking vectors on remote database commit pass success
            setMessages((prev) => prev.map((m) => m.id === optimisticId ? { ...m, id: `real-${Date.now()}` } : m));
        } catch (err) {
            console.error(err);
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId)); // Wipe on network fault
            setText(pendingText);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[75vh] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-200">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Chat with u/{receiverUsername}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 font-medium italic">This is the beginning of your private message history log.</div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}>
                                <div className={`px-4 py-2 text-sm rounded-2xl shadow-sm break-words ${isMe ? "bg-orange-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"}`}>{msg.text}</div>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 px-1 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        );
                    })
                )}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/10 flex gap-2">
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message u/${receiverUsername}...`} disabled={isLoading} className="flex-1 px-4 py-2 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-50" />
                <button type="submit" disabled={isLoading || !text.trim()} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-5 rounded-full transition disabled:opacity-50 shadow-sm">Send</button>
            </form>
        </div>
    );
}