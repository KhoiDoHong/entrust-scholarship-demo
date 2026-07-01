"use client"

import {
  Search,
  AlertCircle,
  FilePenLine,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  APPLICATION_STATUS_STYLES,
  type ApplicationStatusLabel,
} from "@/lib/application-status-styles"
import {
  CONTRACT_STATUS_STYLES,
  CONTRACT_STATUS_BADGE_STYLES,
  DEFAULT_CONTRACT_STATUS_STYLE,
  DEFAULT_CONTRACT_STATUS_BADGE_STYLE,
} from "@/lib/contract-status-styles"

export type StatusType =
  | "reviewing" // 審査中 (blue)
  | "warning" // 不備あり (orange)
  | "approved" // 承認 (green)
  | "rejected" // 否決 (red)
  | "change" // 変更, 就職先変更
  | "info" // 住所変更, 返還入金, 契約, 申請
  | "edited" // 修正済み (purple)

const statusStyles: Record<StatusType, string> = {
  reviewing: "bg-blue-50 text-blue-600 border-blue-200",
  warning: "bg-orange-50 text-orange-600 border-orange-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  change: "bg-purple-50 text-purple-600 border-purple-200",
  info: "bg-blue-50 text-blue-600 border-blue-200",
  edited: "bg-purple-50 text-purple-600 border-purple-200",
}

const statusDotStyles: Record<StatusType, string> = {
  reviewing: "bg-blue-500",
  warning: "bg-orange-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  change: "bg-purple-500",
  info: "bg-blue-500",
  edited: "bg-purple-500",
}

// For solid background badges (like in activity feeds)
const solidStatusStyles: Record<StatusType, string> = {
  reviewing: "bg-blue-500 text-white",
  warning: "bg-orange-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  change: "bg-purple-500 text-white",
  info: "bg-blue-500 text-white",
  edited: "bg-purple-500 text-white",
}

interface StatusBadgeProps {
  status: string
  type: StatusType
  variant?: "outline" | "solid"
  showDot?: boolean
  className?: string
}

export function StatusBadge({
  status,
  type,
  variant = "outline",
  showDot = true,
  className,
}: StatusBadgeProps) {
  if (variant === "solid") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded",
          solidStatusStyles[type],
          className
        )}
      >
        {status}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border",
        statusStyles[type],
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", statusDotStyles[type])} />
      )}
      {status}
    </span>
  )
}

// Helper function to get status type from status label
export function getStatusType(status: string): StatusType {
  const reviewingStatuses = ["審査中"]
  const warningStatuses = ["不備あり"]
  const approvedStatuses = ["承認"]
  const rejectedStatuses = ["否決"]
  const changeStatuses = ["変更", "就職先変更"]
  const editedStatuses = ["修正済み"]

  if (reviewingStatuses.includes(status)) return "reviewing"
  if (warningStatuses.includes(status)) return "warning"
  if (approvedStatuses.includes(status)) return "approved"
  if (rejectedStatuses.includes(status)) return "rejected"
  if (changeStatuses.includes(status)) return "change"
  if (editedStatuses.includes(status)) return "edited"
  return "info"
}

const statusIconConfig: Record<StatusType, { icon: LucideIcon; iconColor: string }> = {
  reviewing: { icon: Search, iconColor: "text-blue-500" },
  warning: { icon: AlertCircle, iconColor: "text-orange-500" },
  edited: { icon: FilePenLine, iconColor: "text-purple-500" },
  approved: { icon: CheckCircle2, iconColor: "text-green-500" },
  rejected: { icon: XCircle, iconColor: "text-red-500" },
  change: { icon: FilePenLine, iconColor: "text-purple-500" },
  info: { icon: Search, iconColor: "text-blue-500" },
}

interface ApplicationStatusBadgeProps {
  status: string
  size?: "sm" | "md"
  className?: string
}

/** Badge with Lucide icon — matches dashboard 審査申請 status cards (SCR-011 header). */
export function ApplicationStatusBadge({
  status,
  size = "sm",
  className,
}: ApplicationStatusBadgeProps) {
  const type = getStatusType(status)
  const knownStyle = APPLICATION_STATUS_STYLES[status as ApplicationStatusLabel]
  const Icon = knownStyle?.icon ?? statusIconConfig[type].icon
  const iconColor = knownStyle?.iconColor ?? statusIconConfig[type].iconColor
  const isMd = size === "md"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        isMd ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
        statusStyles[type],
        className
      )}
    >
      <Icon className={cn(isMd ? "w-4 h-4" : "w-3.5 h-3.5", iconColor)} />
      {status}
    </span>
  )
}

interface ContractStatusBadgeProps {
  status: string
  size?: "sm" | "md"
  /** List tables use dot; 契約詳細 header uses icon (dashboard style). */
  variant?: "dot" | "icon"
  className?: string
}

export function ContractStatusBadge({
  status,
  size = "sm",
  variant = "dot",
  className,
}: ContractStatusBadgeProps) {
  const style = CONTRACT_STATUS_STYLES[status] ?? DEFAULT_CONTRACT_STATUS_STYLE
  const badgeStyle =
    CONTRACT_STATUS_BADGE_STYLES[status] ?? DEFAULT_CONTRACT_STATUS_BADGE_STYLE
  const Icon = style.icon
  const isMd = size === "md"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        isMd ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
        style.container,
        className
      )}
    >
      {variant === "icon" ? (
        <Icon className={cn(isMd ? "w-4 h-4" : "w-3.5 h-3.5", style.iconColor)} />
      ) : (
        <span
          className={cn(
            "rounded-full",
            isMd ? "w-2 h-2" : "w-1.5 h-1.5",
            badgeStyle.dot
          )}
        />
      )}
      {status}
    </span>
  )
}
