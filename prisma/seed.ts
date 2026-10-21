import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
    url: "file:prisma/dev.db",
  });
const prisma = new PrismaClient({adapter});

async function main() {
  const totalCount = 30;

  // 1. Generate 30 Distinct User Accounts programmatically
  console.log("Generating 30 user profiles...");
  const userIds: string[] = [];
  for (let i = 1; i <= totalCount; i++) {
    const id = `seed_user_${i}`;
    userIds.push(id);
    await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        id,
        email: `user${i}@example.com`,
        password: `secure_hashed_password_${i}`,
        username: `dev_author_${i}`,
        displayName: `Developer Scholar ${i}`,
        bio: `Full-stack pipeline engineering track portfolio log profile number ${i}.`,
      },
    });
  }

  // 2. Generate 30 Specialized Developer Subreddits
  console.log("Generating 30 community spaces...");
  const subIds: string[] = [];
  const techTopics = ["react", "nextjs", "tailwind", "typescript", "prisma", "sqlite", "graphql", "rust", "docker", "node", "css", "html", "git", "aws", "security"];
  
  for (let i = 1; i <= totalCount; i++) {
    const id = `seed_sub_${i}`;
    subIds.push(id);
    const topic = techTopics[(i - 1) % techTopics.length];
    const uniqueName = `${topic}_hub_${i}`;

    await prisma.subreddit.upsert({
      where: { name: uniqueName },
      update: {},
      create: {
        id,
        name: uniqueName,
        description: `The definitive discussion collective matrix covering modern ${topic} core parameters and workflows. instance context ${i}.`,
        creatorId: userIds[(i - 1) % userIds.length],
      },
    });
  }
  // 3. Generate 30 Contextual Post Streams
  console.log("Generating 30 content posts...");
  const postIds: string[] = [];
  for (let i = 1; i <= totalCount; i++) {
    const id = `seed_post_${i}`;
    postIds.push(id);
    await prisma.post.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title: `Deep-Dive Architectural Discussion Summary Log Header Entry #${i}`,
        content: `This is an automated content block checking your infinite scroll streams. We are analyzing engineering lifecycle patterns, layout shift elimination strategies, and performance boundaries across context element ${i}.`,
        subredditId: subIds[(i - 1) % subIds.length],
        authorId: userIds[Math.floor(Math.random() * userIds.length)],
      },
    });
  }

  // 4. Generate 30 Threaded Discussion Comments
  console.log("Generating 30 comment tree items...");
  for (let i = 1; i <= totalCount; i++) {
    const id = `seed_comment_${i}`;
    await prisma.comment.upsert({
      where: { id },
      update: {},
      create: {
        id,
        text: `Automated testing comment index node layout thread pass #${i}. The structural responsiveness of this nested markdown tree element checks out cleanly.`,
        postId: postIds[(i - 1) % postIds.length],
        authorId: userIds[Math.floor(Math.random() * userIds.length)],
        parentId: i > 5 ? `seed_comment_${i - 5}` : null, // Generates nested recursive reply structures safely!
      },
    });
  }
  console.log("Seeding pass completed successfully with 120 total records logged.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
