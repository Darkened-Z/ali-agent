// Compact string catalogue of every deal in plans.ts, formatted for the model.
// Kept as a single derived string so the system prompt stays cache-friendly.

import {
  phoneDeals,
  phoneModels,
  simOnlyPlans,
  simFreePhones,
  refurbPhones,
} from "./plans";

function money(n: number): string {
  return `£${n.toFixed(2).replace(/\.00$/, "")}`;
}

function data(d: number | "unlimited"): string {
  return d === "unlimited" ? "Unlimited" : `${d}GB`;
}

const dealsLines = phoneDeals.map(d => {
  const rise = d.priceRises?.length
    ? ` (→${money(d.priceRises[0].monthly)} Apr'27, →${money(d.priceRises[1]?.monthly ?? d.priceRises[0].monthly)} Apr'28)`
    : "";
  const total = d.totalCost ? `, total ${money(d.totalCost)}` : "";
  const tags = d.tags?.length ? ` [${d.tags.join(",")}]` : "";
  return `- ${d.model} ${d.storageGb}GB ${d.colour} · ${d.network} · ${money(d.monthly)}/mo${rise}, ${money(d.upfront)} upfront, ${d.contractMonths}m, ${data(d.dataGb)}${d.fiveG ? " 5G" : ""}, unlimited mins & texts${total}${tags}`;
});

const modelLines = phoneModels.map(m => {
  const sf = m.simFreeFrom ? `, SIM-free from ${money(m.simFreeFrom)}` : "";
  const cols = m.colours.length ? ` · ${m.colours.join("/")}` : "";
  const storages = m.storages.length ? ` · ${m.storages.map(s => s + "GB").join("/")}` : "";
  return `- ${m.brand} ${m.model}${storages}${cols} · from ${money(m.fromMonthly)}/mo${sf}`;
});

const simLines = simOnlyPlans.map(p => {
  const rise = p.priceRises?.length
    ? ` (→${money(p.priceRises[0].monthly)} Apr'27, →${money(p.priceRises[1]?.monthly ?? p.priceRises[0].monthly)} Apr'28)`
    : "";
  const term = p.contractMonths === 1 ? "rolling 30-day" : `${p.contractMonths}-month`;
  const cb = p.cashback ? `, £${p.cashback} cashback` : "";
  return `- ${p.network} ${term} · ${money(p.monthly)}/mo${rise} · ${data(p.dataGb)}${p.fiveG ? " 5G" : ""}, unlimited mins & texts, ${money(p.upfront)} upfront${cb}`;
});

const simFreeLines = simFreePhones.map(p => {
  const sto = p.storageGb ? ` ${p.storageGb}GB` : "";
  return `- ${p.brand} ${p.model}${sto} · ${p.colours.join("/") || "—"} · ${money(p.price)} SIM-free`;
});

const refurbLines = refurbPhones.map(p =>
  `- ${p.brand} ${p.model} ${p.storageGb}GB ${p.colour} · ${p.grade} · ${money(p.simFreePrice)} SIM-free`
);

export const PLAN_CATALOGUE = `
CONTRACT DEALS (source: fonehouse.co.uk, GBP):
${dealsLines.join("\n")}

MODEL RANGE (starting prices; drill in for full variants):
${modelLines.join("\n")}

SIM-ONLY PLANS:
${simLines.join("\n")}

SIM-FREE (outright):
${simFreeLines.join("\n")}

REFURBISHED (SIM-free, all Google Pixel):
${refurbLines.join("\n")}
`.trim();

export const CATALOGUE_STATS = {
  deals: phoneDeals.length,
  models: phoneModels.length,
  simOnly: simOnlyPlans.length,
  simFree: simFreePhones.length,
  refurb: refurbPhones.length,
};
