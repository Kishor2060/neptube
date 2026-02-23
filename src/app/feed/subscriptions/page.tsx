"use client";

import { useState, Suspense } from "react";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  PlaySquare,
  Zap,
  MessageSquare,
  Video,
  ThumbsUp,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────

function formatViewCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return `${count}`;
}

// ─── Tab Type ────────────────────────────────────────────────────────

type TabKey = "videos" | "shorts" | "community";

const tabsList: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "videos", label: "Videos", icon: Video },
  { key: "shorts", label: "Shorts", icon: Zap },
  { key: "community", label: "Community", icon: MessageSquare },
];

// ─── Videos Tab ──────────────────────────────────────────────────────

function VideosTab() {
  const { data, isLoading } = trpc.videos.getSubscriptionsFeed.useQuery({
    limit: 30,
  });

  if (isLoading) return <GridSkeleton count={8} />;

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={PlaySquare}
        title="No videos yet"
        description={
          data?.subscribedChannels === 0
            ? "Subscribe to channels to see their latest videos here."
            : "Channels you follow haven't uploaded recently."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-6">
      {data.items.map((video) => (
        <Link key={video.id} href={`/feed/${video.id}`} className="group">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-2">
            {video.isNsfw && (
              <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-xl flex items-center justify-center">
                <span className="text-red-400 text-[10px] font-medium">NSFW</span>
              </div>
            )}
            {video.thumbnailURL ? (
              <Image
                src={video.thumbnailURL}
                alt={video.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground text-lg font-bold">
                  {video.title[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                {video.user.imageURL ? (
                  <Image
                    src={video.user.imageURL}
                    alt={video.user.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold">
                    {video.user.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[13px] line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {video.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatViewCount(video.viewCount)} ·{" "}
                {formatDistanceToNow(new Date(video.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Shorts Tab ──────────────────────────────────────────────────────

function ShortsTab() {
  const { data, isLoading } = trpc.videos.getSubscriptionShorts.useQuery({
    limit: 30,
  });

  if (isLoading) return <GridSkeleton count={8} aspect="portrait" />;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title="No shorts yet"
        description="Channels you're subscribed to haven't posted any Shorts recently."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
      {data.map((short) => (
        <Link key={short.id} href={`/shorts?v=${short.id}`} className="group">
          <div className="relative aspect-[9/16] bg-muted rounded-xl overflow-hidden mb-1.5">
            {short.thumbnailURL ? (
              <Image
                src={short.thumbnailURL}
                alt={short.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Zap className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 pt-8">
              <p className="text-white text-[11px] font-medium line-clamp-2 leading-tight">
                {short.title}
              </p>
              <p className="text-white/60 text-[10px] mt-0.5">
                {formatViewCount(short.viewCount)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Community Tab ───────────────────────────────────────────────────

function CommunityTab() {
  const { data, isLoading } = trpc.community.getSubscriptionPosts.useQuery({
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No community posts"
        description="Channels you're subscribed to haven't made any community posts yet."
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {data.map((post) => (
        <div
          key={post.id}
          className="rounded-xl border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors"
        >
          {/* Post Header */}
          <div className="flex items-center gap-3 mb-3">
            <Link href={`/channel/${post.user.id}`} className="flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
                {post.user.imageURL ? (
                  <Image
                    src={post.user.imageURL}
                    alt={post.user.name}
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold">
                    {post.user.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            <div>
              <Link
                href={`/channel/${post.user.id}`}
                className="text-sm font-semibold hover:text-primary transition-colors"
              >
                {post.user.name}
              </Link>
              <p className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          {/* Post Content */}
          {post.content && (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3 leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Post Image */}
          {post.type === "image" && post.imageURL && (
            <div className="relative rounded-lg overflow-hidden mb-3 bg-muted">
              <Image
                src={post.imageURL}
                alt="Community post image"
                width={600}
                height={400}
                className="w-full object-cover max-h-[400px]"
              />
            </div>
          )}

          {/* Poll Options */}
          {post.type === "poll" && post.pollOptions.length > 0 && (
            <div className="space-y-2 mb-3">
              {post.pollOptions.map((option) => {
                const totalVotes = post.pollOptions.reduce(
                  (sum, o) => sum + o.voteCount,
                  0
                );
                const percentage =
                  totalVotes > 0
                    ? Math.round((option.voteCount / totalVotes) * 100)
                    : 0;
                return (
                  <div
                    key={option.id}
                    className="relative rounded-lg border border-border overflow-hidden"
                  >
                    <div
                      className="absolute inset-0 bg-primary/10"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between px-3 py-2">
                      <span className="text-sm">{option.text}</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
              <p className="text-[11px] text-muted-foreground">
                {post.pollOptions.reduce((sum, o) => sum + o.voteCount, 0)} votes
              </p>
            </div>
          )}

          {/* Post Footer */}
          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ThumbsUp className="h-3.5 w-3.5" />
              {formatCount(post.likeCount)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {formatCount(post.commentCount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-primary/60" />
      </div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
    </div>
  );
}

function GridSkeleton({
  count,
  aspect = "video",
}: {
  count: number;
  aspect?: "video" | "portrait";
}) {
  const gridClass =
    aspect === "portrait"
      ? "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3"
      : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-6";

  return (
    <div className={gridClass}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          <Skeleton
            className={cn(
              "rounded-lg mb-2",
              aspect === "portrait" ? "aspect-[9/16]" : "aspect-video"
            )}
          />
          {aspect === "video" && (
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

function SubscriptionsFeed() {
  const [activeTab, setActiveTab] = useState<TabKey>("videos");

  // Prefetch subscription count for header
  const { data: subsData } = trpc.subscriptions.getMySubscriptions.useQuery();
  const channelCount = subsData?.length ?? 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight gradient-text flex items-center gap-2">
          <Users className="h-6 w-6" />
          Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {channelCount > 0
            ? `Latest from your ${channelCount} subscribed channel${channelCount !== 1 ? "s" : ""}`
            : "Subscribe to channels to see their content here"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all relative",
                "hover:text-foreground",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "videos" && <VideosTab />}
      {activeTab === "shorts" && <ShortsTab />}
      {activeTab === "community" && <CommunityTab />}
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-1 mb-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      }
    >
      <SubscriptionsFeed />
    </Suspense>
  );
}
