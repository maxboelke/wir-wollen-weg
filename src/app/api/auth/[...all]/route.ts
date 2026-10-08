import { auth } from "@/server/auth";

// Better Auth handler (tech-stack.md §7: src/app/api/auth/[...all]).
export function GET(request: Request) {
  return auth().handler(request);
}

export function POST(request: Request) {
  return auth().handler(request);
}
