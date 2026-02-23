import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";
import { subscriptions, users, notifications } from "@/db/schema";

export const subscriptionsRouter = createTRPCRouter({
  // Check if subscribed to a channel
  isSubscribed: protectedProcedure
    .input(z.object({ channelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const sub = await ctx.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.subscriberId, ctx.user.id),
            eq(subscriptions.channelId, input.channelId)
          )
        )
        .limit(1);

      return !!sub[0];
    }),

  // Get subscription count for a channel
  getCount: baseProcedure
    .input(z.object({ channelId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.channelId, input.channelId));

      return result[0]?.count ?? 0;
    }),

  // Get user's subscriptions
  getMySubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const subs = await ctx.db
      .select({
        id: subscriptions.id,
        createdAt: subscriptions.createdAt,
        channel: {
          id: users.id,
          name: users.name,
          imageURL: users.imageURL,
        },
      })
      .from(subscriptions)
      .innerJoin(users, eq(subscriptions.channelId, users.id))
      .where(eq(subscriptions.subscriberId, ctx.user.id));

    return subs;
  }),

  // Toggle subscription
  toggle: protectedProcedure
    .input(z.object({ channelId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Can't subscribe to yourself
      if (ctx.user.id === input.channelId) {
        throw new Error("Cannot subscribe to yourself");
      }

      const existing = await ctx.db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.subscriberId, ctx.user.id),
            eq(subscriptions.channelId, input.channelId)
          )
        )
        .limit(1);

      if (existing[0]) {
        // Unsubscribe
        await ctx.db
          .delete(subscriptions)
          .where(eq(subscriptions.id, existing[0].id));

        return { subscribed: false };
      } else {
        // Subscribe
        await ctx.db.insert(subscriptions).values({
          subscriberId: ctx.user.id,
          channelId: input.channelId,
        });

        // Send notification to channel owner
        await ctx.db.insert(notifications).values({
          userId: input.channelId,
          type: "subscription",
          title: "New subscriber",
          message: `${ctx.user.name} subscribed to your channel`,
          link: `/channel/${ctx.user.id}`,
          fromUserId: ctx.user.id,
        }).catch(() => {});

        return { subscribed: true };
      }
    }),

  // Notify all subscribers that channel is going live
  notifySubscribersLive: protectedProcedure
    .input(
      z.object({
        streamTitle: z.string().min(1).max(200),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get all subscribers of the current user's channel
      const subs = await ctx.db
        .select({ subscriberId: subscriptions.subscriberId })
        .from(subscriptions)
        .where(eq(subscriptions.channelId, ctx.user.id));

      if (subs.length === 0) return { notified: 0 };

      // Create a notification for each subscriber
      const notificationValues = subs.map((sub) => ({
        userId: sub.subscriberId,
        type: "new_video" as const,
        title: "🔴 Live Now!",
        message: `${ctx.user.name} is now live: ${input.streamTitle}`,
        link: `/feed/live`,
        fromUserId: ctx.user.id,
      }));

      await ctx.db.insert(notifications).values(notificationValues).catch(() => {});

      return { notified: subs.length };
    }),
});
