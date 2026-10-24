import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/illustrations/illustration";
import { SealMotion } from "@/components/seal-motion";
import { travelDataOn } from "@/lib/app-env";
import { TripShell } from "@/features/trips/components/trip-shell";
import type { TripView } from "@/features/trips/load";
import { travelDataPath, tripPath } from "@/features/trips/paths";
import { formatDate } from "@/lib/dates";
import { PRIVACY_PATHS } from "@/lib/legal";
import { copyFieldsOf, toInput, travelDeleteOn } from "@/lib/travel-data";
import { isDemo } from "@/server/env";
import { loadTravelRaw, readOwnRelease } from "@/server/travel-data/db";
import { travelPageModel } from "../load";
import { AnswerForm } from "./answer-form";
import { RequestForm } from "./request-form";
import { RequestButton } from "./request-button";
import { TravelArea, type TravelFlash } from "./travel-area";

/**
 * Gate of every route of the area (W20 H.1): switched off (TRAVEL_DATA_ENABLED, R.9 I11-12) →
 * the same 404 as an unknown trip; phase 1/2 (also after «Festlegung aufheben») → back to the
 * trip without a message. Members only (`loadTripView` already gave the shared 404).
 */
export function guardTravelArea(view: TripView): void {
  if (!travelDataOn()) notFound();
  const { trip } = view;
  if (trip.phase !== "fixed" || !trip.fixedStart || !trip.fixedEnd) {
    redirect(tripPath(trip.publicId));
  }
}

export type SearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/** `/travel-data?done=sent&n=3&r=…` → snackbar + focus after the navigation (no values). */
export function flashOf(params: SearchParams, names: (requestId: string) => string | null) {
  const done = one(params.done);
  const requestId = one(params.r);
  if (!done || !requestId || !/^[0-9a-f-]{36}$/i.test(requestId)) return null;
  if (done === "sent") {
    const count = Number(one(params.n) ?? "0");
    return Number.isInteger(count) && count > 0
      ? ({ kind: "sent", count, requestId } satisfies TravelFlash)
      : null;
  }
  if (done === "released") {
    const name = names(requestId);
    return name ? ({ kind: "released", requestId, name } satisfies TravelFlash) : null;
  }
  return null;
}

/** `/trips/{id}/travel-data` (W20 H.3). */
export async function TravelAreaPage({ view, params }: { view: TripView; params: SearchParams }) {
  guardTravelArea(view);
  const { trip } = view;
  const raw = await loadTravelRaw(trip.id, view.me.userId);
  const [t, model] = await Promise.all([
    getTranslations("travelData"),
    travelPageModel(view, { demo: isDemo(), raw }),
  ]);
  const flash = flashOf(params, (requestId) => {
    const card = model.toMe.find((c) => c.requestId === requestId);
    return card ? card.byName : null;
  });
  return (
    <TripShell
      view={view}
      tab={null}
      subtitle={t("title")}
      action={
        model.canRequest ? (
          <RequestButton
            href={travelDataPath(trip.publicId, "new")}
            limitReached={model.limitReached}
          />
        ) : null
      }
    >
      <h1 className="visually-hidden" id="travel-title" tabIndex={-1}>
        {`${t("title")} · ${trip.name}`}
      </h1>
      <TravelArea
        model={model}
        flash={flash}
        email={view.session.user.email}
        art={{
          seal40: <Illustration name="seal" width={40} />,
          seal20: <Illustration name="seal" width={20} />,
          sealPop: (
            <SealMotion size="md">
              <Illustration name="seal" width={40} />
            </SealMotion>
          ),
          empty: <Illustration name="empty-travel-data" width={160} />,
          deleted: <Illustration name="travel-data-deleted" width={160} />,
        }}
      />
    </TripShell>
  );
}

