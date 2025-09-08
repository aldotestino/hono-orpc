import { ORPCError, os } from "@orpc/server";
import { auth } from "../lib/auth";

export const authMiddleware = os
  .$context<{ headers: Headers }>()
  .middleware(async ({ context, next }) => {
    const session = await auth.api.getSession({ headers: context.headers });

    if (!session) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: {
        ...context,
        user: session.user,
      },
    });
  });
