import type { UserAccount } from "@/lib/auth"
import type { ConfirmedContract } from "@/lib/contracts-store"
import type { Application } from "@/lib/applications-data"

/** Demo 養成校名（applications / auth と一致させる） */
export const DEMO_SCHOOL = {
  TOKYO: "東京介護福祉専門学校",
  NAGOYA: "名古屋介護福祉専門学校",
  FUKUOKA: "福岡介護福祉専門学校",
} as const

/** 養成校 → 傘下の法人（1:n） */
export const SCHOOL_AFFILIATED_CORPORATIONS: Record<string, string[]> = {
  東京介護福祉専門学校: [
    "医療法人健康会",
    "社会福祉法人愛心",
    "株式会社ケアサポート",
  ],
  福岡介護福祉専門学校: ["社会福祉法人光明", "医療法人清風会"],
  名古屋介護福祉専門学校: ["株式会社サンプル"],
}

/** 名古屋校の受付担当（SCHOOLS マスタ未登録分） */
export const DEMO_SCHOOL_NAGOYA_RECEPTION = {
  receptionStaffName: "伊藤 誠",
  email: "nagoya@example.ac.jp",
  phone: "052-3001-0001",
} as const

export function getCorporationsForSchool(schoolName: string): string[] {
  return SCHOOL_AFFILIATED_CORPORATIONS[schoolName] ?? []
}

export function isCorporationAffiliatedWithSchool(
  corporationName: string,
  schoolName: string
): boolean {
  return getCorporationsForSchool(schoolName).includes(corporationName)
}

type CorpFacilityRecord = {
  corporationName: string
  facilityName: string
}

export function filterApplicationsByRole(
  apps: Application[],
  user: UserAccount | null
): Application[] {
  if (!user) return []
  if (user.role === "entrust" || user.role === "association") return apps
  if (user.role === "corporation") {
    if (user.corporationName) {
      return apps.filter((a) => a.corporationName === user.corporationName)
    }
    if (user.facilityName) {
      return apps.filter((a) => a.facilityName === user.facilityName)
    }
    return []
  }
  if (user.role === "school") {
    const corps = getCorporationsForSchool(user.organization)
    return apps.filter(
      (a) =>
        a.school.schoolName === user.organization ||
        corps.includes(a.corporationName)
    )
  }
  return []
}

export function filterContractsByRole(
  contracts: ConfirmedContract[],
  user: UserAccount | null
): ConfirmedContract[] {
  if (!user) return []
  if (user.role === "entrust" || user.role === "association") return contracts
  if (user.role === "corporation") {
    if (user.corporationName) {
      return contracts.filter((c) => c.corporationName === user.corporationName)
    }
    if (user.facilityName) {
      return contracts.filter((c) => c.facilityName === user.facilityName)
    }
    return []
  }
  if (user.role === "school") {
    const corps = getCorporationsForSchool(user.organization)
    return contracts.filter((c) => corps.includes(c.corporationName))
  }
  return []
}

export function filterCorpFacilityRecordsByRole<T extends CorpFacilityRecord>(
  records: T[],
  user: UserAccount | null
): T[] {
  if (!user) return []
  if (user.role === "entrust" || user.role === "association") return records
  if (user.role === "corporation") {
    if (user.corporationName) {
      return records.filter((r) => r.corporationName === user.corporationName)
    }
    if (user.facilityName) {
      return records.filter((r) => r.facilityName === user.facilityName)
    }
    return []
  }
  if (user.role === "school") {
    const corps = getCorporationsForSchool(user.organization)
    return records.filter((r) => corps.includes(r.corporationName))
  }
  return []
}
