import { FACILITY_APPLICANTS, SCHOOLS } from "@/lib/masters"
import {
  DEMO_SCHOOL,
  DEMO_SCHOOL_NAGOYA_RECEPTION,
} from "@/lib/data-scope"
import {
  APPLICATION_DOCUMENT_LABELS,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatusLabel,
} from "@/lib/application-status-styles"
import seedRecords from "@/lib/applications-seed.json"

export type StatusType =
  | "pending"
  | "reviewing"
  | "warning"
  | "approved"
  | "rejected"
  | "edited"

export interface Application {
  id: number
  applicationNumber: string
  contractNumber: string
  contractNumberLink?: boolean
  corporationName: string
  facilityName: string
  studentName: string
  status: string
  statusType: StatusType
  missingDocuments: string[]
  approvedDate?: string
  remarks?: string
  exchanges?: {
    createdAt: string
    createdByName: string
    kind?: "deficiency" | "comment"
    comment: string
  }[]
  deficiencyMessage?: string
  applicant: {
    applicationDate: string
    userId: string
    corporationName: string
    facilityName: string
    contactName: string
    contactNameKana: string
    phone: string
    email: string
  }
  student: {
    postalCode: string
    prefecture: string
    address: string
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    nationality: string
    birthDate: string
    gender: string
    phone: string
    email: string
    enrollmentDate: string
  }
  school: {
    receptionDate: string
    kaiyokyoMemberNumber: string
    schoolName: string
    receptionStaffName: string
    email: string
    phone: string
  }
  documents: {
    name: string
    required: boolean
    submitted: boolean
    fileName?: string
  }[]
}

const ST: Record<string, ApplicationStatusLabel> = {
  reviewing: APPLICATION_STATUS_LABELS[0],
  warning: APPLICATION_STATUS_LABELS[1],
  edited: APPLICATION_STATUS_LABELS[2],
  approved: APPLICATION_STATUS_LABELS[3],
  rejected: APPLICATION_STATUS_LABELS[4],
}

const DOC_APP = APPLICATION_DOCUMENT_LABELS.applicationForm
const DOC_ID = APPLICATION_DOCUMENT_LABELS.idDocument

export function demoDocumentFileName(docLabel: string): string {
  if (docLabel === DOC_ID) return "ID.pdf"
  if (docLabel === DOC_APP) return "APP.pdf"
  return `${docLabel}.pdf`
}

const DEFAULTS = {
  prefecture: "\u6771\u4EAC\u90FD",
  address: "\u5343\u4EE3\u7530\u533A\u4E38\u306E\u51851-1-1",
  nationality: "\u65E5\u672C",
  birthDate: "2002\u5E744\u67081\u65E5",
  gender: "\u5973",
  enrollmentDate: "2024\u5E744\u67081\u65E5",
} as const

function fac(userId: string) {
  const f = FACILITY_APPLICANTS.find((x) => x.userId === userId)
  if (!f) throw new Error(`Unknown facility userId: ${userId}`)
  return f
}

const TOKYO_META = SCHOOLS.find((s) => s.schoolId === "school-tokyo")!
const FUKUOKA_META = SCHOOLS.find((s) => s.schoolId === "school-fukuoka")!
const NAGOYA_META = {
  schoolName: DEMO_SCHOOL.NAGOYA,
  ...DEMO_SCHOOL_NAGOYA_RECEPTION,
}

type SchoolKey = "tokyo" | "nagoya" | "fukuoka"

function schoolBlock(
  key: SchoolKey,
  receptionDate: string,
  kaiyokyoMemberNumber: string
) {
  const meta =
    key === "tokyo"
      ? TOKYO_META
      : key === "fukuoka"
        ? FUKUOKA_META
        : NAGOYA_META
  return {
    receptionDate,
    kaiyokyoMemberNumber,
    schoolName: meta.schoolName,
    receptionStaffName: meta.receptionStaffName,
    email: meta.email,
    phone: meta.phone,
  }
}

