import { Config, defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./db/schema", // 스키마 파일 경로
    out: "./db/migrations", // 마이그레이션 파일 출력 경로
    dialect: "sqlite", // 사용할 데이터베이스 종류
    driver: "expo",
}) satisfies Config;