import { db } from "@/lib/db";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { SubmitPostForm } from "./SubmitPostForm";
import { connection } from "next/server";

interface SubmitPostWrapperProps {
    slugPromise: Promise<{ slug: string }>;
}

export async function SubmitPostWrapper({ slugPromise }: SubmitPostWrapperProps) {
    await connection();
    const { slug } = await slugPromise;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    if (!session.user.username) {
        redirect("/settings/username");
    }

    const subreddit = await db.subreddit.findUnique({
        where: { name: slug },
        select: { id: true, name: true },
    });

    if (!subreddit) {
        notFound();
    }

    return (
        <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
                <h1 className="text-xl font-bold text-gray-900">Create a post</h1>
                <p className="text-xs text-gray-500">Posting to <span className="font-semibold text-gray-700">r/{subreddit.name}</span></p>
            </div>
            <SubmitPostForm subredditName={subreddit.name} subredditId={subreddit.id} />
        </div>
    );
}
