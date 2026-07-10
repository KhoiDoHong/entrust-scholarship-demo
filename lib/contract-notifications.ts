import { applications } from "@/lib/applications-data"
import { CONTRACT_NOTIFICATION_SEED_APPS } from "./contract-notification-seed"
import type { UserAccount } from "@/lib/auth"
import { filterCorpFacilityRecordsByRole } from "@/lib/data-scope"

export const ITEMS_PER_PAGE = 5

export const approvedApps = (() => {
  const fromApplications = applications.filter(
    (a) => a.statusType === "approved" && a.contractNumber !== "-"
  )
  const seenIds = new Set(fromApplications.map((a) => a.id))
  const seenApplicationNumbers = new Set(fromApplications.map((a) => a.applicationNumber))
  const extra = CONTRACT_NOTIFICATION_SEED_APPS.filter(
    (a) => !seenIds.has(a.id) && !seenApplicationNumbers.has(a.applicationNumber)
  )
  return [...fromApplications, ...extra]
})()

export const confirmedThisMonth = approvedApps.map((a, i) => ({
  ...a,
  confirmedDate: `2024-05-${String(10 + i).padStart(2, "0")}`,
}))

export type ContractNotificationFilters = {
  contractNumber: string
  contractStatus: string
  confirmedDate: string
  schoolName: string
  corporationName: string
  studentName: string
}

export const EMPTY_CONTRACT_FILTERS: ContractNotificationFilters = {
  contractNumber: "",
  contractStatus: "all",
  confirmedDate: "all",
  schoolName: "",
  corporationName: "",
  studentName: "",
}

export function corpFacilityLabel(app: { corporationName: string; facilityName: string }) {
  if (app.corporationName && app.facilityName && app.corporationName !== app.facilityName) {
    return `${app.corporationName} ${app.facilityName}`
  }
  return app.corporationName || app.facilityName
}

export function matchesContractFilters(
  app: {
    contractNumber: string
    corporationName: string
    facilityName: string
    studentName: string
    confirmedDate?: string
    school: { schoolName: string }
  },
  filters: ContractNotificationFilters
) {
  if (filters.contractNumber && !app.contractNumber.toLowerCase().includes(filters.contractNumber.toLowerCase())) {
    return false
  }
  if (
    filters.confirmedDate &&
    filters.confirmedDate !== "all" &&
    app.confirmedDate !== filters.confirmedDate
  ) {
    return false
  }
  if (
    filters.schoolName &&
    !app.school.schoolName.toLowerCase().includes(filters.schoolName.toLowerCase())
  ) {
    return false
  }
  if (filters.corporationName && !`${app.corporationName} ${app.facilityName}`.includes(filters.corporationName)) {
    return false
  }
  if (filters.studentName && !app.studentName.includes(filters.studentName)) {
    return false
  }
  return true
}

export function filterAppsByRole<T extends { corporationName: string; facilityName: string; school?: { schoolName: string } }>(
  apps: T[],
  user: UserAccount | null
): T[] {
  if (!user) return apps
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
    return apps.filter((a) => a.school?.schoolName === user.organization)
  }
  return apps
}

export { filterApplicationsByRole, filterCorpFacilityRecordsByRole } from "@/lib/data-scope"
