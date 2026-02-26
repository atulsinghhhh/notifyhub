
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";

async function testEnv() {
    console.log("Current working directory:", process.cwd());
    const envPath = path.join(process.cwd(), ".env");
    console.log(".env exists:", fs.existsSync(envPath));

    dotenv.config();
    console.log("DATABASE_URL from process.env:", process.env.DATABASE_URL ? "Exists" : "MISSING");
    if (process.env.DATABASE_URL) {
        console.log("DATABASE_URL length:", process.env.DATABASE_URL.length);
        console.log("DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 30));
    }
}

testEnv();
