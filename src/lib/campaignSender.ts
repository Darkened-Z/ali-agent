import { readDb, writeDb, type CampaignRecord } from "./store";
import { BATCH_SIZE, ResendError, sendBatch, unsubscribeLinks } from "./email";
import { renderEmail } from "./emailTemplate";
import { audienceOf } from "./emailStore";
import { localDate } from "./hours";

// Resend's default limit is a few requests per second per team.
const BATCH_GAP_MS = 600;

export type SliceResult = {
  campaign?: CampaignRecord;
  remaining: number;
  waiting?: boolean;
  failed?: boolean;
};

/**
 * Sends as much of a campaign as fits in the time budget and the campaign's daily cap.
 * Progress (cursor) is saved after every batch and re-read before the next, so pauses from
 * the UI, a second tab, or the daily cron never double-send.
 */
export async function runCampaignSlice(id: string, budgetMs: number): Promise<SliceResult> {
  const started = Date.now();
  const { contacts } = await readDb({ lists: ["contacts"] });
  let rateLimitRetries = 0;

  for (;;) {
    const db = await readDb({ lists: ["campaigns"], ids: { campaigns: [id] } });
    const campaign = db.campaigns.find(c => c.id === id);
    if (!campaign) return { remaining: 0 };

    const pending = audienceOf(contacts, campaign.list).filter(c => c.id > campaign.cursor);
    if (campaign.status !== "sending") return { campaign, remaining: pending.length };

    if (pending.length === 0) {
      campaign.status = "sent";
      campaign.finishedAt = new Date().toISOString();
      campaign.capReachedOn = undefined;
      await writeDb(db);
      return { campaign, remaining: 0 };
    }

    const today = localDate(db.settings);
    const sentToday = campaign.sentToday?.date === today ? campaign.sentToday.count : 0;
    const allowance = campaign.dailyLimit ? campaign.dailyLimit - sentToday : BATCH_SIZE;
    if (allowance <= 0) {
      if (campaign.capReachedOn !== today) {
        campaign.capReachedOn = today;
        await writeDb(db);
      }
      return { campaign, remaining: pending.length, waiting: true };
    }
    if (Date.now() - started > budgetMs) return { campaign, remaining: pending.length };

    const batch = pending.slice(0, Math.min(BATCH_SIZE, allowance));
    const brand = db.settings.general;
    const emails = batch.map(c => {
      const links = unsubscribeLinks(c.id);
      return {
        to: c.email,
        ...renderEmail(campaign, c, brand, links.page),
        unsubscribeUrl: links.oneClick,
        replyTo: brand.contactEmail || undefined,
      };
    });

    try {
      await sendBatch(emails, `${campaign.id}-${batch[0].id}-${batch.length}`);
    } catch (e) {
      if (e instanceof ResendError && e.status === 429 && rateLimitRetries < 3) {
        rateLimitRetries += 1;
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      campaign.status = "paused";
      campaign.lastError = e instanceof Error ? e.message : String(e);
      await writeDb(db);
      return { campaign, remaining: pending.length, failed: true };
    }

    rateLimitRetries = 0;
    campaign.sent += batch.length;
    campaign.cursor = batch[batch.length - 1].id;
    campaign.sentToday = { date: today, count: sentToday + batch.length };
    campaign.capReachedOn = undefined;
    await writeDb(db);
    await new Promise(r => setTimeout(r, BATCH_GAP_MS));
  }
}
