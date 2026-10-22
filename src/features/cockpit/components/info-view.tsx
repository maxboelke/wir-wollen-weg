import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button-link";
import { Tile } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { formatDate } from "@/lib/dates";
import { formatTime, linkParts, mapsHref, telHref } from "@/lib/trip-info";
import type { TripInfoView } from "@/server/cockpit";
import type { TripView } from "../../trips/load";
import { orgaName } from "../../trips/remind";
import styles from "./info.module.css";

/** Free text with line breaks; only https links become links (new tab, W22 B). */
async function RichText({ value }: { value: string }) {
  const t = await getTranslations("tripInfo");
  return (
    <p className={styles.text}>
      {linkParts(value).map((part, index) =>
        part.kind === "text" ? (
          <span key={index}>{part.text}</span>
        ) : (
          <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">
            {part.text}
            <span className="visually-hidden">{` ${t("newTab")}`}</span>
          </a>
        ),
      )}
    </p>
  );
}

/**
 * W22 A/C «Infos zur Reise» (F-033, I8-09): cards «Unterkunft», «Treffpunkt & Anreise»,
 * «Gut zu wissen» (h2 each, label/value as `<dl>`), empty fields are not shown, maps link
 * without any embedded map, `tel:` link, «Zuletzt geändert von …».
 */
export async function InfoView({
  view,
  info,
  canEdit,
  editHref,
}: {
  view: TripView;
  info: TripInfoView | null;
  canEdit: boolean;
  editHref: string;
}) {
  const t = await getTranslations("tripInfo");
  const { trip, format } = view;
  const day = (date: string | null) =>
    date ? formatDate(date, format.intl, { weekday: true, year: false }) : "";
  const time = (value: string) => formatTime(value, format.intl);
  const stay =
    info &&
    (info.stayName ||
      info.address ||
      info.checkIn ||
      info.checkOut ||
      info.emergencyName ||
      info.emergencyPhone);
  const empty = !info || (!stay && !info.meetingPoint && !info.notes);

  if (empty) {
    return (
      <section className={styles.empty}>
        <Tile icon="info" tone="lavender" />
        <p>{canEdit ? t("emptyOrga") : t("emptyMember", { orga: orgaName(view) })}</p>
        {canEdit ? (
          <ButtonLink href={editHref} size="lg" block>
            {t("emptyAction")}
          </ButtonLink>
        ) : null}
      </section>
    );
  }

  const tel = telHref(info.emergencyPhone);
  return (
    <div className={styles.cards}>
      {stay ? (
        <section className={styles.card} aria-labelledby="info-stay">
          <h2 id="info-stay" className={styles.cardTitle}>
            {t("stayTitle")}
          </h2>
          {info.stayName ? <p className={styles.stayName}>{info.stayName}</p> : null}
          <dl className={styles.list}>
            {info.address ? (
              <div className={styles.entry}>
                <dt>
                  <Icon name="nights" size={18} />
                  {t("address")}
                </dt>
                <dd>
                  <span className={styles.text}>{info.address}</span>
                  <a
                    className={styles.mapLink}
                    href={mapsHref(info.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="link" size={18} />
                    {t("maps")}
                    <span aria-hidden="true">{" ↗"}</span>
                    <span className="visually-hidden">{` ${t("newTab")}`}</span>
                  </a>
                </dd>
              </div>
            ) : info.stayName ? (
              <div className={styles.entry}>
                <dt>
                  <Icon name="nights" size={18} />
                  {t("address")}
                </dt>
                <dd className={styles.muted}>{t("addressMissing")}</dd>
              </div>
            ) : null}
            {info.checkIn ? (
              <div className={styles.entry}>
                <dt>
                  <Icon name="clock" size={18} />
                  {t("checkIn")}
                </dt>
                <dd>
                  {t("checkInValue", { date: day(trip.fixedStart), time: time(info.checkIn) })}
                </dd>
              </div>
            ) : null}
            {info.checkOut ? (
              <div className={styles.entry}>
                <dt>
                  <Icon name="clock" size={18} />
                  {t("checkOut")}
                </dt>
                <dd>
                  {t("checkOutValue", { date: day(trip.fixedEnd), time: time(info.checkOut) })}
                </dd>
              </div>
            ) : null}
            {info.emergencyName || info.emergencyPhone ? (
              <div className={styles.entry}>
                <dt>
                  <Icon name="user" size={18} />
                  {t("emergency")}
                </dt>
                <dd>
                  <span>
                    {info.emergencyName ? <span>{info.emergencyName}</span> : null}
                    {info.emergencyName && info.emergencyPhone ? <span>{" · "}</span> : null}
                    {info.emergencyPhone ? (
                      tel ? (
                        <a href={tel}>{info.emergencyPhone}</a>
                      ) : (
                        <span>{info.emergencyPhone}</span>
                      )
                    ) : null}
                  </span>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}
      {info.meetingPoint ? (
        <section className={styles.card} aria-labelledby="info-meeting">
          <h2 id="info-meeting" className={styles.cardTitle}>
            {t("meetingTitle")}
          </h2>
          <RichText value={info.meetingPoint} />
        </section>
      ) : null}
      {info.notes ? (
        <section className={styles.card} aria-labelledby="info-notes">
          <h2 id="info-notes" className={styles.cardTitle}>
            {t("notesTitle")}
          </h2>
          <RichText value={info.notes} />
        </section>
      ) : null}
      <p className={styles.changed}>
        {info.editorName
          ? t("updatedBy", {
              name: info.editorName,
              date: formatDate(info.updatedAt.toISOString().slice(0, 10), format.intl, {
                weekday: false,
                year: false,
              }),
            })
          : t("updatedAt", {
              date: formatDate(info.updatedAt.toISOString().slice(0, 10), format.intl, {
                weekday: false,
                year: false,
              }),
            })}
      </p>
    </div>
  );
}
