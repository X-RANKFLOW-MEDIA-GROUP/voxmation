#!/usr/bin/env node
/**
 * Export environment variables from the Vercel project.
 *
 * Usage:
 *   VERCEL_TOKEN=xxx node scripts/export-vercel-env.mjs [--dotenv] [--target=production]
 *
 * Env vars:
 *   VERCEL_TOKEN       (required) Vercel API token — https://vercel.com/account/tokens
 *   VERCEL_PROJECT_ID  (optional) project ID or name, defaults to "voxmation"
 *   VERCEL_TEAM_ID     (optional) team ID, required if the project belongs to a team
 *
 * Flags:
 *   --dotenv             print KEY=value lines (sensitive vars have no value and are skipped with a warning)
 *   --target=<env>       only vars for a target: production | preview | development
 *   (default)            print the list of variable keys
 */

const token = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID || "voxmation";
const teamId = process.env.VERCEL_TEAM_ID;

const args = process.argv.slice(2);
const asDotenv = args.includes("--dotenv");
const targetArg = args.find((a) => a.startsWith("--target="));
const target = targetArg ? targetArg.split("=")[1] : null;

if (!token) {
  console.error("Error: VERCEL_TOKEN is not set. Create one at https://vercel.com/account/tokens");
  process.exit(1);
}

async function exportEnvVars() {
  const data = await vercelGet(`/v9/projects/${projectId}/env`);
  let envs = data.envs ?? [];

  if (target) {
    envs = envs.filter((e) => e.target?.includes(target));
  }

  if (asDotenv) {
    for (const e of envs) {
      if (e.type === "sensitive") {
        console.error(`# skipped ${e.key} (sensitive — value not readable via API)`);
        continue;
      }
      // The list endpoint returns encrypted vars as ciphertext; the
      // per-variable endpoint is the only one that decrypts them.
      const detail =
        e.decrypted === false
          ? await vercelGet(`/v9/projects/${projectId}/env/${e.id}`)
          : e;
      if (detail.value == null || detail.decrypted === false) {
        console.error(`# skipped ${e.key} (value not decryptable — token may lack permission)`);
        continue;
      }
      console.log(`${e.key}=${dotenvValue(detail.value)}`);
    }
  } else {
    for (const e of envs) {
      console.log(e.key);
    }
  }
}

function dotenvValue(value) {
  if (!/[\n\r"'#\s\\]/.test(value)) return value;
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n")}"`;
}

async function vercelGet(path) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Vercel API request failed (${res.status} ${res.statusText}): ${body}`);
    process.exit(1);
  }

  return res.json();
}

exportEnvVars().catch((err) => {
  console.error("Unexpected error:", err.message);
  process.exit(1);
});