/** `/trips/{id}/travel-data/new` (W20 H.4) – «Bucht» only, not after the departure day. */
export async function NewRequestPage({ view }: { view: TripView }) {
  guardTravelArea(view);
  const { trip, me, members, placeholders, format, today } = view;
  const area = travelDataPath(trip.publicId);
  if (me.bookerSince === null || !trip.fixedEnd || today > trip.fixedEnd) redirect(area);
  const t = await getTranslations("travelData");
  return (
    <TripShell view={view} tab={null} subtitle={t("title")}>
      <h1 className="visually-hidden">{`${t("request.title")} · ${trip.name}`}</h1>
      <RequestForm
        data={{
          publicId: trip.publicId,
          areaHref: area,
          demo: isDemo(),
          deleteOn: formatDate(travelDeleteOn(trip.fixedEnd), format.intl, {
            weekday: true,
            year: false,
          }),
          people: [
            ...members
              .filter((m) => m.userId !== me.userId)
              .map((m) => ({ key: m.userId, name: m.displayName, placeholder: false })),
            ...placeholders
              .filter((p) => !p.withoutApp)
              .map((p) => ({ key: p.id, name: p.displayName, placeholder: true })),
          ],
        }}
      />
    </TripShell>
  );
}

/**
 * `/trips/{id}/travel-data/{requestId}` (W20 H.5): only for a person asked in an OPEN request of
 * THIS trip whose asker still carries the marking – a foreign or unknown id gives the shared
 * 404 (no hint whether it exists). Closed requests lead back to the area.
 */
export async function AnswerPage({
  view,
  requestId,
  change,
}: {
  view: TripView;
  requestId: string;
  change: boolean;
}) {
  guardTravelArea(view);
  const { trip, me, members, format, today } = view;
  const area = travelDataPath(trip.publicId);
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) notFound();
  const raw = await loadTravelRaw(trip.id, me.userId);
  const mine = raw.recipients.find((r) => r.requestId === requestId && r.userId === me.userId);
  const request = raw.requests.find((r) => r.id === requestId);
  if (!mine || !request) notFound();
  const requester = members.find((m) => m.userId === request.requesterId);
  if (
    request.closedAt ||
    mine.state === "expired" ||
    !requester?.bookerSince ||
    !trip.fixedEnd ||
    today > travelDeleteOn(trip.fixedEnd)
  ) {
    redirect(area);
  }
  const fixedEnd = trip.fixedEnd;
  const own =
    mine.state === "released" ? await readOwnRelease(trip.id, me.userId, requestId) : null;
  // «Angaben aus deiner Freigabe an … übernehmen» – only other releases in THIS trip (Q30).
  const reuse = raw.recipients
    .filter((r) => r.userId === me.userId && r.requestId !== requestId && r.state === "released")
    .flatMap((r) => {
      const other = raw.requests.find((q) => q.id === r.requestId);
      if (!other || other.closedAt) return [];
      const overlap = copyFieldsOf(other.fields).some((f) =>
        copyFieldsOf(request.fields).includes(f),
      );
      const name = members.find((m) => m.userId === other.requesterId)?.displayName;
      return overlap && name ? [{ requestId: other.id, name }] : [];
    });
  const t = await getTranslations("travelData");
  return (
    <TripShell view={view} tab={null} subtitle={t("title")}>
      <h1 className="visually-hidden">
        {t("member.asks", { name: requester.displayName, purpose: request.purpose })}
      </h1>
      <AnswerForm
        data={{
          publicId: trip.publicId,
          areaHref: area,
          requestId,
          tripName: trip.name,
          byName: requester.displayName,
          purpose: request.purpose,
          fields: request.fields,
          demo: isDemo(),
          deleteOn: formatDate(travelDeleteOn(fixedEnd), format.intl, {
            weekday: true,
            year: false,
          }),
          fixedEnd,
          today,
          intl: format.intl,
          monthFirst: format.intl === "en-US",
          change: change && own !== null,
          initial: change && own ? toInput(own) : {},
          reuse: change ? [] : reuse,
          privacyHref: PRIVACY_PATHS[format.locale],
        }}
      />
    </TripShell>
  );
}
