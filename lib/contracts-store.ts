// Shared in-memory store for confirmed contracts (simulates backend state)
// In a real app this would be persisted to a database

import { approvedApps, confirmedThisMonth } from "@/lib/contract-notifications"
import { CONTRACT_NOTIFICATION_SEED_CANCELLED_IDS } from "@/lib/contract-notification-constants"

export type ContractStatus =
  | "キャンセル"
  | "確定済み"
  | "代位弁済依頼中"
  | "弁済依頼確認済み"
  | "弁済依頼承認済み"
  | "弁済依頼差し戻し"
  | "取り下げ"
  | "解約"

export interface ConfirmedContract {
  id: number
  applicationNumber: string
  contractNumber: string
  corporationName: string
  facilityName: string
  studentName: string
  approvedDate?: string
  confirmedDate: string
  status: ContractStatus
  withdrawnDate?: string
  jobcan?: string
  subrogationRequest?: {
    repaymentRequestAmount: string
    repaymentInvoiceFile?: string
    privacyConsentFile?: string
  }
  /** 弁済依頼差し戻し時のコメント（備考欄表示） */
  rejectionComment?: string
  /** 入学日・入学予定日（契約者情報変更で更新可） */
  enrollmentDate?: string
}

export interface PriorNotice {
  text: string
  date: string
}

// Module-level store — persists across renders within a session
let _confirmedContracts: ConfirmedContract[] = [
  {
    id: 101,
    applicationNumber: "ENT-2024-00101",
    contractNumber: "CON-2024-00101",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    studentName: "鈴木 大輝",
    confirmedDate: "2024年5月10日",
    status: "確定済み",
    jobcan: "JC-2024-0101",
  },
  {
    id: 103,
    applicationNumber: "ENT-2024-00301",
    contractNumber: "CON-2024-00301",
    corporationName: "株式会社サンプル",
    facilityName: "サンプル介護施設",
    studentName: "佐藤 美咲",
    confirmedDate: "2024年4月15日",
    status: "解約",
  },
  {
    id: 104,
    applicationNumber: "ENT-2024-00401",
    contractNumber: "CON-2024-00401",
    corporationName: "社会福祉法人光明",
    facilityName: "光明ケアセンター",
    studentName: "小林 由美",
    confirmedDate: "2024年4月18日",
    status: "代位弁済依頼中",
    jobcan: "JC-2024-0401",
    subrogationRequest: {
      repaymentRequestAmount: "1,500,000",
      repaymentInvoiceFile: "返済請求書_小林由美.pdf",
      privacyConsentFile: "個人情報利用同意書_小林由美.pdf",
    },
  },
  {
    id: 105,
    applicationNumber: "ENT-2024-00102",
    contractNumber: "CON-2024-00102",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    studentName: "鈴木 花子",
    confirmedDate: "2024年3月5日",
    status: "代位弁済依頼中",
    jobcan: "JC-2024-0102",
    subrogationRequest: {
      repaymentRequestAmount: "980,000",
      repaymentInvoiceFile: "返済請求書_鈴木花子.pdf",
      privacyConsentFile: "個人情報利用同意書_鈴木花子.pdf",
    },
  },
  {
    id: 106,
    applicationNumber: "ENT-2024-00202",
    contractNumber: "CON-2024-00202",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    studentName: "田中 桃子",
    confirmedDate: "2024年3月8日",
    status: "解約",
  },
  {
    id: 107,
    applicationNumber: "ENT-2024-00501",
    contractNumber: "CON-2024-00501",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    studentName: "山田 一郎",
    confirmedDate: "2024年2月20日",
    status: "弁済依頼承認済み",
    subrogationRequest: {
      repaymentRequestAmount: "2,100,000",
      repaymentInvoiceFile: "返済請求書_山田一郎.pdf",
      privacyConsentFile: "個人情報利用同意書_山田一郎.pdf",
    },
  },
  {
    id: 108,
    applicationNumber: "ENT-2024-00601",
    contractNumber: "CON-2024-00601",
    corporationName: "株式会社サンプル",
    facilityName: "サンプル介護施設",
    studentName: "伊藤 次郎",
    confirmedDate: "2024年2月25日",
    status: "確定済み",
    jobcan: "JC-2024-0601",
  },
  {
    id: 109,
    applicationNumber: "ENT-2024-00701",
    contractNumber: "CON-2024-00701",
    corporationName: "社会福祉法人光明",
    facilityName: "光明ケアセンター",
    studentName: "渡辺 三郎",
    confirmedDate: "2024年1月10日",
    status: "弁済依頼確認済み",
    subrogationRequest: {
      repaymentRequestAmount: "1,750,000",
      repaymentInvoiceFile: "返済請求書_渡辺三郎.pdf",
      privacyConsentFile: "個人情報利用同意書_渡辺三郎.pdf",
    },
  },
  {
    id: 110,
    applicationNumber: "ENT-2024-00801",
    contractNumber: "CON-2024-00801",
    corporationName: "医療法人健康会",
    facilityName: "健康介護センター",
    studentName: "中村 四郎",
    confirmedDate: "2024年1月15日",
    status: "取り下げ",
    withdrawnDate: "2024年2月1日",
  },
  {
    id: 111,
    applicationNumber: "ENT-2023-00901",
    contractNumber: "CON-2023-00901",
    corporationName: "社会福祉法人愛心",
    facilityName: "愛心ケアホーム",
    studentName: "加藤 五郎",
    confirmedDate: "2023年11月20日",
    status: "弁済依頼差し戻し",
    jobcan: "JC-2023-0901",
    rejectionComment: "返済請求書の金額記載に誤りがあります。修正のうえ再提出してください。",
    subrogationRequest: {
      repaymentRequestAmount: "1,350,000",
      repaymentInvoiceFile: "返済請求書_加藤五郎.pdf",
      privacyConsentFile: "個人情報利用同意書_加藤五郎.pdf",
    },
  },
  {
    id: 112,
    applicationNumber: "ENT-2023-01001",
    contractNumber: "CON-2023-01001",
    corporationName: "株式会社サンプル",
    facilityName: "サンプル介護施設",
    studentName: "松本 六郎",
    confirmedDate: "2023年10月5日",
    status: "確定済み",
    jobcan: "JC-2023-1001",
  },
  {
    id: 113,
    applicationNumber: "ENT-2023-01101",
    contractNumber: "CON-2023-01101",
    corporationName: "社会福祉法人光明",
    facilityName: "光明ケアセンター",
    studentName: "井上 七子",
    confirmedDate: "2023年9月18日",
    status: "解約",
  },
]

