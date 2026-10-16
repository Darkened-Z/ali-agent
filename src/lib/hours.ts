import type { AppSettings } from "./store";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type HoursStatus = { open: boolean; nextOpen: string | null };

function zoneFor(settings: AppSettings): string {
  return settings.general.timezone === "utc" ? "UTC" : "Europe/London";
}

function localParts(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map(p => [p.type, p.value])
  );
  return { day: parts.weekday as string, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : NaN;
};

/** Business hours from Settings, evaluated in the business's own time zone. */
export function hoursStatus(settings: AppSettings, now = new Date()): HoursStatus {
  const { day, minutes } = localParts(now, zoneFor(settings));
  const today = settings.hours[day];
  const open =
    !!today?.enabled &&
    minutes >= toMinutes(today.open) &&
    minutes < toMinutes(today.close);
  if (open) return { open, nextOpen: null };

  const start = DAYS.indexOf(day);
  for (let offset = 0; offset < 7; offset++) {
    const name = DAYS[(start + offset) % 7];
    const h = settings.hours[name];
    if (!h?.enabled || !h.open) continue;
    if (offset === 0 && minutes >= toMinutes(h.open)) continue;
    const when = offset === 0 ? "today" : offset === 1 ? "tomorrow" : name;
    return { open: false, nextOpen: `${when} at ${h.open}` };
  }
  return { open: false, nextOpen: null };
}

/** Calendar date (YYYY-MM-DD) in the business's time zone, for "today" counters. */
export function localDate(settings: AppSettings, date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zoneFor(settings) }).format(date);
}