type StudentSeed = {
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  postalCode?: string
  prefecture?: string
  address?: string
  birthDate?: string
  gender?: string
  phone?: string
  email?: string
}

type ApplicationSeed = {
  id: number
  applicationNumber: string
  contractNumber: string
  contractNumberLink?: boolean
  userId: string
  applicationDate: string
  schoolKey: SchoolKey
  receptionDate: string
  kaiyokyoMemberNumber: string
  studentName: string
  student: StudentSeed
  statusKey: keyof typeof ST
  statusType: StatusType
  missingDocuments?: ("app" | "id")[]
  approvedDate?: string
  remarks?: string
  deficiencyMessage?: string
  exchanges?: Application["exchanges"]
  docs?: { appSubmitted?: boolean; idSubmitted?: boolean }
}

function makeApp(opts: ApplicationSeed): Application {
  const f = fac(opts.userId)
  const st = opts.student
  const status = ST[opts.statusKey]
  const appDoc = opts.docs?.appSubmitted !== false
  const idDoc = opts.docs?.idSubmitted !== false
  const missingDocuments = (opts.missingDocuments ?? []).map((d) =>
    d === "app" ? DOC_APP : DOC_ID
  )
  const deficiencyMessage =
    opts.deficiencyMessage?.trim() ||
    (opts.statusType === "warning" && missingDocuments.length > 0
      ? `${missingDocuments.join("\u3001")}\u306E\u63D0\u51FA\u304C\u5FC5\u8981\u3067\u3059\u3002`
      : undefined)
  return {
    id: opts.id,
    applicationNumber: opts.applicationNumber,
    contractNumber: opts.contractNumber,
    contractNumberLink: opts.contractNumberLink,
    corporationName: f.corporationName,
    facilityName: f.facilityName,
    studentName: opts.studentName,
    status,
    statusType: opts.statusType,
    missingDocuments,
    approvedDate: opts.approvedDate,
    remarks:
      opts.statusType === "edited"
        ? opts.remarks?.trim() ||
          opts.deficiencyMessage?.trim() ||
          "\u4FEE\u6B63\u5B8C\u4E86"
        : opts.remarks,
    deficiencyMessage,
    exchanges: opts.exchanges,
    applicant: {
      applicationDate: opts.applicationDate,
      userId: f.userId,
      corporationName: f.corporationName,
      facilityName: f.facilityName,
      contactName: f.contactName,
      contactNameKana: f.contactNameKana,
      phone: f.phone,
      email: f.email,
    },
    student: {
      postalCode: st.postalCode ?? "100-0001",
      prefecture: st.prefecture ?? DEFAULTS.prefecture,
      address: st.address ?? DEFAULTS.address,
      lastName: st.lastName,
      firstName: st.firstName,
      lastNameKana: st.lastNameKana,
      firstNameKana: st.firstNameKana,
      nationality: DEFAULTS.nationality,
      birthDate: st.birthDate ?? DEFAULTS.birthDate,
      gender: st.gender ?? DEFAULTS.gender,
      phone: st.phone ?? "090-0000-0000",
      email: st.email ?? "student@example.com",
      enrollmentDate: DEFAULTS.enrollmentDate,
    },
    school: schoolBlock(
      opts.schoolKey,
      opts.receptionDate,
      opts.kaiyokyoMemberNumber
    ),
    documents: [
      {
        name: DOC_APP,
        required: true,
        submitted: appDoc,
        fileName: appDoc ? demoDocumentFileName(DOC_APP) : undefined,
      },
      {
        name: DOC_ID,
        required: true,
        submitted: idDoc,
        fileName: idDoc ? demoDocumentFileName(DOC_ID) : undefined,
      },
    ],
  }
}

export const initialApplications: Application[] = (
  seedRecords as ApplicationSeed[]
).map(makeApp)

/** @deprecated Prefer getApplications() from applications-store for live demo state */
export const applications = initialApplications
