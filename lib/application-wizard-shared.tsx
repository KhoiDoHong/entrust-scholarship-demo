import { Label } from "@/components/ui/label"
import type { Application } from "@/lib/applications-data"
import type { UserAccount } from "@/lib/auth"
import { getCorporationsForSchool } from "@/lib/data-scope"
import {
  FACILITY_APPLICANTS,
  facilityApplicantLabel,
  SCHOOLS,
  type FacilityApplicantMaster,
  type SchoolMaster,
} from "@/lib/masters"

export const WIZARD_STEPS = [
  { num: 1, label: "申請者" },
  { num: 2, label: "学生" },
  { num: 3, label: "養成校使用欄" },
  { num: 4, label: "添付書類" },
  { num: 5, label: "確認" },
] as const

export const REQUIRED_DOCUMENTS = [
  {
    id: "id_card",
    title: "本人確認書類",
    description:
      "運転免許証、マイナンバーカード、パスポートなど（外国籍の方は在留カードをご提出ください）",
    supportedFormats: "PDF, PNG, JPG, GIF",
    required: true,
    sampleImage: "/samples/id-card-sample.jpg",
    sampleCaption:
      "例：運転免許証・マイナンバーカードなど。氏名・顔写真・生年月日が確認できるようにしてください。",
  },
  {
    id: "transcript",
    title: "成績証明書",
    description: "学校が発行した成績証明書",
    supportedFormats: "PDF, PNG, JPG, GIF",
    required: true,
    sampleImage: "/samples/transcript-sample.jpg",
    sampleCaption: "例：学校発行の成績証明書。学校の公印が押印されていることを確認してください。",
  },
] as const

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県",
  "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県",
  "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県",
  "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

export const NATIONALITIES = [
  "日本", "中国", "韓国", "台湾", "タイ", "ベトナム", "フィリピン", "マレーシア",
  "インドネシア", "シンガポール", "インド", "パキスタン", "バングラデシュ", "その他",
]

export type ApplicationFormData = {
  applicationDate: string
  userId: string
  contactName: string
  contactNameKana: string
  applicantPhone: string
  applicantEmail: string
  applicantEmailConfirm: string
  studentPostalCode: string
  studentPrefecture: string
  studentAddress: string
  studentLastName: string
  studentFirstName: string
  studentLastNameKana: string
  studentFirstNameKana: string
  nationality: string
  studentBirthDate: string
  studentGender: string
  studentPhone: string
  studentEmail: string
  enrollmentDate: string
  receptionDate: string
  schoolId: string
  associationMemberNumber: string
  receptionStaffName: string
  schoolPhone: string
  schoolEmail: string
  schoolEmailConfirm: string
  remarks: string
}

export type UploadedFileMap = Record<string, { name: string; size: string } | undefined>

export function getJapanTodayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

export function createEmptyFormData(options?: { useTodayDates?: boolean }): ApplicationFormData {
  const today = options?.useTodayDates ? getJapanTodayISO() : ""
  return {
    applicationDate: today,
    userId: "",
    contactName: "",
    contactNameKana: "",
    applicantPhone: "",
    applicantEmail: "",
    applicantEmailConfirm: "",
    studentPostalCode: "",
    studentPrefecture: "",
    studentAddress: "",
    studentLastName: "",
    studentFirstName: "",
    studentLastNameKana: "",
    studentFirstNameKana: "",
    nationality: "",
    studentBirthDate: "",
    studentGender: "",
    studentPhone: "",
    studentEmail: "",
    enrollmentDate: "",
    receptionDate: today,
    schoolId: "",
    associationMemberNumber: "",
    receptionStaffName: "",
    schoolPhone: "",
    schoolEmail: "",
    schoolEmailConfirm: "",
    remarks: "",
  }
}

function parseDemoDate(value: string): string {
  const full = value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (full) {
    const [, y, m, d] = full
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }
  const yearMonth = value.match(/(\d{4})年(\d{1,2})月$/)
  if (yearMonth) {
    const [, y, m] = yearMonth
    return `${y}-${m.padStart(2, "0")}-01`
  }
  return value
}

