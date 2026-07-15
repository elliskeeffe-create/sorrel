import path from "node:path";
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Resolved at CLI runtime so the project folder can be moved/renamed
    // without breaking migrations or db commands.
    url: "file:" + path.resolve(process.cwd(), "prisma/dev.db"),
  },
});
