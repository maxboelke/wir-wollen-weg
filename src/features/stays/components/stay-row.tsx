"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { cx } from "@/lib/cx";
import { animate, DURATION, SCALE, spring } from "@/lib/motion";
import type { StayRatingValue } from "@/lib/stays";
import type { RankedItem, StayItem } from "../load";
import { StayImage } from "./stay-image";
import styles from "./stays.module.css";

export interface RowProps {
  item: StayItem;
  ranked?: RankedItem | undefined;
  /** Ratings possible (nothing picked yet). */
  canRate: boolean;
  /** Organiser: [Das wird's] in the ranking. */
  canFix: boolean;
  editHref: string;
  offline: boolean;
  /** Listed names in the viewer's language («Lena, Kemal und dir»). */
  likedByText?: string | undefined;
  onRate: (item: StayItem, value: StayRatingValue) => void;
  onDelete: (item: StayItem, trigger: HTMLElement) => void;
  onFix: (item: StayItem, trigger: HTMLElement) => void;
}

/**
 * One suggestion in «Alle Vorschläge» or the ranking (W18 E.3, design-system §9.21): thumbnail
 * (proxy or placeholder; rank circle on the image corner in the ranking), h3 title, «{Site} ·
 * von {Name}», price line, «Neu» chip, note, rating pair as `aria-pressed` buttons in a group
 * «Deine Bewertung für {Titel}», «Ansehen ↗» and `⋯` (edit / delete). The row itself is no link.
 */
export function StayRow({
  item,
  ranked,
  canRate,
  canFix,
  editHref,
  offline,
  likedByText,
  onRate,
  onDelete,
  onFix,
}: RowProps) {
  const t = useTranslations("stays");
  const id = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const likeRef = useRef<HTMLButtonElement>(null);
  const nopeRef = useRef<HTMLButtonElement>(null);
  const author = item.author ?? t("row.formerMember");
  const ratingWord = (value: StayRatingValue | null) =>
    value === "like" ? "♥" : value === "nope" ? "✕" : t("row.ratingNone");

  const rate = (value: StayRatingValue) => {
    if (offline) return;
    const pressed = item.myRating === value;
    if (!pressed) {
      // W18-10: the newly pressed icon pops (fast, spring-soft); state first.
      const icon = (value === "like" ? likeRef : nopeRef).current?.querySelector("svg");
      animate(icon, [{ transform: `scale(${String(SCALE.pop)})` }, { transform: "none" }], {
        duration: DURATION.fast,
        easing: spring("soft"),
      });
    }
    onRate(item, value);
  };

  return (
    <li className={styles.row} data-stay-row={item.id}>
      <span className={styles.rowMedia}>
        <StayImage src={item.image} className={styles.thumb} />
        {ranked ? (
          <span className={cx(styles.rank, ranked.first && styles.rankFirst)} aria-hidden="true">
            {ranked.rank}
          </span>
        ) : null}
      </span>
      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <h3 className={styles.rowTitle} id={`${id}-title`}>
            {ranked ? (
              <span className="visually-hidden">
                {`${t("ranking.rank", { n: ranked.rank })}${ranked.tied ? `, ${t("ranking.tied")}` : ""}. `}
              </span>
            ) : null}
            {item.title}
          </h3>
          {ranked?.first || ranked?.tied || item.isNew ? (
            <span className={styles.chips}>
              {ranked?.first ? (
                <span className={styles.chipSun}>
                  <Icon name="star" size={15} />
                  {t("ranking.first")}
                </span>
              ) : null}
              {ranked?.tied ? (
                <Chip tone="info" icon="users">
                  {t("ranking.tied")}
                </Chip>
              ) : null}
              {item.isNew && canRate ? <Chip tone="info">{t("row.new")}</Chip> : null}
            </span>
          ) : null}
        </div>
        <p className={styles.meta}>{`${item.site} · ${t("row.by", { name: author })}`}</p>
        <p className={styles.price}>
          {item.price
            ? `${item.price} · ${t("row.perPerson", { amount: item.perPerson ?? "" })}`
            : t("row.noPrice")}
        </p>
        {ranked ? (
          <>
            <p className={styles.counts}>
              <span aria-hidden="true">
                <span className={styles.likes}>{`♥ ${String(ranked.likes)}`}</span>
                {" · "}
                <span className={styles.nopes}>{`✕ ${String(ranked.nopes)}`}</span>
              </span>
              <span className="visually-hidden">
                {t("ranking.counts", { likes: ranked.likes, nopes: ranked.nopes })}
              </span>
            </p>
            {likedByText ? (
              <p className={styles.meta}>
                <span aria-hidden="true">{t("ranking.likedBy", { names: likedByText })}</span>
                <span className="visually-hidden">
                  {t("ranking.likedBySr", { names: likedByText })}
                </span>
              </p>
            ) : null}
          </>
        ) : null}
        {item.note ? <p className={styles.note}>{item.note}</p> : null}
        <div className={styles.rowActions}>
          {canRate ? (
            <span
              className={styles.pair}
              role="group"
              aria-label={t("rate.group", { title: item.title })}
            >
              {item.myRating === null ? (
                <span className={styles.openWord}>{t("row.open")}</span>
              ) : null}
              <button
                ref={nopeRef}
                type="button"
                className={cx(styles.toggle, styles.nope)}
                aria-pressed={item.myRating === "nope"}
                aria-label={t("rate.nope")}
                aria-disabled={offline || undefined}
                onClick={() => {
                  rate("nope");
                }}
              >
                <Icon name="cross" size={20} />
              </button>
              <button
                ref={likeRef}
                type="button"
                className={cx(styles.toggle, styles.like)}
                aria-pressed={item.myRating === "like"}
                aria-label={t("rate.like")}
                aria-disabled={offline || undefined}
                onClick={() => {
                  rate("like");
                }}
              >
                <Icon name={item.myRating === "like" ? "heart-filled" : "heart"} size={20} />
              </button>
            </span>
          ) : (
            <p className={styles.myRating}>
              {t("row.myRating", { rating: ratingWord(item.myRating) })}
            </p>
          )}
          {canFix ? (
            <Button
              variant="secondary"
              size="sm"
              aria-haspopup="dialog"
              aria-label={t("fixName", { title: item.title })}
              aria-disabled={offline || undefined}
              onClick={(event) => {
                onFix(item, event.currentTarget);
              }}
            >
              {t("fix")}
            </Button>
          ) : null}
          {item.href ? (
            <a
              className={styles.extLink}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("view")}
              <Icon name="external" size={16} />
              <span className="visually-hidden">{` ${t("newTab")}`}</span>
            </a>
          ) : null}
          {item.canEdit || item.canDelete ? (
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls={`${id}-menu`}
              aria-label={t("row.menu", { title: item.title })}
              onClick={() => {
                setMenuOpen(!menuOpen);
              }}
            >
              <Icon name="more" size={20} />
            </button>
          ) : null}
        </div>
        {menuOpen ? (
          <div className={styles.menu} id={`${id}-menu`}>
            {item.canEdit ? <Link href={editHref}>{t("row.edit")}</Link> : null}
            {item.canDelete ? (
              <button
                type="button"
                className={styles.textButton}
                aria-haspopup="dialog"
                onClick={(event) => {
                  onDelete(item, event.currentTarget);
                }}
              >
                {t("row.delete")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}
