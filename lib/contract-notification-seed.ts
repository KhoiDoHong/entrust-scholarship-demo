import type { Application } from "@/lib/applications-data"
import { findFacilityApplicantUserId } from "@/lib/masters"
import { toISODateString } from "@/lib/utils"

type ApprovedSeed = {
  id: number
  applicationNumber: string
  contractNumber: string
  corporationName: string
  facilityName: string
  studentName: string
  approvedDate: string
  schoolName: string
  kaiyokyoMemberNumber: string
}

function makeApprovedApp(seed: ApprovedSeed): Application {
  const [lastName, firstName] = seed.studentName.split(" ")
  const approvedDate = toISODateString(seed.approvedDate)
  return {
    id: seed.id,
    applicationNumber: seed.applicationNumber,
    contractNumber: seed.contractNumber,
    contractNumberLink: true,
    corporationName: seed.corporationName,
    facilityName: seed.facilityName,
    studentName: seed.studentName,
    status: "承認",
    statusType: "approved",
    missingDocuments: [],
    approvedDate,
    applicant: {
      applicationDate: approvedDate,
      userId: findFacilityApplicantUserId(seed.corporationName, seed.facilityName),
      corporationName: seed.corporationName,
      facilityName: seed.facilityName,
      contactName: "担当 太郎",
      contactNameKana: "タントウ タロウ",
      phone: "03-0000-0000",
      email: `contact${seed.id}@example.com`,
    },
    student: {
      postalCode: "100-0001",
      prefecture: "東京都",
      address: "千代田区1-1-1",
      lastName: lastName ?? seed.studentName,
      firstName: firstName ?? "",
      lastNameKana: "セイ",
      firstNameKana: "メイ",
      nationality: "日本",
      birthDate: "2002-01-01",
      gender: "女",
      phone: "090-0000-0000",
      email: `student${seed.id}@example.com`,
      enrollmentDate: "2024-04-01",
    },
    school: {
      receptionDate: approvedDate,
      kaiyokyoMemberNumber: seed.kaiyokyoMemberNumber,
      schoolName: seed.schoolName,
      receptionStaffName: "受付 担当",
      email: "school@example.ac.jp",
      phone: "03-1001-0001",
    },
    documents: [
      { name: "本人確認書類", required: true, submitted: true },
      { name: "成績証明書", required: true, submitted: true },
    ],
  }
}

/** Extra approved contracts for 契約確定通知 / 契約キャンセル一覧 pagination demos. */
export const CONTRACT_NOTIFICATION_SEED_APPS: Application[] = [
  makeApprovedApp({
    id: 23,
    applicationNumber: "ENT-2024-00501",
    contractNumber: "CON-2024-00501",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    studentName: "山本 陽子",
    approvedDate: "2024年5月20日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-10501",
  }),
  makeApprovedApp({
    id: 24,
    applicationNumber: "ENT-2024-00502",
    contractNumber: "CON-2024-00502",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    studentName: "石井 健",
    approvedDate: "2024年5月21日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-10502",
  }),
  makeApprovedApp({
    id: 25,
    applicationNumber: "ENT-2024-00503",
    contractNumber: "CON-2024-00503",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    studentName: "清水 美香",
    approvedDate: "2024年5月22日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-20501",
  }),
  makeApprovedApp({
    id: 26,
    applicationNumber: "ENT-2024-00504",
    contractNumber: "CON-2024-00504",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    studentName: "森 大樹",
    approvedDate: "2024年5月23日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-20502",
  }),
  makeApprovedApp({
    id: 27,
    applicationNumber: "ENT-2024-00505",
    contractNumber: "CON-2024-00505",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    studentName: "池田 真由",
    approvedDate: "2024年5月24日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-10503",
  }),
  makeApprovedApp({
    id: 28,
    applicationNumber: "ENT-2024-00506",
    contractNumber: "CON-2024-00506",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    studentName: "橋本 翔",
    approvedDate: "2024年5月25日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-20503",
  }),
  makeApprovedApp({
    id: 29,
    applicationNumber: "ENT-2024-00507",
    contractNumber: "CON-2024-00507",
    corporationName: "株式会社サンプル",
    facilityName: "サンプル介護施設",
    studentName: "岡田 優子",
    approvedDate: "2024年5月26日",
    schoolName: "名古屋介護福祉専門学校",
    kaiyokyoMemberNumber: "K-30501",
  }),
  makeApprovedApp({
    id: 30,
    applicationNumber: "ENT-2024-00508",
    contractNumber: "CON-2024-00508",
    corporationName: "社会福祉法人光明",
    facilityName: "光明ケアセンター",
    studentName: "藤井 蓮",
    approvedDate: "2024年5月27日",
    schoolName: "福岡介護福祉専門学校",
    kaiyokyoMemberNumber: "K-40501",
  }),
  makeApprovedApp({
    id: 31,
    applicationNumber: "ENT-2024-00509",
    contractNumber: "CON-2024-00509",
    corporationName: "株式会社ケアサポート",
    facilityName: "ケアサポート東京",
    studentName: "西村 彩",
    approvedDate: "2024年5月28日",
    schoolName: "東京介護福祉専門学校",
    kaiyokyoMemberNumber: "K-40502",
  }),
  makeApprovedApp({
    id: 32,
    applicationNumber: "ENT-2024-00510",
    contractNumber: "CON-2024-00510",
    corporationName: "医療法人清風会",
    facilityName: "清風ケアホーム",
    studentName: "原田 陸",
    approvedDate: "2024年5月29日",
    schoolName: "福岡介護福祉専門学校",
    kaiyokyoMemberNumber: "K-40503",
  }),
  makeApprovedApp({
    id: 33,
    applicationNumber: "ENT-2024-00511",
    contractNumber: "CON-2024-00511",
    corporationName: "株式会社サンプル",
    facilityName: "サンプル介護施設",
    studentName: "三浦 奈々",
    approvedDate: "2024年5月30日",
    schoolName: "名古屋介護福祉専門学校",
    kaiyokyoMemberNumber: "K-30502",
  }),
  makeApprovedApp({
    id: 34,
    applicationNumber: "ENT-2024-00512",
    contractNumber: "CON-2024-00512",
    corporationName: "社会福祉法人光明",
    facilityName: "光明ケアセンター",
    studentName: "村上 海斗",
    approvedDate: "2024年5月31日",
    schoolName: "福岡介護福祉専門学校",
    kaiyokyoMemberNumber: "K-40504",
  }),
]
