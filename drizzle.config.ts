import { Config, defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/shared/db/schema",
    out: "./src/shared/db/migrations",
    dialect: "sqlite",
    driver: "expo",
}) satisfies Config;
