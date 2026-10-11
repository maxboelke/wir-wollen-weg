import "server-only";
import { and, eq, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import { isLocale, type Locale } from "@/i18n/config";
import {
  ACCOUNT_NOTICE_DAYS,
  ACCOUNT_INACTIVE_MONTHS,
  accountDeletionDate,
  addMonths,
  effectiveDeletionDate,
  retentionAction,
  TRIP_NOTICE_DAYS,
  tripDeletionDate,
} from "@/lib/retention";
import { deleteAccount } from "./account-deletion";
import { db } from "./db/client";
import { trip, tripMember, user } from "./db/schema";
import { serverEnv } from "./env";
import {
  renderAccountDeletedEmail,
  renderAccountInactiveNoticeEmail,
  renderTripDeletionNoticeEmail,
} from "./mail/templates";
import { sendLocalizedMail } from "./mail/transport";
import { tripLastActivity } from "./trips";

/**
 * Daily retention job (F-013, F-043, compliance-checklist §6). Triggered by POST
 * /api/internal/retention (token, see route) – Operations schedules it once a day.
 *
 * Idempotent and safe to run twice: a notice is claimed with a conditional UPDATE before the
 * mail goes out (released again if sending fails, so the next run retries), deletions only
 * happen when the notice is old enough. Logs only counts – never names, addresses or ids.
 */

export interface RetentionReport {
  tripNotices: number;
  tripsDeleted: number;
  accountNotices: number;
  accountsDeleted: number;
  noticesReset: number;
  mailErrors: number;
}

const appUrl = () => serverEnv().APP_URL.replace(/\/$/, "");
const localeOf = (value: string | null | undefined): Locale => (isLocale(value) ? value : "en");

async function tripPass(now: Date, report: RetentionReport): Promise<void> {
  const rows = await db()
    .select({
      id: trip.id,
      publicId: trip.publicId,
      name: trip.name,
      phase: trip.phase,
      fixedEnd: trip.fixedEnd,
      noticeSentAt: trip.deletionNoticeSentAt,
      lastActivity: tripLastActivity,
      orgaEmail: user.email,
      orgaLocale: user.locale,
    })
    .from(trip)
    .leftJoin(tripMember, and(eq(tripMember.tripId, trip.id), eq(tripMember.role, "organizer")))
    .leftJoin(user, eq(user.id, tripMember.userId));
  for (const row of rows) {
    const due = tripDeletionDate({
      phase: row.phase,
      fixedEnd: row.fixedEnd,
      lastActivity: row.lastActivity,
    });
    const action = retentionAction(due.at, row.noticeSentAt, now, TRIP_NOTICE_DAYS);
    if (action === "resetNotice") {
      await db().update(trip).set({ deletionNoticeSentAt: null }).where(eq(trip.id, row.id));
      report.noticesReset++;
    } else if (action === "delete") {
      const deleted = await db()
        .delete(trip)
        .where(
          and(
            eq(trip.id, row.id),
            isNotNull(trip.deletionNoticeSentAt),
            // Nothing happened in the trip since the read above (edits, days, votes, joins).
            sql`${tripLastActivity} < ${new Date(row.lastActivity.getTime() + 1).toISOString()}::timestamptz`,
          ),
        )
        .returning({ id: trip.id });
      report.tripsDeleted += deleted.length;
    } else if (action === "notice") {
      const claimed = await db()
        .update(trip)
        .set({ deletionNoticeSentAt: now })
        .where(and(eq(trip.id, row.id), isNull(trip.deletionNoticeSentAt)))
        .returning({ id: trip.id });
      if (claimed.length === 0) continue;
      report.tripNotices++;
      if (!row.orgaEmail) continue;
      const locale = localeOf(row.orgaLocale);
      try {
        await sendLocalizedMail(
          row.orgaEmail,
          locale,
          renderTripDeletionNoticeEmail({
            locale,
            tripName: row.name,
            date: effectiveDeletionDate(due.at, now, TRIP_NOTICE_DAYS),
            reason: due.reason,
            tripUrl: `${appUrl()}/trips/${row.publicId}`,
          }),
        );
      } catch {
        report.mailErrors++;
        // Not sent → not claimed: the next run tries again (and the deletion waits for it).
        await db().update(trip).set({ deletionNoticeSentAt: null }).where(eq(trip.id, row.id));
      }
    }
  }
}

async function accountPass(now: Date, report: RetentionReport): Promise<void> {
  // Only accounts near the limit or with a pending notice.
  const noticeFrom = new Date(
    addMonths(now, -ACCOUNT_INACTIVE_MONTHS).getTime() + ACCOUNT_NOTICE_DAYS * 86_400_000,
  );
  const rows = await db()
    .select({
      id: user.id,
      email: user.email,
      locale: user.locale,
      lastActiveAt: user.lastActiveAt,
      noticeSentAt: user.inactivityNoticeSentAt,
    })
    .from(user)
    .where(or(lt(user.lastActiveAt, noticeFrom), isNotNull(user.inactivityNoticeSentAt)));
  for (const row of rows) {
    const dueAt = accountDeletionDate(row.lastActiveAt);
    const action = retentionAction(dueAt, row.noticeSentAt, now, ACCOUNT_NOTICE_DAYS);
    const locale = localeOf(row.locale);
    if (action === "resetNotice") {
      await db().update(user).set({ inactivityNoticeSentAt: null }).where(eq(user.id, row.id));
      report.noticesReset++;
    } else if (action === "notice") {
      const claimed = await db()
        .update(user)
        .set({ inactivityNoticeSentAt: now })
        .where(and(eq(user.id, row.id), isNull(user.inactivityNoticeSentAt)))
        .returning({ id: user.id });
      if (claimed.length === 0) continue;
      report.accountNotices++;
      try {
        await sendLocalizedMail(
          row.email,
          locale,
          renderAccountInactiveNoticeEmail({
            locale,
            date: effectiveDeletionDate(dueAt, now, ACCOUNT_NOTICE_DAYS),
            loginUrl: `${appUrl()}/login`,
          }),
        );
      } catch {
        report.mailErrors++;
        await db().update(user).set({ inactivityNoticeSentAt: null }).where(eq(user.id, row.id));
      }
    } else if (action === "delete") {
      // The organiser role goes to the longest member (F-043); solo trips go with the account.
      // Re-checked under the row lock: a sign-in since the read above keeps the account.
      const result = await deleteAccount(row.id, "auto", {
        inactiveSince: new Date(row.lastActiveAt.getTime() + 1),
      });
      if (!result.ok) continue;
      report.accountsDeleted++;
      await sendLocalizedMail(
        result.email,
        locale,
        renderAccountDeletedEmail({ locale, deletedTrips: result.deletedTrips, inactive: true }),
      ).catch(() => {
        report.mailErrors++;
      });
    }
  }
}

export async function runRetention(now = new Date()): Promise<RetentionReport> {
  const report: RetentionReport = {
    tripNotices: 0,
    tripsDeleted: 0,
    accountNotices: 0,
    accountsDeleted: 0,
    noticesReset: 0,
    mailErrors: 0,
  };
  await tripPass(now, report);
  await accountPass(now, report);
  console.info("retention: run finished", JSON.stringify(report));
  return report;
}
