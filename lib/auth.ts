import {
  AUTH_OTP_VERIFIED_COOKIE,
  AUTH_USER_ID_COOKIE,
} from "@/lib/auth-constants"

export type UserRole =
  | "school"           // 養成校
  | "corporation"      // 法人（養成校法人・介護施設）
  | "association"      // 介養協
  | "entrust"          // イントラスト社内

export interface UserAccount {
  userId: string
  role: UserRole
  label: string
  name: string
  organization: string
  email?: string
  corporationName?: string
  facilityName?: string
}

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    userId: "school",
    role: "school",
    label: "養成校",
    name: "山田 敏雄",
    organization: "東京介護福祉専門学校",
  },
  {
    userId: "corporation",
    role: "corporation",
    label: "法人施設",
    name: "鈴木 一郎",
    organization: "医療法人健康会",
    corporationName: "医療法人健康会",
  },
  {
    userId: "association",
    role: "association",
    label: "介養協",
    name: "高橋 四郎",
    organization: "日本介護福祉士養成施設協会",
  },
  {
    userId: "entrust",
    role: "entrust",
    label: "イントラスト社内",
    name: "伊藤 五郎",
    organization: "株式会社イントラスト",
  },
]

const SESSION_TTL_SEC = 60 * 60 * 8

function setAuthCookies(userId: string, otpVerified: boolean) {
  const otpValue = otpVerified ? "1" : "0"
  document.cookie = `${AUTH_USER_ID_COOKIE}=${encodeURIComponent(userId)}; path=/; max-age=${SESSION_TTL_SEC}; SameSite=Lax`
  document.cookie = `${AUTH_OTP_VERIFIED_COOKIE}=${otpValue}; path=/; max-age=${SESSION_TTL_SEC}; SameSite=Lax`
}

function clearAuthCookies() {
  document.cookie = `${AUTH_USER_ID_COOKIE}=; path=/; max-age=0`
  document.cookie = `${AUTH_OTP_VERIFIED_COOKIE}=; path=/; max-age=0`
}

function readOtpVerifiedFromStorage(): boolean {
  return sessionStorage.getItem("otpVerified") === "1"
}

export function findAccount(userId: string): UserAccount | null {
  return DEMO_ACCOUNTS.find((a) => a.userId.toLowerCase() === userId.toLowerCase()) ?? null
}

export function saveSession(
  account: UserAccount,
  options?: { otpVerified?: boolean }
) {
  if (typeof window === "undefined") return

  const otpVerified = options?.otpVerified ?? readOtpVerifiedFromStorage()
  sessionStorage.setItem("currentUser", JSON.stringify(account))
  sessionStorage.setItem("otpVerified", otpVerified ? "1" : "0")
  setAuthCookies(account.userId, otpVerified)
}

export function markOtpVerified() {
  if (typeof window === "undefined") return

  sessionStorage.setItem("otpVerified", "1")
  const session = getSession()
  if (session) {
    setAuthCookies(session.userId, true)
  }
}

export function isOtpVerified(): boolean {
  if (typeof window === "undefined") return false
  return readOtpVerifiedFromStorage()
}

export function getSession(): UserAccount | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem("currentUser")
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserAccount
  } catch {
    return null
  }
}

/** OTP完了後のセッションのみ返す（保護ページ用） */
export function getAuthenticatedSession(): UserAccount | null {
  const session = getSession()
  if (!session || !isOtpVerified()) return null
  return session
}

export function clearSession() {
  if (typeof window === "undefined") return
  sessionStorage.removeItem("currentUser")
  sessionStorage.removeItem("otpVerified")
  clearAuthCookies()
}

/** 不備申請の内容修正 — 養成校・イントラストのみ（法人施設は不可） */
export function canEditApplication(user: UserAccount | null): boolean {
  return user?.role === "school" || user?.role === "entrust"
}