/** 契約事前通知 — SCR-019 送信分（SCR-015 / 事前通知対象で表示） */
let _priorNotices: Record<number, PriorNotice[]> = {
  101: [
    {
      date: "2024年4月20日",
      text: "契約者の勤務時間が変更されました。詳細は別途書類で提出予定です。",
    },
    {
      date: "2024年5月12日",
      text: "契約者の就業先が変更されました。新施設：健康介護センター（同一法人内異動）。",
    },
  ],
  107: [
    {
      date: "2024年2月22日",
      text: "契約者が自己都合により退職する見込みです。返還スケジュールの確認をお願いします。",
    },
  ],
  108: [
    {
      date: "2024年3月1日",
      text: "契約者の連絡先（携帯電話番号）が変更されました。",
    },
  ],
  112: [
    {
      date: "2023年10月10日",
      text: "契約者が転居しました。新住所は申請書類にて別途提出予定です。",
    },
  ],
  111: [
    {
      date: "2023年12月5日",
      text: "契約者の勤務先施設が異動となりました。新施設：愛心ケアホーム（同一法人内）。",
    },
    {
      date: "2024年1月8日",
      text: "契約者の就労時間が短時間勤務に変更されました。代位弁済の検討にあたりご確認をお願いします。",
    },
  ],
}

export function getPriorNotices(contractId: number): PriorNotice[] {
  return _priorNotices[contractId] ?? []
}

/** 一覧の通知内容列 — 最新1件のみ */
export function getLatestPriorNotice(contractId: number): PriorNotice | undefined {
  const notices = getPriorNotices(contractId)
  return notices.length > 0 ? notices[notices.length - 1] : undefined
}

export function hasPriorNotices(contractId: number): boolean {
  return getPriorNotices(contractId).length > 0
}

export function addPriorNotice(contractId: number, text: string): void {
  const date = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  _priorNotices = {
    ..._priorNotices,
    [contractId]: [...(_priorNotices[contractId] ?? []), { text, date }],
  }
}

