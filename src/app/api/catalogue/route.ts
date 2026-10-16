import { readDb, writeDb } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({
    customPlans: db.customPlans,
    customDevices: db.customDevices,
    lastCatalogueSync: db.lastCatalogueSync,
  });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const db = await readDb();
    const now = new Date();
    const stamp = `${now.toLocaleDateString("en-GB", {
      month: "short",
      day: "2-digit",
    })}, ${now.toTimeString().slice(0, 5)}`;

    if (body.action === "sync") {
      db.lastCatalogueSync = stamp;
      await writeDb(db);
      return Response.json({
        lastCatalogueSync: db.lastCatalogueSync,
        customPlans: db.customPlans,
        customDevices: db.customDevices,
      });
    }

    if (body.type === "plan") {
      const monthly = Number(body.monthly) || 25;
      const upfront = Number(body.upfront) || 0;
      const months = Number(body.contractMonths) || 24;
      const kind = body.kind === "SIM only" ? "SIM only" : "Contract";
      const plan = {
        id: `custom-plan-${Date.now()}`,
        network: body.network || "Three",
        title: body.title || "Custom Tariff",
        sub: body.sub || "100GB 5G · Unlimited mins & texts",
        monthly,
        monthlyLabel: `£${monthly.toFixed(monthly % 1 ? 2 : 0)} / mo`,
        contractLabel:
          kind === "SIM only" && months === 1
            ? `Rolling · £${upfront} upfront`
            : `${months}m · £${upfront} upfront`,
        extraRight:
          kind === "Contract"
            ? `Total £${(monthly * months + upfront).toLocaleString()}`
            : body.cashback
            ? `£${body.cashback} cashback`
            : "",
        kind: kind as "Contract" | "SIM only",
        tag: "featured",
      };
      db.customPlans.unshift(plan);
      await writeDb(db);
      return Response.json({ plan, customPlans: db.customPlans }, { status: 201 });
    }

    if (body.type === "device") {
      const device = {
        id: `DEV-${Math.floor(1200 + Math.random() * 8000)}`,
        brand: body.brand || "Apple",
        name: body.name || "Custom Handset",
        variant: body.variant || "256 GB · Black",
        price: body.price || "£799",
        meta: body.meta || "In stock · Next-day",
        kind: (body.kind || "New") as "New" | "SIM-free" | "Refurbished",
      };
      db.customDevices.unshift(device);
      await writeDb(db);
      return Response.json(
        { device, customDevices: db.customDevices },
        { status: 201 }
      );
    }

    return Response.json({ error: "Unknown catalogue action" }, { status: 400 });
  } catch (e) {
    return Response.json(
      { error: "Invalid catalogue request", detail: String(e) },
      { status: 400 }
    );
  }
}
