import {
  CircleDollarSign,
  Clock3,
  FileText,
  Landmark,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
  Users,
  WalletCards,
} from "lucide-react";

export const dashboardNavigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Payments", icon: WalletCards },
  { name: "Invoices", icon: ReceiptText },
  { name: "Settlements", icon: Landmark },
  {
    name: "Reconciliation",
    icon: ListChecks,
  },
  { name: "Team", icon: Users },
];

export const dashboardMetrics = [
  {
    label: "Available balance",
    value: "$84,240.60",
    detail: "+12.8% this month",
    icon: CircleDollarSign,
  },
  {
    label: "Pending settlements",
    value: "$18,420.00",
    detail: "4 expected this week",
    icon: Clock3,
  },
  {
    label: "Open invoices",
    value: "$32,890.20",
    detail: "12 awaiting payment",
    icon: FileText,
  },
];

export const dashboardTransactions = [
  {
    company: "Northstar Retail",
    reference: "INV-2048",
    date: "Today, 10:42",
    amount: "+$8,420.00",
    status: "Received",
    incoming: true,
  },
  {
    company: "Atlas Logistics",
    reference: "PAY-8371",
    date: "Today, 09:18",
    amount: "-$2,750.00",
    status: "Processing",
    incoming: false,
  },
  {
    company: "Kora Systems",
    reference: "INV-2045",
    date: "Yesterday, 16:05",
    amount: "+$4,980.00",
    status: "Received",
    incoming: true,
  },
  {
    company: "Cedar Workspace",
    reference: "PAY-8362",
    date: "Yesterday, 11:30",
    amount: "-$1,280.00",
    status: "Completed",
    incoming: false,
  },
];

export const dashboardSettlements = [
  {
    label: "Card collections",
    date: "June 16",
    amount: "$12,480.00",
    progress: 82,
  },
  {
    label: "Bank transfers",
    date: "June 17",
    amount: "$4,820.00",
    progress: 58,
  },
  {
    label: "Invoice payouts",
    date: "June 18",
    amount: "$1,120.00",
    progress: 34,
  },
];

export const cashFlowBars = [44, 58, 48, 72, 66, 84, 76, 92, 70, 88, 78, 96];
