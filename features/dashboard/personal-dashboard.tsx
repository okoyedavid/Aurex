"use client";

import Link from "next/link";
import { ArrowRight, Bell, Building2, CheckCircle2, Clock3, Plus, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeQuery } from "@/features/auth/use-me-query";
import { useBusinessesQuery } from "@/features/business/business-hooks";
import { useNotifications, useReceivedBusinessInvites } from "@/features/access/hooks";
import { Badge, ErrorState, formatDateTime } from "@/features/access/shared";
import { roleLabel } from "@/features/business/business-display-utils";

function Skeleton({className=""}:{className?:string}){return <div className={`animate-pulse rounded-lg bg-muted ${className}`}/>}

export function PersonalDashboard() {
  const me = useMeQuery();
  const businesses = useBusinessesQuery();
  const invites = useReceivedBusinessInvites(1, 4, "pending");
  const notifications = useNotifications(1, 5, false);
  const firstName = me.data?.name?.split(/\s+/)[0] || me.data?.username || "there";
  const businessItems = businesses.data ?? [];
  const pendingInvites = invites.data?.pagination.total ?? 0;
  const unread = notifications.data?.unreadCount ?? 0;

  return <div className="px-4 py-6 pb-12 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1320px]">
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"/>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><CheckCircle2 className="h-3.5 w-3.5"/>Your Aurex workspace</div><h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Good to see you, {firstName}.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Move between every business you belong to, respond to invitations, and keep up with account activity from one place.</p></div><Button asChild className="h-10 w-fit px-4"><Link href="/dashboard/business"><Plus/>Create business</Link></Button></div>
    </section>

    <section className="mt-5 grid gap-4 sm:grid-cols-3">
      {[{label:"Business workspaces",value:businessItems.length,detail:"Owned and joined",icon:Building2,href:"/dashboard/business"},{label:"Pending invitations",value:pendingInvites,detail:pendingInvites?"Waiting for your response":"Nothing waiting",icon:UserPlus,href:"/dashboard/invites"},{label:"Unread notifications",value:unread,detail:unread?"New activity to review":"You’re all caught up",icon:Bell,href:"/dashboard/notifications"}].map(({label,value,detail,icon:Icon,href})=><Link key={label} href={href} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className="rounded-lg bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5"/></span></div></Link>)}
    </section>

    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
      <section className="rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-bold">Your businesses</h2><p className="mt-1 text-xs text-muted-foreground">Workspaces where you currently have access</p></div><Link href="/dashboard/business" className="flex items-center gap-1 text-sm font-semibold text-primary">View all <ArrowRight className="h-4 w-4"/></Link></div>
        <div className="p-2">{businesses.isLoading?<div className="space-y-2 p-2">{[1,2,3].map(i=><Skeleton key={i} className="h-20"/>)}</div>:businesses.error?<div className="p-3"><ErrorState error={businesses.error} onRetry={()=>businesses.refetch()}/></div>:businessItems.length?businessItems.slice(0,4).map(item=><Link key={item.business.id} href={`/business/${item.business.id}`} className="group flex items-center gap-4 rounded-lg p-3 transition hover:bg-muted/60"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 font-bold text-primary">{item.business.profile_img?<span className="h-full w-full bg-cover bg-center" style={{backgroundImage:`url(${item.business.profile_img})`}}/>:item.business.name.slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{item.business.name}</p><Badge tone={item.membership?.status==="active"?"good":"warn"}>{item.membership?.status??"owner"}</Badge></div><p className="mt-1 truncate text-xs text-muted-foreground">{item.business.industry} · {roleLabel(item)}</p></div><ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"/></Link>):<div className="p-8 text-center"><Building2 className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-3 font-semibold">No business workspace yet</p><p className="mt-1 text-sm text-muted-foreground">Create one or accept an invitation to get started.</p></div>}</div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-bold">Recent notifications</h2><p className="mt-1 text-xs text-muted-foreground">Personal activity across Aurex</p></div><Link href="/dashboard/notifications" className="text-sm font-semibold text-primary">View all</Link></div><div className="p-2">{notifications.isLoading?<div className="space-y-2 p-2">{[1,2,3].map(i=><Skeleton key={i} className="h-16"/>)}</div>:notifications.error?<p className="p-5 text-sm text-muted-foreground">Notifications are temporarily unavailable.</p>:notifications.data?.items.length?notifications.data.items.map(n=><Link href="/dashboard/notifications" key={n.id} className={`flex gap-3 rounded-lg p-3 hover:bg-muted/60 ${n.readAt?"":"bg-primary/5"}`}><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt?"bg-border":"bg-primary"}`}/><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{n.title}</p>{n.severity!=="info"?<Badge tone={n.severity==="warning"?"warn":"bad"}>{n.severity}</Badge>:null}</div><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{n.message}</p><p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(n.createdAt)}</p></div></Link>):<div className="p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-primary"/><p className="mt-3 font-semibold">All caught up</p><p className="mt-1 text-sm text-muted-foreground">New account activity will appear here.</p></div>}</div></section>
    </div>

    {pendingInvites>0?<section className="mt-5 flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><span className="rounded-lg bg-primary/10 p-2.5 text-primary"><Clock3 className="h-5 w-5"/></span><div><p className="font-semibold">You have {pendingInvites} invitation{pendingInvites===1?"":"s"} waiting</p><p className="mt-1 text-sm text-muted-foreground">Review the requested role and its permissions before accepting.</p></div></div><Button asChild variant="outline"><Link href="/dashboard/invites">Review invitations <ArrowRight/></Link></Button></section>:null}
  </div></div>;
}
