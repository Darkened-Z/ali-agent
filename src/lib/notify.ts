import crypto from "crypto";
import { appUrl, isEmailConfigured, isValidEmail, sendBatch } from "./email";
import { renderTransactional } from "./emailTemplate";
import type { AppSettings, LeadRecord, OrderRecord } from "./store";

async function send(to: string, subject: string, content: { html: string; text: string }, replyTo?: string) {
  if (!isEmailConfigured() || !isValidEmail(to)) return;
  try {
    await sendBatch([{ to, subject, ...content, replyTo }], `notify-${crypto.randomUUID()}`);
  } catch (e) {
    console.error("notification email failed", e instanceof Error ? e.message : e);
  }
}

export async function alertNewLead(settings: AppSettings, lead: LeadRecord) {
  await send(
    settings.general.contactEmail,
    `New lead: ${lead.name} (${lead.status})`,
    renderTransactional(
      settings.general,
      "New callback request",
      [`${lead.name} wants a call about: ${lead.interest}.`],
      [
        ["Phone", lead.phone],
        ["City", lead.city],
        ["Best time", lead.bestTime ?? "any"],
        ["Score", `${lead.score} (${lead.status})`],
        ["Open in admin", `${appUrl()}/admin/leads`],
      ]
    )
  );
}

export async function alertHandoff(
  settings: AppSettings,
  conv: { id: string; name: string; phone: string; channel: string },
  reason: string,
  lastMessage: string
) {
  await send(
    settings.general.contactEmail,
    `Customer needs a person: ${conv.name}`,
    renderTransactional(
      settings.general,
      "A conversation was handed to your team",
      [`Reason: ${reason}.`, `Last message: “${lastMessage}”`],
      [
        ["Customer", conv.name],
        ["Phone", conv.phone || "—"],
        ["Channel", conv.channel === "wa" ? "WhatsApp" : "Website chat"],
        ["Reply in admin", `${appUrl()}/admin`],
      ]
    )
  );
}

export async function alertNewOrder(settings: AppSettings, order: OrderRecord) {
  await send(
    settings.general.contactEmail,
    `New order ${order.id}: ${order.customerName}`,
    renderTransactional(
      settings.general,
      "New order to dispatch",
      [order.items.map(i => i.name).join(", ")],
      [
        ["Customer", `${order.customerName} · ${order.phone}`],
        ["Deliver to", `${order.address}, ${order.city} ${order.postcode}`],
        ["Monthly", order.monthlyTotal],
        ["Upfront", order.upfrontTotal],
        ["Payment", order.paymentMethod],
        ...(order.pacCode ? ([["PAC code", order.pacCode]] as [string, string][]) : []),
      ]
    )
  );
}

export async function confirmOrderToCustomer(settings: AppSettings, order: OrderRecord) {
  const first = order.customerName.split(" ")[0];
  await send(
    order.email,
    `Your order ${order.id} is confirmed`,
    renderTransactional(
      settings.general,
      `Thanks, ${first} — your order is in`,
      [
        "We've received your order and will email tracking details as soon as it's dispatched.",
        order.pacCode ? "We'll use your PAC code to move your number across on the day of activation." : "",
      ].filter(Boolean),
      [
        ["Order", order.id],
        ["Items", order.items.map(i => i.name).join(", ")],
        ["Monthly", order.monthlyTotal],
        ["Paid upfront", order.upfrontTotal],
        ["Delivery", `${order.address}, ${order.city} ${order.postcode}`],
      ]
    ),
    settings.general.contactEmail
  );
}

export async function notifyDispatched(settings: AppSettings, order: OrderRecord) {
  await send(
    order.email,
    `Your order ${order.id} is on its way`,
    renderTransactional(
      settings.general,
      "Your order has been dispatched",
      ["Good news — your order has left us and should arrive on the next working day."],
      [
        ["Order", order.id],
        ["Tracking", order.trackingNumber || "Your courier will text you a delivery slot"],
        ["Delivery", `${order.address}, ${order.city} ${order.postcode}`],
      ]
    ),
    settings.general.contactEmail
  );
}
