"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Crown,
  Sparkles,
  Star,
  Zap,
  CreditCard,
  Download,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TIER_ICONS: Record<string, React.ReactNode> = {
  free: <Star className="h-5 w-5" />,
  lite: <Zap className="h-5 w-5" />,
  premium: <Sparkles className="h-5 w-5" />,
  vip: <Crown className="h-5 w-5" />,
};

const TIER_COLORS: Record<string, string> = {
  free: "text-muted-foreground",
  lite: "text-blue-400",
  premium: "text-purple-400",
  vip: "text-yellow-400",
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  completed: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-400", label: "Completed" },
  pending: { icon: <Clock className="h-4 w-4" />, color: "text-yellow-400", label: "Pending" },
  failed: { icon: <XCircle className="h-4 w-4" />, color: "text-red-400", label: "Failed" },
  refunded: { icon: <RefreshCw className="h-4 w-4" />, color: "text-blue-400", label: "Refunded" },
};

export default function SubscriptionManagementPage() {
  const { data: mySubscription, isLoading: subLoading } = trpc.premium.getMySubscription.useQuery();
  const { data: paymentHistory, isLoading: paymentsLoading } = trpc.premium.getPaymentHistory.useQuery({ limit: 20 });
  const { data: downloads, isLoading: downloadsLoading } = trpc.premium.getMyDownloads.useQuery();

  const cancelSubscription = trpc.premium.cancelSubscription.useMutation();
  const toggleAutoRenew = trpc.premium.toggleAutoRenew.useMutation();

  const handleCancel = async () => {
    try {
      const result = await cancelSubscription.mutateAsync();
      alert(`Subscription cancelled. You'll retain access until ${format(new Date(result.activeUntil), "PPP")}.`);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to cancel subscription");
    }
  };

  const handleToggleAutoRenew = async () => {
    try {
      const result = await toggleAutoRenew.mutateAsync();
      alert(`Auto-renewal ${result.autoRenew ? "enabled" : "disabled"}.`);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to update auto-renewal");
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tier = mySubscription?.tier || "free";
  const subscription = mySubscription?.subscription;
  const isExpired = mySubscription?.isExpired;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Subscription Management</h1>

        {/* Current Plan Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={TIER_COLORS[tier]}>{TIER_ICONS[tier]}</div>
                <div>
                  <CardTitle className="text-foreground text-xl">
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {tier === "free"
                      ? "You're on the free plan"
                      : subscription
                      ? `Active until ${format(new Date(subscription.endDate), "PPP")}`
                      : "No active subscription"}
                  </CardDescription>
                </div>
              </div>
              {tier !== "free" && (
                <Badge
                  className={
                    isExpired
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  }
                >
                  {isExpired ? "Expired" : "Active"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Max Quality</div>
                <div className="text-lg font-bold text-foreground">
                  {mySubscription?.tierConfig.maxQuality || "480p"}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Ads</div>
                <div className="text-lg font-bold text-foreground">
                  {mySubscription?.adConfig.showAds
                    ? mySubscription?.adConfig.reducedFrequency
                      ? "Reduced"
                      : "Yes"
                    : "None"}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Downloads</div>
                <div className="text-lg font-bold text-foreground">
                  {mySubscription?.downloadQuota.maxPerMonth === -1
                    ? "Unlimited"
                    : mySubscription?.downloadQuota.maxPerMonth === 0
                    ? "None"
                    : `${mySubscription?.downloadsThisMonth || 0}/${mySubscription?.downloadQuota.maxPerMonth}`}
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground">Auto-Renew</div>
                <div className="text-lg font-bold text-foreground">
                  {subscription?.autoRenew ? "On" : "Off"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {tier === "free" ? (
                <Link href="/premium">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/premium">
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Change Plan
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="border-border"
                    onClick={handleToggleAutoRenew}
                    disabled={toggleAutoRenew.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {subscription?.autoRenew ? "Disable" : "Enable"} Auto-Renew
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-red-800 text-red-400 hover:bg-red-900/30"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Cancel Subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Your subscription will remain active until the current billing period ends.
                          You won&apos;t be charged again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">
                          Keep Subscription
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          className="bg-red-600 hover:bg-red-500 text-white"
                        >
                          {cancelSubscription.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offline Downloads */}
        {tier !== "free" && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Download className="h-5 w-5" />
                Offline Downloads
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {mySubscription?.downloadQuota.maxPerMonth === -1
                  ? "Unlimited downloads available"
                  : `${mySubscription?.downloadsThisMonth || 0} of ${mySubscription?.downloadQuota.maxPerMonth} used this month`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {downloadsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
              ) : !downloads?.length ? (
                <p className="text-muted-foreground text-center py-4">No offline downloads yet</p>
              ) : (
                <div className="space-y-3">
                  {downloads.map((dl) => (
                    <div
                      key={dl.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        style={{
                          backgroundImage: dl.video.thumbnailURL
                            ? `url(${dl.video.thumbnailURL})`
                            : undefined,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{dl.video.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {dl.quality} · Expires{" "}
                          {format(new Date(dl.expiresAt), "PPP")}
                        </p>
                      </div>
                      <Badge
                        className={
                          dl.status === "ready"
                            ? "bg-green-600/20 text-green-400"
                            : dl.status === "expired"
                            ? "bg-red-600/20 text-red-400"
                            : "bg-yellow-600/20 text-yellow-400"
                        }
                      >
                        {dl.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
            ) : !paymentHistory?.items.length ? (
              <p className="text-muted-foreground text-center py-4">No payment history</p>
            ) : (
              <div className="space-y-2">
                {paymentHistory.items.map((payment) => {
                  const statusConfig = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={statusConfig.color}>{statusConfig.icon}</div>
                        <div>
                          <p className="text-sm text-foreground">
                            {payment.tier.charAt(0).toUpperCase() + payment.tier.slice(1)} Plan
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), "PPP")} via {payment.gateway}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          NPR {(payment.amount / 100).toLocaleString()}
                        </p>
                        <p className={`text-xs ${statusConfig.color}`}>{statusConfig.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiry Warning */}
        {subscription && !subscription.autoRenew && !isExpired && (
          <Card className="bg-yellow-900/20 border-yellow-800">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div>
                  <p className="text-sm text-yellow-300 font-medium">
                  Auto-renewal is disabled
                </p>
                <p className="text-xs text-yellow-400/80">
                  Your subscription will expire on{" "}
                  {format(new Date(subscription.endDate), "PPP")}. Enable auto-renewal to continue
                  enjoying premium features.
                </p>
              </div>
              <Button
                size="sm"
                className="ml-auto bg-yellow-600 hover:bg-yellow-500 text-black"
                onClick={handleToggleAutoRenew}
              >
                Enable
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
