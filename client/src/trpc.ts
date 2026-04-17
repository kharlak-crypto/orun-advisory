import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
// Import only the TYPE from routers.ts — never from index.ts (that would pull
// Express / MySQL / Anthropic SDK into the browser bundle via Vite)
import type { AppRouter } from "../../server/src/routers";

export const trpc = createTRPCReact<AppRouter>();

export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/trpc",
        credentials: "include",
      }),
    ],
  });
}
