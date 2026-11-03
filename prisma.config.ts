import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";
import { directConnectionUrl } from "./src/prisma/connection-url";

export default definePrismaConfig({
  skills: {
    agents: ["claude", "cursor", "agents"],
  },
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    // Neon's direct endpoint, shared with the app runtime (see src/prisma/connection-url.ts).
    // Undefined without database variables, so `prisma contract emit` still runs.
    db: { connection: directConnectionUrl() },
  }),
});
