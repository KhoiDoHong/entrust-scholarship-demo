"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef, useMemo } from "react"
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  LogOut,
  Shield,
  UserCircle,
  Mail,
  KeyRound,
  User,
  HelpCircle,
  CheckCircle2,
  Ban,
  BellRing,
  UserCog,
  Users,
  Landmark,
  Wallet,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { clearSession, type UserAccount, type UserRole } from "@/lib/auth"
import { AuthGuard } from "@/components/auth-guard"

const sidebarItems = [
  { icon: LayoutDashboard, label: "ダッシュボード", href: "/" },
  { icon: FileText, label: "審査申請", href: "/applications" },
]

const contractSidebarItems: {
  icon: React.ElementType
  label: string
  href: string
  roles: UserRole[]
}[] = [
  {
    icon: HelpCircle,
    label: "契約確定通知",
    href: "/contract-confirmation",
    roles: ["school", "corporation", "association"],
  },
  {
    icon: CheckCircle2,
    label: "今月確定通知一覧",
    href: "/contract-confirmed-this-month",
    roles: ["entrust"],
  },
  {
    icon: Ban,
    label: "契約キャンセル一覧",
    href: "/contract-cancellations",
    roles: ["school", "corporation", "association", "entrust"],
  },
]

const sidebarItemsAfterContracts: {
  icon: React.ElementType
  label: string
  href: string
  roles?: UserRole[]
}[] = [
  { icon: FileCheck, label: "契約管理", href: "/contract-management" },
  {
    icon: BellRing,
    label: "事前通知対象",
    href: "/contract-prior-notification-targets",
    roles: ["entrust"],
  },
  {
    icon: Landmark,
    label: "送金先口座申請対象",
    href: "/contract-remittance-account-targets",
    roles: ["entrust"],
  },
  {
    icon: Wallet,
    label: "弁済依頼対象",
    href: "/contract-subrogation-request-targets",
    roles: ["entrust"],
  },
  {
    icon: UserCog,
    label: "担当者変更対象",
    href: "/contract-staff-change-targets",
    roles: ["entrust"],
  },
  {
    icon: Users,
    label: "連帯保証人変更対象",
    href: "/contract-guarantor-change-targets",
    roles: ["entrust"],
  },
  { icon: Building2, label: "法人マスタ", href: "/corporation-master" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

function DashboardShell({
  currentUser,
  children,
}: {
  currentUser: UserAccount
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push("/login")
  }

  const visibleContractSidebar = useMemo(
    () => contractSidebarItems.filter((item) => item.roles.includes(currentUser.role)),
    [currentUser.role]
  )

  const visibleSidebarAfterContracts = useMemo(
    () =>
      sidebarItemsAfterContracts.filter(
        (item) => !item.roles || item.roles.includes(currentUser.role)
      ),
    [currentUser.role]
  )

  const isNavActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const renderSidebarButton = (
    item: { icon: React.ElementType; label: string; href: string },
    isActive: boolean
  ) => (
    <button
      key={item.href}
      onClick={() => router.push(item.href)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
        isActive
          ? "bg-blue-500 text-white"
          : "text-blue-100 hover:bg-[#2a4a6f]"
      )}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span className="leading-tight">{item.label}</span>
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">イントラスト</div>
            <div className="text-[10px] text-gray-500">介護福祉士修学資金保証システム</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{currentUser.organization}</div>
            </div>
            <span
              className={cn(
                "px-2 py-0.5 text-xs font-medium rounded text-white whitespace-nowrap",
                currentUser.role === "school" && "bg-green-600",
                currentUser.role === "corporation" && "bg-blue-600",
                currentUser.role === "association" && "bg-purple-600",
                currentUser.role === "entrust" && "bg-orange-500"
              )}
            >
              {currentUser.label}
            </span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <UserCircle className="w-6 h-6" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.push("/account/email")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  メールアドレス変更
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    router.push("/account/password")
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-gray-400" />
                  パスワード変更
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-56 bg-[#1e3a5f] flex flex-col">
          <nav className="flex-1 p-2 space-y-0.5">
            {sidebarItems.map((item) =>
              renderSidebarButton(item, isNavActive(item.href))
            )}
            {visibleContractSidebar.map((item) =>
              renderSidebarButton(item, isNavActive(item.href))
            )}
            {visibleSidebarAfterContracts.map((item) =>
              renderSidebarButton(item, isNavActive(item.href))
            )}
            {currentUser.role === "entrust" &&
              renderSidebarButton(
                { icon: User, label: "ユーザ管理", href: "/user-management" },
                isNavActive("/user-management")
              )}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      {(currentUser) => (
        <DashboardShell currentUser={currentUser}>{children}</DashboardShell>
      )}
    </AuthGuard>
  )
}