/** ISO / 和暦 → 入学日表示（年月日） */
export function formatEnrollmentDateDisplay(value: string): string {
  if (!value?.trim()) return "—"
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const [, y, m, d] = iso
    return `${y}年${Number(m)}月${Number(d)}日`
  }
  const yearMonthOnly = value.match(/^(\d{4})年(\d{1,2})月$/)
  if (yearMonthOnly) {
    const [, y, m] = yearMonthOnly
    return `${y}年${Number(m)}月1日`
  }
  return value
}

function findFacilityApplicant(applicant: Application["applicant"]) {
  return FACILITY_APPLICANTS.find(
    (f) =>
      (f.corporationName === applicant.corporationName &&
        f.facilityName === applicant.facilityName) ||
      f.userId === applicant.userId
  )
}

function parseGender(value: string): string {
  if (value === "男") return "male"
  if (value === "女") return "female"
  return value
}

export function mapApplicationToWizardState(app: Application): {
  formData: ApplicationFormData
  corporationId: string
  schoolId: string
  uploadedFiles: UploadedFileMap
} {
  const facility = findFacilityApplicant(app.applicant)
  const school = SCHOOLS.find(
    (s) =>
      s.schoolName === app.school.schoolName ||
      s.associationMemberNumber === app.school.kaiyokyoMemberNumber
  )

  const uploadedFiles: UploadedFileMap = {}
  app.documents.forEach((doc, index) => {
    const docId = index === 0 ? "id_card" : "transcript"
    if (doc.submitted) {
      uploadedFiles[docId] = { name: `${doc.name}.pdf`, size: "1.2 MB" }
    }
  })

  return {
    corporationId: facility?.corporationId ?? "",
    schoolId: school?.schoolId ?? "",
    uploadedFiles,
    formData: {
      applicationDate: parseDemoDate(app.applicant.applicationDate),
      userId: app.applicant.userId,
      contactName: app.applicant.contactName,
      contactNameKana: app.applicant.contactNameKana,
      applicantPhone: app.applicant.phone,
      applicantEmail: app.applicant.email,
      applicantEmailConfirm: app.applicant.email,
      studentPostalCode: app.student.postalCode,
      studentPrefecture: app.student.prefecture,
      studentAddress: app.student.address,
      studentLastName: app.student.lastName,
      studentFirstName: app.student.firstName,
      studentLastNameKana: app.student.lastNameKana,
      studentFirstNameKana: app.student.firstNameKana,
      nationality: app.student.nationality,
      studentBirthDate: parseDemoDate(app.student.birthDate),
      studentGender: parseGender(app.student.gender),
      studentPhone: app.student.phone,
      studentEmail: app.student.email,
      enrollmentDate: parseDemoDate(app.student.enrollmentDate),
      receptionDate: parseDemoDate(app.school.receptionDate),
      schoolId: school?.schoolId ?? "",
      associationMemberNumber: school?.associationMemberNumber ?? app.school.kaiyokyoMemberNumber,
      receptionStaffName: app.school.receptionStaffName,
      schoolPhone: app.school.phone,
      schoolEmail: app.school.email,
      schoolEmailConfirm: app.school.email,
      remarks: "",
    },
  }
}

export function FieldInlineError({ message }: { message?: string }) {
  return (
    <p className="min-h-5 flex-1 self-center text-sm leading-5 text-red-600">
      {message ?? ""}
    </p>
  )
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex items-start gap-3">
        <div className="shrink-0">{children}</div>
        <FieldInlineError message={error} />
      </div>
    </div>
  )
}

/** マスタ連動フィールド — 選択後にラベル表示（編集不可） */
export function WizardReadOnlyField({
  label,
  value,
}: {
  label: string
  value?: string
}) {
  const display = value?.trim() ? value : "—"
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <p className="text-sm text-gray-900">{display}</p>
    </div>
  )
}

export function SummaryItem({ label, value }: { label: string; value?: string }) {
  const display = value?.trim() ? value : "-"
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="ml-2 text-gray-900 break-words">{display}</span>
    </div>
  )
}

export function formatStudentGender(value: string): string {
  if (value === "male") return "男"
  if (value === "female") return "女"
  return ""
}

