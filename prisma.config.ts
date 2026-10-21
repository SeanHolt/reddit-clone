import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Explicitly target the prisma/ subdirectory
    url: "file:./prisma/dev.db", 
  },
});