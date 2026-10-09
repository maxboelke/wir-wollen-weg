/* eslint-disable react/jsx-no-literals -- internal component showcase (never in production) */
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/brand/logo";
import illustrations from "@/components/illustrations/illustrations.json";
import { Illustration, type IllustrationName } from "@/components/illustrations/illustration";
import { BrandLink, PageShell } from "@/components/page-shell";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, Tile } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { CockpitHeader, CockpitIconButton, KpiBox } from "@/components/ui/cockpit";
import { Checkbox, TextField } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { ICON_NAMES } from "@/components/ui/icon-names";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { LanguageSwitch } from "@/features/locale/language-switch";
import {
  CodeFieldDemo,
  CodeFieldState,
  MotionSwitchDemo,
  RadioDemo,
  SheetDemo,
  ToastDemo,
} from "./showcase-client";
import styles from "./showcase.module.css";

export const metadata: Metadata = { title: "UI-Fundament" };

const MEMBERS = ["Lena", "Jonas", "Tim", "Mia", "Paul", "Sara", "Kemal", "Ana"].map((name, i) => ({
  id: `demo-${i}`,
  name,
}));

/**
 * Internal component showcase (/dev/ui) for review and screenshots: every base component
 * and state, in light AND dark. Never reachable with APP_ENV=production.
 */
