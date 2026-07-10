import type { ConfirmedContract } from "@/lib/contracts-store"
import { corpFacilityLabel } from "@/lib/contract-notifications"
import { filterContractsByRole } from "@/lib/data-scope"

export { filterContractsByRole } from "@/lib/data-scope"

export const CONTRACT_LIST_ITEMS_PER_PAGE = 5

export type ContractListFilters = {
  contractNumber: string
  corporationName: string
  facilityName: string
  studentName: string
  contractYear: string
  status: string
}

export const EMPTY_CONTRACT_LIST_FILTERS: ContractListFilters = {
  contractNumber: "",
  corporationName: "",
  facilityName: "",
  studentName: "",
  contractYear: "all",
  status: "all",
}

export function applyContractListFilters(
  contracts: ConfirmedContract[],
  filters: ContractListFilters
): ConfirmedContract[] {
  return contracts.filter((c) => {
    if (c.status === "取り下げ") return false
    if (filters.contractNumber && !c.contractNumber.toLowerCase().includes(filters.contractNumber.toLowerCase())) {
      return false
    }
    if (filters.corporationName && !corpFacilityLabel(c).includes(filters.corporationName)) return false
    if (filters.facilityName && !c.facilityName.includes(filters.facilityName)) return false
    if (filters.studentName && !c.studentName.includes(filters.studentName)) return false
    if (filters.contractYear !== "all" && !c.confirmedDate.startsWith(filters.contractYear)) return false
    if (filters.status !== "all" && c.status !== filters.status) return false
    return true
  })
}

export function getContractYears(contracts: ConfirmedContract[]): string[] {
  const years = new Set<string>()
  contracts.forEach((c) => {
    const isoMatch = c.confirmedDate.match(/^(\d{4})-/)
    if (isoMatch) {
      years.add(isoMatch[1])
      return
    }
    const jpMatch = c.confirmedDate.match(/(\d{4})年/)
    if (jpMatch) years.add(jpMatch[1])
  })
  return Array.from(years).sort((a, b) => Number(b) - Number(a))
}

const REJECTED_STATUS = "弁済依頼差し戻し" as const

export function getContractRemarksDisplay(contract: ConfirmedContract): string {
  if (contract.status === REJECTED_STATUS) {
    return contract.rejectionComment?.trim() ?? ""
  }
  return ""
}

export function hasContractRemarks(contract: ConfirmedContract): boolean {
  return getContractRemarksDisplay(contract).length > 0
}

/** 完済完了報告 — 確定済み / 弁済依頼差し戻し */
export function isCompletionReportEnabled(contract: ConfirmedContract): boolean {
  return contract.status === "確定済み" || contract.status === "弁済依頼差し戻し"
}

/** 代位弁済依頼 — 確定済み / 弁済依頼差し戻し */
export function isSubrogationRequestEnabled(contract: ConfirmedContract): boolean {
  return contract.status === "確定済み" || contract.status === "弁済依頼差し戻し"
}