export function isPriorNotificationTarget(contract: ConfirmedContract): boolean {
  return (
    (contract.status === "確定済み" || contract.status === "弁済依頼承認済み") &&
    hasPriorNotices(contract.id)
  )
}

export function getConfirmedContracts(): ConfirmedContract[] {
  return _confirmedContracts
}

const _acknowledgedWorkflowIds: Record<string, number[]> = {}

export function acknowledgeWorkflowTargets(workflow: string, ids: number[]): void {
  _acknowledgedWorkflowIds[workflow] = [
    ...new Set([...(_acknowledgedWorkflowIds[workflow] ?? []), ...ids]),
  ]
}

export function isWorkflowTargetAcknowledged(workflow: string, id: number): boolean {
  return (_acknowledgedWorkflowIds[workflow] ?? []).includes(id)
}

export function addConfirmedContracts(contracts: ConfirmedContract[]): void {
  contracts.forEach((c) => {
    if (!_confirmedContracts.find((x) => x.id === c.id)) {
      _confirmedContracts.push({ ...c, status: "確定済み" })
    }
  })
}

export function updateContract(id: number, patch: Partial<ConfirmedContract>): void {
  _confirmedContracts = _confirmedContracts.map((c) =>
    c.id === id ? { ...c, ...patch } : c
  )
}

export function withdrawContracts(ids: number[]): void {
  const today = new Date()
  const withdrawnDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  _confirmedContracts = _confirmedContracts.map((c) =>
    ids.includes(c.id)
      ? { ...c, status: "取り下げ", withdrawnDate }
      : c
  )
}

// ── Contract notification workflow state (shared across notification pages) ──

let _pendingIds: number[] = [...approvedApps.map((a) => a.id)]
let _confirmedPendingIds: number[] = []
let _withdrawnPendingIds: number[] = [9]
let _cancelledIds: number[] = [...CONTRACT_NOTIFICATION_SEED_CANCELLED_IDS]
let _confirmedThisMonthIds: number[] = [...confirmedThisMonth.map((a) => a.id)]

type NotificationListener = () => void
const _listeners = new Set<NotificationListener>()

function notifyListeners() {
  _listeners.forEach((fn) => fn())
}

export function subscribeContractNotifications(listener: NotificationListener): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

export function getContractNotificationState() {
  return {
    pendingIds: [..._pendingIds],
    confirmedPendingIds: [..._confirmedPendingIds],
    withdrawnPendingIds: [..._withdrawnPendingIds],
    cancelledIds: [..._cancelledIds],
    confirmedThisMonthIds: [..._confirmedThisMonthIds],
  }
}

export function confirmPendingContracts(ids: number[]): void {
  const today = new Date()
  const confirmedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  const toConfirm = approvedApps
    .filter((a) => ids.includes(a.id))
    .map((a) => ({
      id: a.id,
      applicationNumber: a.applicationNumber,
      contractNumber: a.contractNumber,
      corporationName: a.corporationName,
      facilityName: a.facilityName,
      studentName: a.studentName,
      approvedDate: a.approvedDate,
      confirmedDate,
      status: "確定済み" as const,
    }))
  addConfirmedContracts(toConfirm)
  _confirmedPendingIds = [...new Set([..._confirmedPendingIds, ...ids])]
  _confirmedThisMonthIds = [...new Set([..._confirmedThisMonthIds, ...ids])]
  _withdrawnPendingIds = _withdrawnPendingIds.filter((id) => !ids.includes(id))
  notifyListeners()
}

export function cancelPendingContracts(ids: number[]): void {
  _cancelledIds = [...new Set([..._cancelledIds, ...ids])]
  _withdrawnPendingIds = _withdrawnPendingIds.filter((id) => !ids.includes(id))
  notifyListeners()
}

export function withdrawConfirmedThisMonth(ids: number[]): void {
  withdrawContracts(ids)
  _withdrawnPendingIds = [...new Set([..._withdrawnPendingIds, ...ids])]
  _confirmedThisMonthIds = _confirmedThisMonthIds.filter((id) => !ids.includes(id))
  notifyListeners()
}

// ── Pending / Withdrawn / Cancelled counts (dashboard) ──
let _pendingCount = 10
let _withdrawnCount = 1
let _cancelledCount = 8

export function getPendingContractCounts() {
  return {
    pending: _pendingCount,
    withdrawn: _withdrawnCount,
    cancelled: _cancelledCount,
  }
}
