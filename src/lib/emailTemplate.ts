// Shared by the composer preview (browser) and the sender (server), so what you preview is what ships.

export type EmailContent = {
  subject: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type EmailRecipient = { name: string; email: string };

export type EmailBrand = { businessName: string; websiteDomain: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "";
}

export function mergeTags(text: string, to: EmailRecipient): string {
  const first = firstName(to.name);
  return text
    .replace(/\{\{\s*first_name\s*\}\}/gi, first || "there")
    .replace(/\{\{\s*name\s*\}\}/gi, to.name.trim() || "there")
    .replace(/\{\{\s*email\s*\}\}/gi, to.email);
}

function bodyToHtml(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map(para => {
      const html = escapeHtml(para)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#e2533d">$1</a>')
        .replace(/\n/g, "<br>");
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#1d1d1f">${html}</p>`;
    })
    .join("");
}

export function isSafeUrl(url: string | undefined): url is string {
  return !!url && /^https:\/\/[^\s"<>]+$/i.test(url);
}

export function renderEmail(
  content: EmailContent,
  to: EmailRecipient,
  brand: EmailBrand,
  unsubscribeUrl: string
): { subject: string; html: string; text: string } {
  const subject = mergeTags(content.subject, to);
  const body = mergeTags(content.body, to);
  const cta =
    content.ctaLabel?.trim() && isSafeUrl(content.ctaUrl)
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="background:#e2533d;border-radius:6px"><a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;padding:13px 22px;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none">${escapeHtml(content.ctaLabel.trim())}</a></td></tr></table>`
      : "";
  const business = escapeHtml(brand.businessName);
  const site = escapeHtml(brand.websiteDomain);

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<tr><td style="padding:28px 28px 8px;font-size:13px;font-weight:700;letter-spacing:.04em;color:#e2533d;text-transform:uppercase">${business}</td></tr>
<tr><td style="padding:8px 28px 4px">${bodyToHtml(body)}${cta}</td></tr>
<tr><td style="padding:18px 28px 26px;border-top:1px solid #ececef;font-size:12px;line-height:1.5;color:#71717a">
You're getting this because you're a ${business} customer or signed up for our offers.<br>
<a href="${escapeHtml(unsubscribeUrl)}" style="color:#71717a">Unsubscribe</a> · ${site}
</td></tr></table></td></tr></table></body></html>`;

  const ctaText = cta ? `\n\n${content.ctaLabel!.trim()}: ${content.ctaUrl}` : "";
  const text = `${body.trim()}${ctaText}\n\n—\n${brand.businessName} · ${brand.websiteDomain}\nUnsubscribe: ${unsubscribeUrl}`;

  return { subject, html, text };
}

/** Plain service email (order receipts, staff alerts): no marketing footer or unsubscribe. */
export function renderTransactional(
  brand: EmailBrand,
  heading: string,
  paragraphs: string[],
  rows: [string, string][] = []
): { html: string; text: string } {
  const table = rows.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:4px 0 20px;border-top:1px solid #ececef">${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:8px 0;border-bottom:1px solid #ececef;color:#71717a;font-size:13px;width:38%">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #ececef;color:#1d1d1f;font-size:14px">${escapeHtml(v)}</td></tr>`
        )
        .join("")}</table>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
<tr><td style="padding:28px 28px 4px;font-size:13px;font-weight:700;letter-spacing:.04em;color:#e2533d;text-transform:uppercase">${escapeHtml(brand.businessName)}</td></tr>
<tr><td style="padding:8px 28px 8px"><h1 style="margin:0 0 14px;font-size:20px;color:#1d1d1f">${escapeHtml(heading)}</h1>
${paragraphs.map(p => `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#1d1d1f">${escapeHtml(p)}</p>`).join("")}${table}</td></tr>
<tr><td style="padding:14px 28px 24px;border-top:1px solid #ececef;font-size:12px;color:#71717a">${escapeHtml(brand.businessName)} · ${escapeHtml(brand.websiteDomain)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [heading, "", ...paragraphs, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  return { html, text };
}
