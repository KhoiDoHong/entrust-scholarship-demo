import { FACILITY_APPLICANTS, facilityApplicantLabel } from "@/lib/masters"
import type { UserAccount } from "@/lib/auth"
import { filterCorpFacilityRecordsByRole } from "@/lib/data-scope"

export const CORPORATION_MASTER_ITEMS_PER_PAGE = 5

export interface CorporationMasterRecord {
  id: string
  userId: string
  corporationFacilityName: string
  corporationName: string
  facilityName: string
  postalCode: string
  prefecture: string
  address: string
  phone: string
  email: string
  contactName: string
  contactNameKana: string
  contactDepartment: string
  contactPhone: string
  contactEmail: string
  bankName: string
  bankCode: string
  branchName: string
  branchCode: string
  accountType: string
  accountNumber: string
  accountHolder: string
  accountHolderKana: string
}

export type CorporationMasterFilters = {
  userId: string
  corporationFacilityName: string
  contactName: string
  contactDepartment: string
  contactEmail: string
}

export const EMPTY_CORPORATION_MASTER_FILTERS: CorporationMasterFilters = {
  userId: "",
  corporationFacilityName: "",
  contactName: "",
  contactDepartment: "",
  contactEmail: "",
}

const DEMO_CONTACT_DEPARTMENTS = [
  "施設長",
  "管理部",
  "総務部",
  "介護部",
  "事務部",
  "経理部",
]

const DEMO_POSTAL_CODES = ["100-0001", "530-0001", "810-0001", "460-0001", "980-0001"]
const DEMO_PREFECTURES = ["東京都", "大阪府", "福岡県", "愛知県", "宮城県"]
const DEMO_ADDRESSES = [
  "千代田区千代田1-1-1",
  "北区梅田2-2-2",
  "博多区博多駅前3-3-3",
  "中区栄4-4-4",
  "青葉区一番町5-5-5",
]

const DEMO_BANKS = [
  { name: "みずほ銀行", code: "0001", branch: "東京営業部", branchCode: "001" },
  { name: "三菱UFJ銀行", code: "0005", branch: "大阪支店", branchCode: "102" },
  { name: "三井住友銀行", code: "0009", branch: "福岡支店", branchCode: "203" },
  { name: "りそな銀行", code: "0010", branch: "名古屋支店", branchCode: "304" },
  { name: "ゆうちょ銀行", code: "9900", branch: "〇一八店", branchCode: "018" },
]

const DEMO_ACCOUNT_TYPES = ["普通", "当座", "普通", "普通", "当座"]

export const CORPORATION_MASTER_RECORDS: CorporationMasterRecord[] = FACILITY_APPLICANTS.map(
  (f, i) => {
    const bank = DEMO_BANKS[i % DEMO_BANKS.length]
    const accountSuffix = String(1000000 + i * 111111).slice(-7)
    return {
      id: f.corporationId,
      userId: f.userId,
      corporationFacilityName: facilityApplicantLabel(f),
      corporationName: f.corporationName,
      facilityName: f.facilityName,
      postalCode: DEMO_POSTAL_CODES[i % DEMO_POSTAL_CODES.length],
      prefecture: DEMO_PREFECTURES[i % DEMO_PREFECTURES.length],
      address: DEMO_ADDRESSES[i % DEMO_ADDRESSES.length],
      phone: f.phone,
      email: f.email,
      contactName: f.contactName,
      contactNameKana: f.contactNameKana,
      contactDepartment: DEMO_CONTACT_DEPARTMENTS[i % DEMO_CONTACT_DEPARTMENTS.length],
      contactPhone: f.phone,
      contactEmail: f.email,
      bankName: bank.name,
      bankCode: bank.code,
      branchName: bank.branch,
      branchCode: bank.branchCode,
      accountType: DEMO_ACCOUNT_TYPES[i % DEMO_ACCOUNT_TYPES.length],
      accountNumber: accountSuffix,
      accountHolder: f.contactName.replace(/\s/g, ""),
      accountHolderKana: f.contactNameKana.replace(/\s/g, ""),
    }
  }
)

export function findCorporationMasterForContract(
  corporationName: string,
  facilityName: string
): CorporationMasterRecord | undefined {
  return CORPORATION_MASTER_RECORDS.find(
    (r) => r.corporationName === corporationName && r.facilityName === facilityName
  )
}

export function filterCorporationMasterByRole(
  records: CorporationMasterRecord[],
  user: UserAccount | null
): CorporationMasterRecord[] {
  return filterCorpFacilityRecordsByRole(records, user)
}

export function applyCorporationMasterFilters(
  records: CorporationMasterRecord[],
  filters: CorporationMasterFilters
): CorporationMasterRecord[] {
  return records.filter((r) => {
    if (filters.userId && !r.userId.toLowerCase().includes(filters.userId.toLowerCase())) {
      return false
    }
    if (
      filters.corporationFacilityName &&
      !r.corporationFacilityName.includes(filters.corporationFacilityName)
    ) {
      return false
    }
    if (filters.contactName && !r.contactName.includes(filters.contactName)) return false
    if (
      filters.contactDepartment &&
      !r.contactDepartment.includes(filters.contactDepartment)
    ) {
      return false
    }
    if (
      filters.contactEmail &&
      !r.contactEmail.toLowerCase().includes(filters.contactEmail.toLowerCase())
    ) {
      return false
    }
    return true
  })
}
