"use server";

import { redirect } from "next/navigation";
import { demoResetAvailable, resolveAppUrl } from "@/lib/app-env";
import { DEMO_INBOX_PATH } from "@/lib/demo-inbox";
import { dbPool } from "@/server/db/client";
import { seedDemo } from "@/server/demo/seed";

export interface ResetDemoState {
  error?: "confirmRequired" | "generic" | undefined;
}

/**
 * Re-creates the demo people and their trips (src/server/demo/seed.ts) – the same data the
 * first deployment seeded, dates relative to today. Only reachable behind the preview password;
 * needs the explicit confirmation checkbox.
 */
export async function resetDemoData(
  _previous: ResetDemoState,
  formData: FormData,
): Promise<ResetDemoState> {
  if (!demoResetAvailable()) return { error: "generic" };
  if (formData.get("confirm") !== "on") return { error: "confirmRequired" };
  try {
    const client = await dbPool().connect();
    try {
      await seedDemo(client, resolveAppUrl());
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("demo reset failed", error instanceof Error ? error.message : "unknown");
    return { error: "generic" };
  }
  console.info("demo reset: demo data re-created");
  redirect(`${DEMO_INBOX_PATH}?reset=done`);
}
