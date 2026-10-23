import type { TicketView } from "../types";
import { TicketRing } from "./ticket-ring";
import { CalendarButton, CostHeadButtons, CrewButton } from "./ticket-stub";
import styles from "./ticket.module.css";

/**
 * Ticket head of the phase-3 cockpit (W16 v2.2, D-36): Vorfreude ring with the countdown
 * (decorative – the countdown stands as text in the phase line), range, tear-off edge, crew
 * button and ONE button group per sub-phase (Increment 8: «Kalender» before the trip only).
 */
export function Ticket({ publicId, ticket }: { publicId: string; ticket: TicketView }) {
  const { ring } = ticket;
  return (
    <div className={styles.ticket} data-ticket="">
      <div className={styles.inner}>
        <div className={styles.ringBox}>
          <TicketRing
            publicId={publicId}
            percent={ticket.percent}
            name={ticket.ringName}
            celebrate={ticket.celebrate}
            departureDue={ticket.departureDue}
          >
            {ring.kind === "count" ? (
              <>
                <span className={styles.ringNumber}>{ring.count}</span>
                <span>{ring.unit}</span>
              </>
            ) : ring.kind === "day" ? (
              <>
                <span>{ring.top}</span>
                <span className={styles.ringNumber}>{ring.day}</span>
                <span>{ring.of}</span>
              </>
            ) : (
              <span className={styles.ringBye}>{ring.text}</span>
            )}
          </TicketRing>
        </div>
        <div className={styles.info}>
          <p className={styles.range}>{ticket.range}</p>
          <div className={styles.perf} aria-hidden="true">
            <span className={`${styles.notch} ${styles.notchStart}`} />
            <span className={`${styles.notch} ${styles.notchEnd}`} />
          </div>
          <div className={styles.stub}>
            <CrewButton crew={ticket.crew} />
            {ticket.calendar ? (
              <CalendarButton
                icsHref={ticket.calendar.icsHref}
                googleHref={ticket.calendar.googleHref}
              />
            ) : null}
            <CostHeadButtons addExpense={ticket.addExpense} settle={ticket.settle} />
          </div>
        </div>
      </div>
    </div>
  );
}
