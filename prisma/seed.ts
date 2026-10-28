import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

interface PresetMarketItem {
  title: string;
  description: string;
  assetType: "BORDER_GLOW" | "FONT_STYLE" | "BADGE";
  styleValue: string;
  price: number;
}
const SAMPLE_MARKETPLACE_ITEMS: PresetMarketItem[] = [
  {
    title: "Cyber Neon Orange Glow",
    description:
      "Surrounds your comments with a striking, high-intensity neon orange border and matching outer drop shadow profile.",
    assetType: "BORDER_GLOW",
    styleValue:
      "border-orange-500 shadow-[0_0_12px_rgba(234,88,12,0.4)] dark:shadow-[0_0_15px_rgba(234,88,12,0.65)]",
    price: 150,
  },
  {
    title: "Deep Amethyst Matrix Glow",
    description:
      "Surrounds comment blocks with an elegant, glowing dark purple cyberpunk trim overlay.",
    assetType: "BORDER_GLOW",
    styleValue:
      "border-purple-600 shadow-[0_0_12px_rgba(147,51,234,0.4)] dark:shadow-[0_0_15px_rgba(147,51,234,0.65)]",
    price: 250,
  },
  {
    title: "Elegant Vintage Italic Script",
    description:
      "Transforms plain character typography blocks into fluid, highly expressive serif cursive fonts.",
    assetType: "FONT_STYLE",
    styleValue:
      "font-serif italic font-semibold tracking-wide text-gray-800 dark:text-gray-100",
    price: 100,
  },
  {
    title: "Elite Developer Monospace Mono",
    description:
      "Forces comment descriptions to render inside clean hacking-terminal styling fonts.",
    assetType: "FONT_STYLE",
    styleValue:
      "font-mono tracking-tight font-medium text-emerald-600 dark:text-emerald-400",
    price: 120,
  },
];
const adapter = new PrismaLibSql({
  url: "file:prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

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
  const techTopics = [
    "react",
    "nextjs",
    "tailwind",
    "typescript",
    "prisma",
    "sqlite",
    "graphql",
    "rust",
    "docker",
    "node",
    "css",
    "html",
    "git",
    "aws",
    "security",
  ];

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
  console.log(
    "Seeding pass completed successfully with 120 total records logged.",
  );
  console.log("🚀 Initializing marketplace sample item seed routine...");

  // 1. Locate an existing administrative or system user account handle to serve as the initial item creator
  const defaultCreator = await prisma.user.findFirst({
    select: { id: true, username: true },
  });

  if (!defaultCreator) {
    console.error(
      "❌ Seeding Cancelled: No user accounts found in the database. Please register a profile account first!",
    );
    return;
  }

  console.log(
    `👤 Attaching marketplace creation products to operator: u/${defaultCreator.username}`,
  );

  // 2. Iterate across items and commit them down to the SQLite table ledger rows cleanly
  for (const item of SAMPLE_MARKETPLACE_ITEMS) {
    await prisma.marketplaceItem.upsert({
      where: { id: `preset_${item.title.toLowerCase().replace(/\s+/g, "_")}` },
      update: {},
      create: {
        id: `preset_${item.title.toLowerCase().replace(/\s+/g, "_")}`,
        title: item.title,
        description: item.description,
        assetType: item.assetType,
        styleValue: item.styleValue,
        price: item.price,
        creatorId: defaultCreator.id,
      },
    });
  }

  console.log(
    "✨ Marketplace seed metrics injected successfully with perfect structural integrity!",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
