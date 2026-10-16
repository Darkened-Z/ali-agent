import { after } from "next/server";
import { z } from "zod";
import { alertNewOrder, confirmOrderToCustomer, notifyDispatched } from "@/lib/notify";
import { rateLimit } from "@/lib/rateLimit";
import { readDb, writeDb, addOrderToDb } from "@/lib/store";
import { requireAdmin } from "@/lib/auth";

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
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await readDb();
  return Response.json({ orders: db.orders || [] });
}

export async function POST(req: Request) {
  const limited = await rateLimit(req, "order", 5, 600);
  if (limited) return limited;
  try {
    const json = await req.json();
    const body = CreateOrderSchema.parse(json);
    const order = await addOrderToDb(body);
    const { settings } = await readDb({ lists: [] });
    after(async () => {
      await confirmOrderToCustomer(settings, order);
      await alertNewOrder(settings, order);
    });
    return Response.json({ order }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Invalid order payload", detail: String(e) },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    const db = await readDb();
    if (clearAll) {
      db.orders = [];
    } else if (id) {
      db.orders = (db.orders || []).filter(o => o.id !== id);
    } else {
      return Response.json({ error: "Missing id or all parameter" }, { status: 400 });
    }
    await writeDb(db);

    return Response.json({ success: true, count: (db.orders || []).length });
  } catch (e) {
    return Response.json({ error: "Delete failed", detail: String(e) }, { status: 500 });
  }
}

const PatchOrderSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["confirmed", "dispatching", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().trim().max(60).optional(),
});

/** Staff update status/tracking; moving to "dispatching" emails the customer once. */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = PatchOrderSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid order update" }, { status: 400 });
  const body = parsed.data;

  const db = await readDb({ lists: ["orders"], ids: { orders: [body.id] } });
  const order = db.orders.find(o => o.id === body.id);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  const wasDispatched = order.status === "dispatching" || order.status === "delivered";
  if (body.trackingNumber !== undefined) order.trackingNumber = body.trackingNumber;
  if (body.status) order.status = body.status;
  await writeDb(db);

  if (!wasDispatched && order.status === "dispatching") {
    const settings = db.settings;
    after(() => notifyDispatched(settings, order));
  }
  return Response.json({ order });
}
