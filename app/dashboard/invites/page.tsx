import type { Metadata } from "next";
import { ReceivedInvitesPage } from "@/features/access/received-invites-page";
export const metadata:Metadata={title:"Invites",description:"Business invitations sent to your account."};
export default function Page(){return <ReceivedInvitesPage/>}
