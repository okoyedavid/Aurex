"use client";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { businessKeys } from "@/lib/business-api";
import { businessMemberKeys } from "@/features/business/business-member-hooks";
import * as service from "@/lib/access-api";

export const roleKeys = { root: (id: string) => ["businesses", id, "roles"] as const, list: (id: string, p: number, l: number) => [...roleKeys.root(id), "list", { p, l }] as const, assignable: (id: string, p: number, l: number) => [...roleKeys.root(id), "assignable", { p, l }] as const, detail: (id: string, roleId: string) => [...roleKeys.root(id), roleId] as const };
export const inviteKeys = { root: ["invites"] as const, received: (p: number, l: number, s?: string) => [...inviteKeys.root, "received", { p, l, s }] as const, businessRoot: (id: string) => [...inviteKeys.root, "business", id] as const, sent: (id: string, p: number, l: number, s?: string) => [...inviteKeys.businessRoot(id), "sent", { p, l, s }] as const, approvals: (id: string, p: number, l: number) => [...inviteKeys.businessRoot(id), "approvals", { p, l }] as const };
export const notificationKeys = { root: ["notifications"] as const, list: (p: number, l: number, u: boolean) => [...notificationKeys.root, { p, l, u }] as const };
const previous = { placeholderData: keepPreviousData };
export const useAssignableRoles = (id: string, p=1, l=100, enabled=true) => useQuery({ queryKey: roleKeys.assignable(id,p,l), queryFn:()=>service.getAssignableRoles(id,p,l), enabled:Boolean(id)&&enabled, ...previous });
export const useBusinessRoles = (id:string,p:number,l:number,enabled=true)=>useQuery({queryKey:roleKeys.list(id,p,l),queryFn:()=>service.getBusinessRoles(id,p,l),enabled:Boolean(id)&&enabled,...previous});
export const useBusinessRole = (id:string,roleId:string,enabled=true)=>useQuery({queryKey:roleKeys.detail(id,roleId),queryFn:()=>service.getBusinessRole(id,roleId),enabled:Boolean(id&&roleId)&&enabled});
function useRoleMutation(id:string, fn:(body:service.RolePayload)=>Promise<service.BusinessRole>){const q=useQueryClient();return useMutation({mutationFn:fn,onSuccess:async(role)=>{q.setQueryData(roleKeys.detail(id,role.id),role);await Promise.all([q.invalidateQueries({queryKey:roleKeys.root(id)}),q.invalidateQueries({queryKey:roleKeys.assignable(id,1,100)})]);}})}
export const useCreateCustomRole=(id:string)=>useRoleMutation(id,(b)=>service.createBusinessRole(id,b));
export const useUpdateCustomRole=(id:string,roleId:string)=>useRoleMutation(id,(b)=>service.updateBusinessRole(id,roleId,b));
export const useArchiveCustomRole=(id:string,roleId:string)=>{const q=useQueryClient();return useMutation({mutationFn:()=>service.archiveBusinessRole(id,roleId),onSuccess:()=>q.invalidateQueries({queryKey:roleKeys.root(id)})});};
export const useSentBusinessInvites=(id:string,p:number,l:number,s?:service.InviteStatus,enabled=true)=>useQuery({queryKey:inviteKeys.sent(id,p,l,s),queryFn:()=>service.getSentInvites(id,p,l,s),enabled:Boolean(id)&&enabled,...previous});
export const useReceivedBusinessInvites=(p:number,l:number,s?:service.InviteStatus)=>useQuery({queryKey:inviteKeys.received(p,l,s),queryFn:()=>service.getReceivedInvites(p,l,s),...previous});
export const usePendingInviteApprovals=(id:string,p:number,l:number,enabled=true)=>useQuery({queryKey:inviteKeys.approvals(id,p,l),queryFn:()=>service.getPendingApprovals(id,p,l),enabled:Boolean(id)&&enabled,...previous});
export const useCreateBusinessInvite=(id:string)=>{const q=useQueryClient();return useMutation({mutationFn:(b:{email:string;roleId:string})=>service.createInvite(id,b),onSuccess:async()=>{await Promise.all([q.invalidateQueries({queryKey:inviteKeys.businessRoot(id)}),q.invalidateQueries({queryKey:[...inviteKeys.businessRoot(id),"approvals"]})]);}})};
export const useAcceptBusinessInvite=()=>{const q=useQueryClient();return useMutation({mutationFn:service.acceptInvite,onSuccess:async(result)=>{await q.invalidateQueries({queryKey:inviteKeys.root});if(result.meta.membershipCreated)await q.invalidateQueries({queryKey:businessKeys.all});}})};
export const useRejectBusinessInvite=()=>{const q=useQueryClient();return useMutation({mutationFn:service.rejectInvite,onSettled:()=>q.invalidateQueries({queryKey:inviteKeys.root})});};
function useApproval(id:string,action:(id:string,inviteId:string)=>Promise<service.BusinessInvite>){const q=useQueryClient();return useMutation({mutationFn:(inviteId:string)=>action(id,inviteId),onSuccess:async()=>Promise.all([q.invalidateQueries({queryKey:inviteKeys.businessRoot(id)}),q.invalidateQueries({queryKey:businessMemberKeys.root(id)}),q.invalidateQueries({queryKey:notificationKeys.root})])});}
export const useApproveBusinessInvite=(id:string)=>useApproval(id,service.approveInvite);
export const useRejectInviteApproval=(id:string)=>useApproval(id,service.rejectInviteApproval);
export const useNotifications=(p:number,l:number,u:boolean)=>useQuery({queryKey:notificationKeys.list(p,l,u),queryFn:()=>service.getNotifications(p,l,u),...previous});
export const useMarkNotificationRead=()=>{const q=useQueryClient();return useMutation({mutationFn:service.markNotificationRead,onSuccess:()=>q.invalidateQueries({queryKey:notificationKeys.root})});};
export const useMarkAllNotificationsRead=()=>{const q=useQueryClient();return useMutation({mutationFn:service.markAllNotificationsRead,onSuccess:()=>q.invalidateQueries({queryKey:notificationKeys.root})});};