export function validateStep1(
  formData: ApplicationFormData,
  corporationId: string
): Record<string, string> {
  const e: Record<string, string> = {}
  if (!formData.applicationDate.trim()) e.applicationDate = "申込日（西暦）を入力してください。"
  if (!corporationId) e.corporationId = "法人名・施設名を入力してください。"
  if (!formData.contactName.trim()) e.contactName = "担当者名を入力してください。"
  if (!formData.contactNameKana.trim()) e.contactNameKana = "担当者名（カナ）を入力してください。"
  if (!formData.applicantPhone.trim()) e.applicantPhone = "電話番号（携帯推奨）を入力してください。"
  if (!formData.applicantEmail.trim()) e.applicantEmail = "申請者メールアドレスを取得できません。"
  return e
}

export function validateStep2(formData: ApplicationFormData): Record<string, string> {
  const e: Record<string, string> = {}
  if (!formData.studentPostalCode.trim()) e.studentPostalCode = "郵便番号を入力してください。"
  if (!formData.studentPrefecture) e.studentPrefecture = "住所（都道府県）を入力してください。"
  if (!formData.studentAddress.trim()) e.studentAddress = "住所（市区町村以降）を入力してください。"
  if (!formData.studentLastName.trim()) e.studentLastName = "氏名（姓）を入力してください。"
  if (!formData.studentFirstName.trim()) e.studentFirstName = "氏名（名）を入力してください。"
  if (!formData.studentLastNameKana.trim()) e.studentLastNameKana = "氏名カナ（姓）を入力してください。"
  if (!formData.studentFirstNameKana.trim()) e.studentFirstNameKana = "氏名カナ（名）を入力してください。"
  if (!formData.nationality) e.nationality = "国籍を入力してください。"
  if (!formData.studentBirthDate.trim()) e.studentBirthDate = "生年月日（西暦）を入力してください。"
  if (!formData.studentGender) e.studentGender = "性別を入力してください。"
  if (!formData.studentPhone.trim()) e.studentPhone = "携帯電話番号を入力してください。"
  if (!formData.studentEmail.trim()) e.studentEmail = "学生メールアドレスを入力してください。"
  if (!formData.enrollmentDate.trim()) e.enrollmentDate = "入学日・入学予定日（西暦）を入力してください。"
  return e
}

export function validateStep3(
  formData: ApplicationFormData,
  schoolId: string
): Record<string, string> {
  const e: Record<string, string> = {}
  if (!formData.receptionDate.trim()) e.receptionDate = "受付日（西暦）を入力してください。"
  if (!schoolId) e.schoolId = "養成校名を入力してください。"
  if (!formData.receptionStaffName.trim()) e.receptionStaffName = "受付担当者名を入力してください。"
  if (!formData.schoolPhone.trim()) e.schoolPhone = "電話番号を入力してください。"
  if (!formData.schoolEmail.trim()) e.schoolEmail = "養成校メールアドレスを取得できません。"
  return e
}

export function validateStep4(uploadedFiles: UploadedFileMap): Record<string, string> {
  const e: Record<string, string> = {}
  for (const doc of REQUIRED_DOCUMENTS) {
    if (!uploadedFiles[doc.id]) {
      e[`documents.${doc.id}`] = "ファイルを選択してください。"
    }
  }
  return e
}

/** 新規申請 / 申請内容修正 — 法人名・施設名（養成校は傘下法人のみ、entrust は全件） */
export function getWizardFacilityApplicants(
  user: UserAccount | null
): FacilityApplicantMaster[] {
  if (!user) return []
  if (user.role === "entrust") return FACILITY_APPLICANTS
  if (user.role === "school") {
    const corps = getCorporationsForSchool(user.organization)
    return FACILITY_APPLICANTS.filter((f) => corps.includes(f.corporationName))
  }
  return []
}

/** 新規申請 / 申請内容修正 — 養成校名（school は自校のみ、entrust は全件） */
export function getWizardSchools(user: UserAccount | null): SchoolMaster[] {
  if (!user) return []
  if (user.role === "entrust") return SCHOOLS
  if (user.role === "school") {
    return SCHOOLS.filter((s) => s.schoolName === user.organization)
  }
  return []
}

export { FACILITY_APPLICANTS, facilityApplicantLabel, SCHOOLS }
export type { FacilityApplicantMaster, SchoolMaster } from "@/lib/masters"
