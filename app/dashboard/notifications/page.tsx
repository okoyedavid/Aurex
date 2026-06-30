import type { Metadata } from "next";
import { NotificationsPage } from "@/features/access/notifications-page";
export const metadata:Metadata={title:"Notifications",description:"Your personal Aurex notifications."};
export default function Page(){return <NotificationsPage/>}
