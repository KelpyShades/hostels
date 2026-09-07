import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { env } from "./_generated/server";

const r2 = new R2(components.r2);

export const generateAdminUploadUrl = mutation({
  args: { operatorKey: v.string(), key: v.optional(v.string()) },
  returns: v.object({ key: v.string(), url: v.string() }),
  handler: async (_ctx, args) => {
    if (!env.OPERATOR_KEY || args.operatorKey !== env.OPERATOR_KEY) {
      throw new Error("Invalid operator key");
    }
    return await r2.generateUploadUrl(args.key);
  },
});

export const syncAdminMetadata = action({
  args: { operatorKey: v.string(), key: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!env.OPERATOR_KEY || args.operatorKey !== env.OPERATOR_KEY) {
      throw new Error("Invalid operator key");
    }
    await r2.syncMetadata(ctx, args.key);
    return null;
  },
});

export const getAdminFileUrl = action({
  args: { operatorKey: v.string(), key: v.string() },
  returns: v.string(),
  handler: async (_ctx, args) => {
    if (!env.OPERATOR_KEY || args.operatorKey !== env.OPERATOR_KEY) {
      throw new Error("Invalid operator key");
    }
    return await r2.getUrl(args.key, { expiresIn: 60 * 60 });
  },
});