export default async function UiShowcasePage() {
  await connection();
  if (process.env.APP_ENV === "production") notFound();
  const t = await getTranslations();

  return (
    <PageShell className={styles.wide}>
      <div className={styles.page}>
        <div className={styles.intro}>
          <h1>UI-Fundament</h1>
          <p className={styles.muted}>
            Design-System v1.0 · Richtung B „Reise-Cockpit“ · intern, nur außerhalb von Produktion.
            Bewegung: Schalter unten bzw. Systemeinstellung.
          </p>
        </div>
        {(["light", "dark"] as const).map((theme) => (
          <section
            key={theme}
            data-theme={theme}
            className={styles.theme}
            aria-labelledby={`theme-${theme}`}
          >
            <h2 id={`theme-${theme}`} className={styles.themeTitle}>
              {theme === "light" ? "Hell" : "Dunkel „Mitternacht“"}
            </h2>

            <Block title="Marke">
              <div className={styles.row}>
                <Wordmark lead={t("app.nameLead")} accent={t("app.nameAccent")} />
                <Wordmark lead="When do we" accent="go?" />
              </div>
              <div className={styles.brandStrip}>
                <BrandLink href="/" tone="onBrand" />
              </div>
            </Block>

            <Block title="Typografie">
              <p className={styles.display}>Es geht los!</p>
              <p className={styles.h1}>H1 Seitentitel</p>
              <p className={styles.h2}>H2 Abschnitt</p>
              <p>Fließtext Figtree 16/1,45 – Alle tragen ein, wann sie können.</p>
              <p className={styles.muted}>Sekundärtext 14 · Meta 13</p>
              <p className={styles.tnum} data-testid="tnum-probe">
                <span data-digits="1111">1111</span> / <span data-digits="0000">0000</span>
              </p>
            </Block>

            <Block title="Tasten">
              <div className={styles.row}>
                <Button>Reise planen</Button>
                <Button variant="secondary">Teilen</Button>
                <Button variant="text">Im Kalender zeigen</Button>
              </div>
              <div className={styles.row}>
                <Button icon="share">Mit Icon</Button>
                <Button loading loadingLabel="Wird gespeichert …">
                  Speichern
                </Button>
                <Button aria-disabled>Deaktiviert</Button>
              </div>
              <div className={styles.row}>
                <Button size="md" variant="secondary" icon="copy">
                  Link kopieren
                </Button>
                <Button size="sm">Klein 44</Button>
                <Button variant="tool" size="sm" icon="undo" aria-label="Rückgängig">
                  {""}
                </Button>
                <Button variant="danger" size="md">
                  Löschen
                </Button>
                <Button variant="dangerQuiet" size="md">
                  Reise verlassen …
                </Button>
              </div>
              <ButtonLink href="/" variant="primary" block iconEnd="arrow-right">
                Als Link (volle Breite)
              </ButtonLink>
            </Block>

            <Block title="Eingabe & Fehler">
              <TextField
                id={`${theme}-email`}
                label={t("auth.emailLabel")}
                type="email"
                defaultValue="kemal@beispiel.de"
                hint="Wir schicken dir einen Code."
              />
              <TextField
                id={`${theme}-email-error`}
                label={t("auth.emailLabel")}
                type="email"
                defaultValue="kemal@"
                error={t("auth.errors.invalidEmail")}
              />
              <TextField
                id={`${theme}-name-ok`}
                label={t("auth.nameLabel")}
                defaultValue="Kemal"
                success
              />
              <TextField
                id={`${theme}-ro`}
                label="Schreibgeschützt"
                defaultValue="Lissabon 2027"
                readOnly
              />
              <Checkbox
                defaultChecked
                label={t("auth.rememberMe")}
                hint={t("auth.rememberMeHint")}
              />
            </Block>

            <Block title="Code-Feld (interaktiv)">
              <CodeFieldDemo />
            </Block>

            <Block title="Code-Feld – Zustände">
              <div className={styles.grid}>
                <CodeFieldState status="idle" value="" />
                <CodeFieldState status="idle" value="481" />
                <CodeFieldState status="error" value="481902" />
                <CodeFieldState status="checking" value="481902" />
                <CodeFieldState status="success" value="481902" />
                <CodeFieldState status="locked" value="481902" />
              </div>
            </Block>

            <Block title="Cockpit-Kopf (voll) mit Kennzahl-Box">
              <CockpitHeader
                title="Lissabon 2027"
                back={{ href: "/trips", label: t("trips.title") }}
                phase={{ phase: "collect", label: "Tage sammeln · 5/7 fertig" }}
                menu={
                  <CockpitIconButton label="Reisemenü">
                    <Icon name="more" size={20} />
                  </CockpitIconButton>
                }
                tabsLabel="Reise"
                tabs={[
                  { href: "/dev/ui#o", label: "Übersicht" },
                  { href: "/dev/ui#m", label: "Meine Tage" },
                  { href: "/dev/ui#g", label: "Gruppe", current: true },
                  { href: "/dev/ui#a", label: "Abstimmen" },
                ]}
              >
                <KpiBox
                  value={5}
                  max={7}
                  title="5 von 7 haben abgegeben"
                  text="Noch offen: Kemal, Sara – das Ergebnis kann sich noch ändern."
                  action={
                    <Button variant="accent" size="sm" icon="remind">
                      Erinnern
                    </Button>
                  }
                />
              </CockpitHeader>
            </Block>

            <Block title="Cockpit-Kopf (kompakt) – Phasen">
              <div className={styles.stack}>
                {(
                  [
                    ["collect", "Tage sammeln · 5/7 fertig"],
                    ["vote", "Abstimmung läuft · 4/7 fertig"],
                    ["fixed", "Steht fest · 7 dabei"],
                    ["past", "Vergangen"],
                  ] as const
                ).map(([phase, label]) => (
                  <CockpitHeader
                    key={phase}
                    variant="compact"
                    title="Skiwochenende Arlberg mit sehr langem Namen"
                    back={{ href: "/trips", label: t("trips.title") }}
                    phase={{ phase, label }}
                    tabsLabel="Reise"
                    tabs={[
                      { href: "/dev/ui#o", label: "Übersicht", current: phase === "fixed" },
                      { href: "/dev/ui#m", label: "Meine Tage", current: phase === "collect" },
                      { href: "/dev/ui#g", label: "Gruppe", current: phase === "past" },
                      { href: "/dev/ui#a", label: "Abstimmen", current: phase === "vote" },
                    ]}
                  />
                ))}
              </div>
            </Block>

            <Block title="Karten & Kacheln">
              <div className={styles.grid}>
                <Card>
                  <div className={styles.row}>
                    <Tile icon="calendar" tone="lavender" />
                    <div>
                      <p className={styles.small}>Zeitraum</p>
                      <p className={styles.strong}>1. Mai – 30. Juni 2027</p>
                    </div>
                  </div>
                </Card>
                <Card interactive>
                  <div className={styles.row}>
                    <Tile icon="users" tone="mint" />
                    <Link className={styles.stretched} href="/dev/ui#karte">
                      Klickbare Karte
                    </Link>
                  </div>
                </Card>
              </div>
              <div className={styles.row}>
                <Tile icon="calendar" tone="lavender" />
                <Tile icon="users" tone="mint" />
                <Tile icon="sun" tone="sun" />
                <Tile icon="holiday" tone="coral" />
                <Tile icon="plane" tone="brand" />
                <Tile icon="clock" tone="lavender" size="sm" />
              </div>
            </Block>

            <Block title="Kennzahlen">
              <div className={styles.row}>
                <ProgressRing value={5} max={7} tone="light">
                  <span className={styles.ringText}>5/7</span>
                </ProgressRing>
                <span className={styles.strong}>5 von 7 haben abgegeben</span>
              </div>
            </Block>

            <Block title="Chips">
              <div className={styles.row}>
                <Chip tone="yes" icon="check">
                  Geht
                </Chip>
                <Chip tone="maybe" icon="maybe">
                  2× zur Not
                </Chip>
                <Chip tone="no" icon="cross">
                  ohne Jonas
                </Chip>
                <Chip tone="holiday">inkl. Pfingstmontag</Chip>
                <Chip tone="info" icon="sparkle">
                  Vorschlag
                </Chip>
                <Chip tone="neutral" icon="crown">
                  Orga
                </Chip>
              </div>
              <div className={styles.row}>
                <Chip tone="collect" icon="calendar">
                  Tage sammeln
                </Chip>
                <Chip tone="vote" icon="vote">
                  Abstimmung läuft
                </Chip>
                <Chip tone="fixed" icon="check">
                  Steht fest
                </Chip>
                <Chip tone="past" icon="clock">
                  Vergangen
                </Chip>
              </div>
            </Block>

            <Block title="Banner">
              <Banner tone="info">Du trittst „Lissabon 2027“ bei.</Banner>
              <Banner tone="warning">Jonas kann an diesen Tagen nicht.</Banner>
              <Banner
                tone="success"
                action={
                  <Button variant="text" size="sm">
                    Ansehen
                  </Button>
                }
              >
                Der Termin steht fest!
              </Banner>
              <Banner tone="danger" role="note">
                Das hat nicht geklappt. Bitte versuch es nochmal.
              </Banner>
            </Block>

            <Block title="Avatare">
              <div className={styles.row}>
                <Avatar id="demo-0" name="Lena" size="lg" organizer />
                <Avatar id="demo-1" name="Jonas" size="md" submitted />
                <Avatar id="demo-2" name="Tim Berg" size="sm" />
                <Avatar id="demo-3" name="Mia" open />
                <AvatarStack members={MEMBERS} />
                <AvatarStack members={MEMBERS.slice(0, 4)} size="sm" anonymous plusOne />
              </div>
            </Block>

            <Block title="Schalter „Bewegung reduzieren“">
              <MotionSwitchDemo />
            </Block>

            <Block title="Radio-Gruppe (R-018)">
              <RadioDemo />
            </Block>

            <Block title="Sprachumschalter">
              <div className={styles.row}>
                <LanguageSwitch />
              </div>
              <div className={styles.brandStrip}>
                <LanguageSwitch tone="onBrand" />
              </div>
            </Block>

            <Block title="Toast & Bottom-Sheet">
              <ToastDemo />
              <SheetDemo />
            </Block>

            <Block title="Laden">
              <div className={styles.row}>
                <Spinner />
                <Skeleton width="8rem" />
                <Skeleton width="2.5rem" height="2.5rem" round />
              </div>
            </Block>

            <Block title={`Icons (${ICON_NAMES.length})`}>
              <ul className={styles.icons}>
                {ICON_NAMES.map((name) => (
                  <li key={name}>
                    <Icon name={name} size={24} />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </Block>

            <Block title="Illustrationen">
              <ul className={styles.illustrations}>
                {(Object.keys(illustrations) as IllustrationName[]).map((name) => (
                  <li key={name}>
                    <Illustration name={name} className={styles.illustration} />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </Block>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      <div className={styles.stack}>{children}</div>
    </section>
  );
}
