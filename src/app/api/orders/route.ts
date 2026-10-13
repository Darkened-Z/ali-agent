import { z } from "zod";
import { readDb, writeDb, addOrderToDb } from "@/lib/store";

export const runtime = "nodejs";

const CreateOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(5).max(30),
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(80),
  postcode: z.string().min(3).max(15),
  pacCode: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.string(),
        upfront: z.string().optional(),
      })
    )
    .min(1),
});

export async function GET() {
  const db = readDb();
  return Response.json({ orders: db.orders || [] });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = CreateOrderSchema.parse(json);
    const order = addOrderToDb(body);
    return Response.json({ order }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Invalid order payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const db = readDb();
    if (clearAll) {
      db.orders = [];
    } else if (id) {
      db.orders = (db.orders || []).filter(o => o.id !== id);
    } else {
      return Response.json({ error: "Missing id or all parameter" }, { status: 400 });
    }
    writeDb(db);

    return Response.json({ success: true, count: (db.orders || []).length });
  } catch (e) {
    return Response.json({ error: "Delete failed", detail: String(e) }, { status: 500 });
  }
}
