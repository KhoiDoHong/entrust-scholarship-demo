import {
  FileSearch,
  AlertCircle,
  FilePenLine,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react"

export const APPLICATION_STATUS_LABELS = [
  "審査中",
  "不備あり",
  "修正済み",
  "承認",
  "否決",
] as const

export type ApplicationStatusLabel = (typeof APPLICATION_STATUS_LABELS)[number]

export const APPLICATION_DOCUMENT_LABELS = {
  applicationForm: "申込書",
  idDocument: "身分証明書",
} as const

export const APPLICATION_STATUS_STYLES: Record<
  ApplicationStatusLabel,
  { icon: LucideIcon; iconColor: string; bgColor: string; label: string }
> = {
  "審査中": {
    icon: FileSearch,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    label: "審査中",
  },
  "不備あり": {
    icon: AlertCircle,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "不備あり",
  },
  "修正済み": {
    icon: FilePenLine,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
    label: "修正済み",
  },
  "承認": {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    label: "承認",
  },
  "否決": {
    icon: XCircle,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    label: "否決",
  },
}
