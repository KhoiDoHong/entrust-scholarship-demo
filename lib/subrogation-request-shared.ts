import type { ConfirmedContract, ContractStatus } from "@/lib/contracts-store"

export type SubrogationUploadedFile = { name: string; size: string }

/** Statuses where 契約詳細 must include 弁済依頼 section */
export const SUBROGATION_DETAIL_STATUSES: ContractStatus[] = [
  "代位弁済依頼中",
  "弁済依頼差し戻し",
  "弁済依頼確認済み",
  "弁済依頼承認済み",
]

export function isSubrogationDetailStatus(status: string): boolean {
  return SUBROGATION_DETAIL_STATUSES.includes(status as ContractStatus)
}

export function getSubrogationRequestForDisplay(contract: ConfirmedContract) {
  if (contract.subrogationRequest) return contract.subrogationRequest
  const nameKey = contract.studentName.replace(/\s/g, "")
  return {
    repaymentRequestAmount: "1,200,000",
    repaymentInvoiceFile: `返済請求書_${nameKey}.pdf`,
    privacyConsentFile: `個人情報利用同意書_${nameKey}.pdf`,
  }
}

export const SUBROGATION_REQUEST_DOCUMENTS = [
  {
    id: "repayment_invoice",
    title: "貸付金返済の請求書",
    description: "貸付金の返済を請求する書類をアップロードしてください。",
    supportedFormats: "PDF, PNG, JPG, GIF",
    sampleImage: "/samples/transcript-sample.jpg",
    sampleCaption:
      "例：貸付金返済の請求書。金額・請求先・期限が明記されていることを確認してください。",
  },
  {
    id: "privacy_consent",
    title: "個人情報利用の同意書",
    description: "個人情報の利用に関する同意書をアップロードしてください。",
    supportedFormats: "PDF, PNG, JPG, GIF",
    sampleImage: "/samples/id-card-sample.jpg",
    sampleCaption:
      "例：個人情報利用の同意書。署名・日付が記載されていることを確認してください。",
  },
] as const

export type SubrogationFileMap = Record<
  (typeof SUBROGATION_REQUEST_DOCUMENTS)[number]["id"],
  SubrogationUploadedFile | undefined
>

export function createEmptySubrogationFiles(): SubrogationFileMap {
  return {
    repayment_invoice: undefined,
    privacy_consent: undefined,
  }
}

export function validateSubrogationRequest(
  repaymentRequestAmount: string,
  files: SubrogationFileMap
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!repaymentRequestAmount.trim()) {
    errors.repaymentRequestAmount = "返還請求金額を入力してください。"
  } else if (Number(repaymentRequestAmount) <= 0) {
    errors.repaymentRequestAmount = "返還請求金額は0より大きい値を入力してください。"
  }
  for (const doc of SUBROGATION_REQUEST_DOCUMENTS) {
    if (!files[doc.id]) {
      errors[`documents.${doc.id}`] = "ファイルを選択してください。"
    }
  }
  return errors
}

export function demoSubrogationUpload(): SubrogationUploadedFile {
  return { name: `uploaded_file_${Date.now()}.pdf`, size: "1.2 MB" }
}
