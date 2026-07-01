import {
  HelpCircle,
  CheckCircle2,
  Wallet,
  ClipboardCheck,
  AlertCircle,
  ShieldAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react"

export const DASHBOARD_CONTRACT_STATUSES = [
  "確定待ち",
  "確定済み",
  "代位弁済依頼中",
  "弁済依頼確認済み",
  "弁済依頼差し戻し",
  "弁済依頼承認済み",
  "解約",
] as const

export type DashboardContractStatus = (typeof DASHBOARD_CONTRACT_STATUSES)[number]

export type ContractStatusStyle = {
  icon: LucideIcon
  iconColor: string
  bgColor: string
  label: string
  container: string
}

export const CONTRACT_STATUS_STYLES: Record<string, ContractStatusStyle> = {
  "確定待ち": {
    icon: HelpCircle,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-50",
    label: "確定待ち",
    container: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  "確定済み": {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    label: "確定済み",
    container: "bg-green-50 text-green-600 border-green-200",
  },
  "代位弁済依頼中": {
    icon: Wallet,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
    label: "代位弁済依頼中",
    container: "bg-purple-50 text-purple-600 border-purple-200",
  },
  "弁済依頼確認済み": {
    icon: ClipboardCheck,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    label: "弁済依頼確認済み",
    container: "bg-blue-50 text-blue-600 border-blue-200",
  },
  "弁済依頼承認済み": {
    icon: ShieldAlert,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    label: "弁済依頼承認済み",
    container: "bg-green-50 text-green-600 border-green-200",
  },
  "弁済依頼差し戻し": {
    icon: AlertCircle,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "弁済依頼差し戻し",
    container: "bg-orange-50 text-orange-600 border-orange-200",
  },
  "取り下げ": {
    icon: XCircle,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "取り下げ",
    container: "bg-orange-50 text-orange-600 border-orange-200",
  },
  "解約": {
    icon: XCircle,
    iconColor: "text-gray-500",
    bgColor: "bg-gray-100",
    label: "解約",
    container: "bg-gray-50 text-gray-600 border-gray-200",
  },
}

export const DEFAULT_CONTRACT_STATUS_STYLE: ContractStatusStyle = {
  icon: HelpCircle,
  iconColor: "text-gray-500",
  bgColor: "bg-gray-100",
  label: "",
  container: "bg-gray-50 text-gray-600 border-gray-200",
}

/** @deprecated Use CONTRACT_STATUS_STYLES — kept for imports that only need container/dot mapping */
export type ContractStatusBadgeStyle = {
  container: string
  dot: string
}

export const CONTRACT_STATUS_BADGE_STYLES: Record<string, ContractStatusBadgeStyle> =
  Object.fromEntries(
    Object.entries(CONTRACT_STATUS_STYLES).map(([key, style]) => [
      key,
      {
        container: style.container,
        dot: style.iconColor.replace("text-", "bg-"),
      },
    ])
  )

export const DEFAULT_CONTRACT_STATUS_BADGE_STYLE: ContractStatusBadgeStyle = {
  container: DEFAULT_CONTRACT_STATUS_STYLE.container,
  dot: "bg-gray-500",
}
