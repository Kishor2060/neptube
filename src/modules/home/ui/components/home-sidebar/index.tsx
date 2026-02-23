"use client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainSection } from "./main-section"
import { PersonalSection } from "./personal-section"
import { Crown, ShieldCheck } from "lucide-react";


export const HomeSidebar = ()=>{
    // Get current user info (including role)
    const { data: currentUser } = trpc.users.me.useQuery(undefined, { staleTime: 60_000 });
    // Helper: treat admins as premium
    const isAdmin = currentUser?.role === "admin";
    // Helper: treat as premium if admin or premium tier
    const isPremium = isAdmin || currentUser?.subscriptionTier === "premium" || currentUser?.subscriptionTier === "vip";
    return (
        <Sidebar className="pt-14 z-40 border-none" collapsible="icon">
            <SidebarContent className="neptube-sidebar-content flex flex-col h-full">
                <div className="flex-1 min-h-0 flex flex-col gap-1 pt-2">
                    <MainSection/>
                    <div className="neptube-divider mx-4" />
                    <PersonalSection/>
                    {isAdmin && (
                        <>
                            <div className="neptube-divider mx-4" />
                            <div className="px-2">
                                <Link href="/admin">
                                    <div className="neptube-admin-card group">
                                        <div className="flex items-center gap-2.5">
                                            <span className="neptube-icon-badge bg-gradient-to-br from-red-500 to-rose-600 flex-shrink-0">
                                                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                                            </span>
                                            <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                                                <span className="text-[13px] font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">Admin Panel</span>
                                                <p className="text-[10px] text-muted-foreground leading-tight">Manage users, videos & more</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-3 mt-auto group-data-[collapsible=icon]:p-1">
                    <Link href="/premium">
                        <div className="neptube-premium-card group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
                            <div className="flex items-center gap-2 mb-1.5 group-data-[collapsible=icon]:mb-0">
                                <Crown className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                <span className="text-xs font-bold tracking-wide text-white group-data-[collapsible=icon]:hidden">NepTube Pro</span>
                            </div>
                            <p className="text-[10px] text-white/60 leading-tight mb-2.5 group-data-[collapsible=icon]:hidden">
                                Ad-free, offline, and 4K quality
                            </p>
                            <Button size="sm" className="w-full h-7 text-[11px] font-bold rounded-md bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all group-data-[collapsible=icon]:hidden">
                                Go Premium
                            </Button>
                        </div>
                    </Link>
                </div>
            </SidebarContent>
        </Sidebar>
    )
}