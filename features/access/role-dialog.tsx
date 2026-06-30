"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { permissionLabels } from "@/features/business/member-role-options";
import { useCreateCustomRole,useUpdateCustomRole } from "./hooks";
import type { BusinessRole } from "@/lib/access-api";
import type { Permission } from "@/types/generic";

export function RoleDialog({businessId,open,onOpenChange,available,role,onCreated}:{businessId:string;open:boolean;onOpenChange:(v:boolean)=>void;available:Permission[];role?:BusinessRole|null;onCreated?:(r:BusinessRole)=>void}){
 return <Dialog open={open} onOpenChange={onOpenChange}>{open?<RoleForm key={role?.id??"new"} businessId={businessId} available={available} role={role} onCreated={onCreated} onClose={()=>onOpenChange(false)}/>:null}</Dialog>
}

function RoleForm({businessId,available,role,onCreated,onClose}:{businessId:string;available:Permission[];role?:BusinessRole|null;onCreated?:(r:BusinessRole)=>void;onClose:()=>void}){
 const [name,setName]=useState(role?.name??""); const [grants,setGrants]=useState<Permission[]>(role?.permissions??[]); const [denials,setDenials]=useState<Permission[]>(role?.deniedPermissions??[]);
 const create=useCreateCustomRole(businessId), update=useUpdateCustomRole(businessId,role?.id??""); const mutation=role?update:create;
 const toggle=(p:Permission)=>setGrants(v=>v.includes(p)?v.filter(x=>x!==p):[...v,p]);
 const submit=()=>{if(!name.trim())return toast.error("Role name is required."); if(denials.some(p=>!grants.includes(p)))return toast.error("Every explicit denial must also be included in granted permissions.");mutation.mutate({name:name.trim(),permissions:grants,deniedPermissions:denials},{onSuccess:r=>{toast.success(role?"Role updated.":"Role created.");onCreated?.(r);onClose()},onError:e=>toast.error(e.message)})};
 return <DialogContent><DialogHeader><DialogTitle>{role?"Edit custom role":"Create custom role"}</DialogTitle><DialogDescription>Only permissions in your current effective access are available.</DialogDescription></DialogHeader><label className="space-y-1 text-sm font-medium">Role name<Input value={name} onChange={e=>setName(e.target.value)} placeholder="Payroll Assistant"/></label><div className="grid gap-2 sm:grid-cols-2">{available.map(p=><div key={p} className="rounded-lg border border-border p-3"><label className="flex gap-2 text-sm"><input type="checkbox" checked={grants.includes(p)} onChange={()=>toggle(p)}/><span>{permissionLabels[p]}</span></label>{grants.includes(p)?<label className="mt-2 flex gap-2 pl-5 text-xs text-muted-foreground"><input type="checkbox" checked={denials.includes(p)} onChange={e=>setDenials(v=>e.target.checked?[...v,p]:v.filter(x=>x!==p))}/>Explicitly deny</label>:null}</div>)}</div><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending?"Saving…":"Save role"}</Button></DialogFooter></DialogContent>
}
