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

export function findAccount(userId: string): UserAccount | null {
  return DEMO_ACCOUNTS.find((a) => a.userId.toLowerCase() === userId.toLowerCase()) ?? null
}

export function saveSession(account: UserAccount) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("currentUser", JSON.stringify(account))
  }
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

export function clearSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("currentUser")
  }
}

/** 不備申請の内容修正 — 養成校・イントラストのみ（法人施設は不可） */
export function canEditApplication(user: UserAccount | null): boolean {
  return user?.role === "school" || user?.role === "entrust"
}
