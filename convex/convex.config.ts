import { defineApp } from "convex/server";
import { v } from "convex/values";
import r2 from "@convex-dev/r2/convex.config.js";

const app = defineApp({
  env: {
    OPERATOR_KEY: v.optional(v.string()),
  },
});

app.use(r2);

export default app;
