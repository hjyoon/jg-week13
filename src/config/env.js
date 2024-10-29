import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, `../../.env.${process.env.NODE_ENV}`);

if (existsSync(envPath)) {
  dotenv.config({
    path: envPath,
  });
} else {
  dotenv.config({
    path: join(__dirname, "../../.env"),
  });
}
