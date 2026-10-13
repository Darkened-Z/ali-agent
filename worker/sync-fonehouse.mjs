#!/usr/bin/env node
/**
 * Ali Agent — Fonehouse UK Catalogue Sync Worker
 * Updates .data/db.json with a fresh catalogue sync timestamp.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../.data/db.json");

const now = new Date();
const stamp = `${now.toLocaleDateString("en-GB", {
  month: "short",
  day: "2-digit",
})}, ${now.toTimeString().slice(0, 5)}`;

if (fs.existsSync(dbPath)) {
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  db.lastCatalogueSync = stamp;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log(`[worker] Updated lastCatalogueSync -> ${stamp} in ${dbPath}`);
} else {
  console.log(`[worker] Database will be initialized on first API request (${stamp}).`);
}
