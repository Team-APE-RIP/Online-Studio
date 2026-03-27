import { spawn } from "node:child_process";

function getEnv(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  throw new Error(
    `Missing required environment variable. Checked: ${names.join(", ")}`,
  );
}

function buildDatabaseUrlFromParts() {
  const host = getEnv("DB_RUNTIME_HOST", "DB_HOST");
  const port = getEnv("DB_RUNTIME_PORT", "DB_PORT");
  const database = getEnv("DB_RUNTIME_NAME", "DB_NAME");
  const user = getEnv("DB_RUNTIME_USER", "DB_USER");
  const password = getEnv("DB_RUNTIME_PASSWORD", "DB_PASSWORD");

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  return `mysql://${encodedUser}:${encodedPassword}@${host}:${port}/${database}`;
}

function getRedactedTarget(url) {
  try {
    const parsed = new URL(url);
    const databaseName = parsed.pathname.replace(/^\//, "");

    return `${parsed.protocol}//${parsed.username || "(empty-user)"}:***@${parsed.hostname}:${parsed.port || "3306"}/${databaseName}`;
  } catch {
    return "invalid DATABASE_URL";
  }
}

async function main() {
  const command = process.argv.slice(2).join(" ").trim();

  if (!command) {
    console.error("[with-db-env] No command provided.");
    process.exit(1);
  }

  try {
    process.env.DATABASE_URL = buildDatabaseUrlFromParts();
  } catch (error) {
    if (!process.env.DATABASE_URL?.trim()) {
      console.error(`[with-db-env] ${error.message}`);
      process.exit(1);
    }
  }

  console.log(
    `[with-db-env] Using database target: ${getRedactedTarget(process.env.DATABASE_URL)}`,
  );

  const child = spawn(command, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });

  child.on("error", (error) => {
    console.error("[with-db-env] Failed to start command:", error);
    process.exit(1);
  });
}

main();