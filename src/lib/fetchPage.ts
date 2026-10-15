import dns from "dns/promises";
import net from "net";

const MAX_BYTES = 2_000_000;
const MAX_TEXT = 20_000;
const MAX_REDIRECTS = 3;

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6 === "::1" || v6 === "::" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

// The URL comes from an admin, but the server fetches it, so block anything that resolves to an internal address.
async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) links can be imported");
  if (url.username || url.password) throw new Error("Links with credentials aren't allowed");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(a => isPrivateAddress(a.address))) {
    throw new Error("That address isn't publicly reachable");
  }
  return url;
}

function htmlToText(html: string): { title: string; text: string } {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
  const text = html
    .replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
  return { title, text: text.slice(0, MAX_TEXT) };
}

/** Fetches a public web page and returns readable text for the knowledge base. */
export async function fetchPageText(raw: string): Promise<{ title: string; text: string }> {
  let url = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: { "user-agent": "AliAgentKB/1.0", accept: "text/html,text/plain" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = await assertPublicUrl(new URL(res.headers.get("location")!, url).toString());
      continue;
    }
    if (!res.ok) throw new Error(`The page returned ${res.status}`);
    const type = res.headers.get("content-type") ?? "";
    if (!/text\/(html|plain)/i.test(type)) throw new Error("Only web pages and plain text can be imported");
    if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) throw new Error("That page is too large");
    const body = (await res.text()).slice(0, MAX_BYTES);
    return type.includes("html") ? htmlToText(body) : { title: "", text: body.slice(0, MAX_TEXT).trim() };
  }
  throw new Error("Too many redirects");
}
