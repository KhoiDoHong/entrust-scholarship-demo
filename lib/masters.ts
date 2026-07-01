/** Master data for MVP forms (mirrors GET /api/masters/* in basic design). */

export interface SchoolMaster {
  schoolId: string
  schoolName: string
  email: string
  associationMemberNumber: string
  receptionStaffName: string
  phone: string
}

export interface CorporationMaster {
  corporationId: string
  memberId: string
  corporationName: string
}

export const SCHOOLS: SchoolMaster[] = [
  {
    schoolId: "school-tokyo",
    schoolName: "東京介護福祉専門学校",
    email: "school@example.ac.jp",
    associationMemberNumber: "K-10101",
    receptionStaffName: "中村 洋子",
    phone: "03-1234-5678",
  },
  {
    schoolId: "school-osaka",
    schoolName: "大阪介護福祉専門学校",
    email: "school2@example.ac.jp",
    associationMemberNumber: "K-20201",
    receptionStaffName: "小林 健一",
    phone: "06-2345-6789",
  },
  {
    schoolId: "school-fukuoka",
    schoolName: "福岡介護福祉専門学校",
    email: "fukuoka@example.ac.jp",
    associationMemberNumber: "K-40105",
    receptionStaffName: "藤田 美穂",
    phone: "092-345-6789",
  },
]

/** 養成校と傘下法人の対応 — 詳細は `lib/data-scope.ts` */
export { SCHOOL_AFFILIATED_CORPORATIONS } from "@/lib/data-scope"

export function schoolOptionLabel(s: SchoolMaster): string {
  return `${s.associationMemberNumber}-${s.schoolName}`
}

export const CORPORATIONS: CorporationMaster[] = [
  { corporationId: "corp-kenkou", memberId: "M-1001", corporationName: "医療法人健康会" },
  { corporationId: "corp-aishin", memberId: "M-1002", corporationName: "社会福祉法人愛心" },
  { corporationId: "corp-sample", memberId: "M-1003", corporationName: "株式会社サンプル" },
  { corporationId: "corp-koumei", memberId: "M-1004", corporationName: "社会福祉法人光明" },
  { corporationId: "corp-seifu", memberId: "M-1005", corporationName: "医療法人清風会" },
]

export function corporationOptionLabel(c: CorporationMaster): string {
  return `${c.memberId}-${c.corporationName}`
}

/** Facility + applicant preset for new application step 1 (GET /api/masters/corporations + applicant profile). */
export interface FacilityApplicantMaster {
  corporationId: string
  userId: string
  corporationName: string
  facilityName: string
  contactName: string
  contactNameKana: string
  phone: string
  email: string
}

export const FACILITY_APPLICANTS: FacilityApplicantMaster[] = [
  {
    corporationId: "fac-kg01",
    userId: "KG01",
    corporationName: "テスト法人",
    facilityName: "テスト施設",
    contactName: "山田 太郎",
    contactNameKana: "ヤマダ タロウ",
    phone: "090-1001-0001",
    email: "test1@example.com",
  },
  {
    corporationId: "fac-kg02",
    userId: "KG02",
    corporationName: "サンプル法人",
    facilityName: "サンプル施設",
    contactName: "佐藤 花子",
    contactNameKana: "サトウ ハナコ",
    phone: "090-1002-0002",
    email: "sample2@example.com",
  },
  {
    corporationId: "fac-kg03",
    userId: "KG03",
    corporationName: "デモ法人",
    facilityName: "デモ施設",
    contactName: "鈴木 一郎",
    contactNameKana: "スズキ イチロウ",
    phone: "090-1003-0003",
    email: "demo3@example.com",
  },
  {
    corporationId: "fac-kg04",
    userId: "KG04",
    corporationName: "テスト2法人",
    facilityName: "テスト2施設",
    contactName: "田中 美咲",
    contactNameKana: "タナカ ミサキ",
    phone: "090-1004-0004",
    email: "test4@example.com",
  },
  {
    corporationId: "fac-kg05",
    userId: "KG05",
    corporationName: "スタンダード法人",
    facilityName: "スタンダード施設",
    contactName: "高橋 健太",
    contactNameKana: "タカハシ ケンタ",
    phone: "090-1005-0005",
    email: "standard5@example.com",
  },
  {
    corporationId: "fac-kenkou-center",
    userId: "KG06",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    contactName: "鈴木 一郎",
    contactNameKana: "スズキ イチロウ",
    phone: "090-1001-0001",
    email: "suzuki1@example.com",
  },
  {
    corporationId: "fac-aishin-home",
    userId: "KG07",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    contactName: "田中 次郎",
    contactNameKana: "タナカ ジロウ",
    phone: "090-2001-0001",
    email: "tanaka2@example.com",
  },
  {
    corporationId: "fac-sample-care",
    userId: "KG08",
    corporationName: "株式会社サンプル",
    facilityName: "サンプル介護施設",
    contactName: "佐藤 三郎",
    contactNameKana: "サトウ サブロウ",
    phone: "090-3001-0001",
    email: "sato3@example.com",
  },
  {
    corporationId: "fac-caresupport-tokyo",
    userId: "KG09",
    corporationName: "株式会社ケアサポート",
    facilityName: "ケアサポート東京",
    contactName: "高橋 四郎",
    contactNameKana: "タカハシ シロウ",
    phone: "090-4001-0001",
    email: "takahashi4@example.com",
  },
  {
    corporationId: "fac-koumei-center",
    userId: "KG10",
    corporationName: "社会福祉法人光明",
    facilityName: "光明ケアセンター",
    contactName: "小林 六郎",
    contactNameKana: "コバヤシ ロクロウ",
    phone: "090-4003-0001",
    email: "kobayashi6@example.com",
  },
  {
    corporationId: "fac-seifu-home",
    userId: "KG11",
    corporationName: "医療法人清風会",
    facilityName: "清風ケアホーム",
    contactName: "松本 八郎",
    contactNameKana: "マツモト ハチロウ",
    phone: "090-4005-0001",
    email: "matsumoto8@example.com",
  },
]

export function facilityApplicantLabel(f: FacilityApplicantMaster): string {
  return `${f.corporationName}\u3000${f.facilityName}`
}

export function findFacilityApplicantUserId(
  corporationName: string,
  facilityName: string
): string {
  const facility = FACILITY_APPLICANTS.find(
    (f) => f.corporationName === corporationName && f.facilityName === facilityName
  )
  if (!facility) {
    throw new Error(`Unknown facility applicant: ${corporationName} / ${facilityName}`)
  }
  return facility.userId
}
