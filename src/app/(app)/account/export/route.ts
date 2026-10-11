import { exportFileName, exportUserData } from "@/server/data-export";
import { getSession } from "@/server/session";

export const dynamic = "force-dynamic";

/**
 * «Meine Daten herunterladen» (F-013/F-043, Art. 15/20 DSGVO): JSON file with the signed-in
 * person's own data only. Signed out → login with return path; never cached.
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session) {
    return new Response(null, {
      status: 303,
      headers: { location: "/login?next=%2Faccount", "cache-control": "no-store" },
    });
  }
  const data = await exportUserData(session.user.id);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFileName(session.user.locale ?? "en")}"`,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
