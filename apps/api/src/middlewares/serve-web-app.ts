import type { MiddlewareHandler } from "hono";
import { serveStatic } from "hono/bun";

const STATIC_FILE_REGEX =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)$/;

export const serveWebApp: MiddlewareHandler = (c, next) => {
  if (c.req.path.startsWith("/api")) {
    return next();
  }

  if (c.req.path.match(STATIC_FILE_REGEX)) {
    return serveStatic({ root: "./public" })(c, next);
  }

  return serveStatic({ path: "/index.html", root: "./public" })(c, next);
};
