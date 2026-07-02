"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  FilePenLine,
  FileSearch,
  FileText,
  ShieldAlert,
  Wallet,
  XCircle,
} from "lucide-react"
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STYLES,
} from "@/lib/application-status-styles"
import {
  CONTRACT_STATUS_STYLES,
  DASHBOARD_CONTRACT_STATUSES,
} from "@/lib/contract-status-styles"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import {
  getDashboardApplicationCounts,
  getDashboardContractCounts,
} from "@/lib/dashboard-stats"

const APP_ACTIVITIES = [
  {
    id: 1,
    icon: FileSearch,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "審査中",
    description: "審査管理IDXXXXXが審査中になりました。",
    daysAgo: 0,
  },
  {
    id: 2,
    icon: AlertCircle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "不備あり",
    description: "審査管理IDXXXXXに書類不備が発生しました。",
    daysAgo: 1,
  },
  {
    id: 3,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    title: "承認",
    description: "審査管理IDXXXXXが承認されました。",
    daysAgo: 2,
  },
  {
    id: 4,
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    title: "否決",
    description: "審査管理IDXXXXXが否決されました。",
    daysAgo: 4,
  },
]

const CONTRACT_ACTIVITIES = [
  {
    id: 1,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    title: "確定済み",
    description: "契約番号YYYYYが確定されました。",
    daysAgo: 0,
  },
  {
    id: 2,
    icon: Wallet,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "代位弁済依頼中",
    description: "契約番号YYYYYが代位弁済依頼中になりました。",
    daysAgo: 1,
  },
  {
    id: 3,
    icon: ShieldAlert,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    title: "弁済依頼承認済み",
    description: "契約番号YYYYYの弁済依頼が承認されました。",
    daysAgo: 3,
  },
  {
    id: 4,
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "契約者情報変更",
    description: "契約番号YYYYYの契約者情報が更新されました。",
    daysAgo: 5,
  },
  {
    id: 5,
    icon: BellRing,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    title: "事前通知送付",
    description: "契約番号YYYYYの事前通知が送付されました",
    daysAgo: 6,
  },
]

function daysAgoLabel(daysAgo: number): string {
  if (daysAgo === 0) return "本日"
  if (daysAgo === 1) return "1日前"
  return `${daysAgo}日前`
}

export default function Dashboard() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
  }, [])

  const appCounts = useMemo(
    () => getDashboardApplicationCounts(currentUser),
    [currentUser]
  )

  const contractCounts = useMemo(
    () => getDashboardContractCounts(currentUser),
    [currentUser]
  )

  useEffect(() => {
    if (sessionStorage.getItem("emailChangeSuccess") !== "1") return
    sessionStorage.removeItem("emailChangeSuccess")
    toast({
      variant: "success",
      title: "メールアドレスを変更しました。",
    })
  }, [toast])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">システムの概要と最新の活動を確認できます</p>
      </div>
      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">審査申請</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {APPLICATION_STATUS_LABELS.map((s) => {
              const cfg = APPLICATION_STATUS_STYLES[s]
              return (
                <Card key={s} className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{cfg.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{appCounts[s] ?? 0}</p>
                      </div>
                      <div className={cn("p-1.5 rounded-full", cfg.bgColor)}>
                        <cfg.icon className={cn("w-4 h-4", cfg.iconColor)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">直近の活動</p>
              <div className="space-y-0 divide-y divide-gray-50">
                {APP_ACTIVITIES.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 py-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", a.iconBg)}>
                      <a.icon className={cn("w-4 h-4", a.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900">{a.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{daysAgoLabel(a.daysAgo)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">契約</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
            {DASHBOARD_CONTRACT_STATUSES.map((s) => {
              const cfg = CONTRACT_STATUS_STYLES[s]
              return (
                <Card key={s} className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{cfg.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{contractCounts[s] ?? 0}</p>
                      </div>
                      <div className={cn("p-1.5 rounded-full", cfg.bgColor)}>
                        <cfg.icon className={cn("w-4 h-4", cfg.iconColor)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">直近の活動</p>
              <div className="space-y-0 divide-y divide-gray-50">
                {CONTRACT_ACTIVITIES.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 py-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", a.iconBg)}>
                      <a.icon className={cn("w-4 h-4", a.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900">{a.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{daysAgoLabel(a.daysAgo)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
