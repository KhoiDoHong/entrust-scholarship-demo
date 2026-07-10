"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search, Eye, X, Download,
  UserPen, Users, BellRing, CheckCircle2, Wallet,
} from "lucide-react"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import { getConfirmedContracts, updateContract, addPriorNotice, type ConfirmedContract, type ContractStatus } from "@/lib/contracts-store"
import { cn } from "@/lib/utils"
import { ListPagination } from "@/components/list-pagination"
import { ContractStatusBadge } from "@/components/status-badge"
import { ContractDetailView } from "@/components/contract-detail-view"
import {
  SubmitConfirmDialog,
  SUBMIT_CONFIRM_MESSAGES,
} from "@/components/submit-confirm-dialog"
import {
  completeModalSubmitSuccess,
  MODAL_SUCCESS_MESSAGES,
} from "@/lib/modal-submit-success"
import { corpFacilityLabel } from "@/lib/contract-notifications"
import { findCorporationMasterForContract } from "@/lib/corporation-master-data"
import { FACILITY_APPLICANTS, facilityApplicantLabel } from "@/lib/masters"
import { applications } from "@/lib/applications-data"
import { formatEnrollmentDateDisplay } from "@/lib/application-wizard-shared"
import { DocumentUploadField } from "@/components/document-upload-field"
import { Label } from "@/components/ui/label"
import {
  SUBROGATION_REQUEST_DOCUMENTS,
  createEmptySubrogationFiles,
  demoSubrogationUpload,
  validateSubrogationRequest,
  type SubrogationFileMap,
} from "@/lib/subrogation-request-shared"
import {
  ChangeBeforeAfterLayout,
  ChangeBeforeAfterRow,
} from "@/components/change-before-after-layout"
import {
  applyContractListFilters,
  CONTRACT_LIST_ITEMS_PER_PAGE,
  EMPTY_CONTRACT_LIST_FILTERS,
  filterContractsByRole,
  getContractYears,
  getContractRemarksDisplay,
  hasContractRemarks,
  isCompletionReportEnabled,
  isSubrogationRequestEnabled,
  type ContractListFilters,
} from "@/lib/contract-list-utils"

const SUBROGATION_REQUESTED_STATUS: ContractStatus = "代位弁済依頼中"

function getContractEnrollmentDate(contract: ConfirmedContract): string {
  const raw =
    contract.enrollmentDate ??
    applications.find(
      (a) => a.contractNumber === contract.contractNumber && a.contractNumber !== "-"
    )?.student.enrollmentDate ??
    "2024-04-01"
  return formatEnrollmentDateDisplay(raw)
}

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

function getGuarantorDetailFields(
  master?: ReturnType<typeof findCorporationMasterForContract>
) {
  return [
    { label: "利用者ID", value: master?.userId },
    { label: "電話番号", value: master?.phone },
    {
      label: "郵便番号",
      value: master?.postalCode ? `〒${master.postalCode}` : undefined,
    },
    { label: "都道府県", value: master?.prefecture },
    { label: "市区町村以降", value: master?.address },
  ]
}

type DialogType =
  | "契約者情報変更"
  | "連帯保証人変更"
  | "事前通知"
  | "代位弁済依頼"
  | null

type SubmitConfirmDialogType =
  | "契約者情報変更"
  | "連帯保証人変更"
  | "代位弁済依頼"

function isSubmitConfirmDialogType(type: DialogType): type is SubmitConfirmDialogType {
  return (
    type === "契約者情報変更" ||
    type === "連帯保証人変更" ||
    type === "代位弁済依頼"
  )
}

export default function ContractManagementPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [contracts, setContracts] = useState<ConfirmedContract[]>([])
  const [filters, setFilters] = useState<ContractListFilters>({ ...EMPTY_CONTRACT_LIST_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<ContractListFilters>({ ...EMPTY_CONTRACT_LIST_FILTERS })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContract, setSelectedContract] = useState<ConfirmedContract | null>(null)

  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [dialogContract, setDialogContract] = useState<ConfirmedContract | null>(null)

  const [contractorLastName, setContractorLastName] = useState("")
  const [contractorFirstName, setContractorFirstName] = useState("")
  const [contractorLastNameKana, setContractorLastNameKana] = useState("")
  const [contractorFirstNameKana, setContractorFirstNameKana] = useState("")
  const [contractorPrefecture, setContractorPrefecture] = useState("")
  const [contractorAddress, setContractorAddress] = useState("")
  const [contractorPhone, setContractorPhone] = useState("")
  const [contractorEmail, setContractorEmail] = useState("")
  const [contractorEnrollmentDate, setContractorEnrollmentDate] = useState("")

  const [guarantorName, setGuarantorName] = useState("")

  const [noticeText, setNoticeText] = useState("")

  const [repaymentRequestAmount, setRepaymentRequestAmount] = useState("")
  const [subrogationFiles, setSubrogationFiles] = useState<SubrogationFileMap>(
    createEmptySubrogationFiles()
  )
  const [subrogationErrors, setSubrogationErrors] = useState<Record<string, string>>({})

  const [noticeRefreshKey, setNoticeRefreshKey] = useState(0)

  const [completionReportContract, setCompletionReportContract] =
    useState<ConfirmedContract | null>(null)

  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)

  const guarantorBeforeMaster = useMemo(() => {
    if (!dialogContract) return undefined
    return findCorporationMasterForContract(
      dialogContract.corporationName,
      dialogContract.facilityName
    )
  }, [dialogContract])

  const guarantorAfterMaster = useMemo(() => {
    if (!guarantorName) return undefined
    const [corporationName, facilityName] = guarantorName.split("|")
    if (!corporationName || !facilityName) return undefined
    return findCorporationMasterForContract(corporationName, facilityName)
  }, [guarantorName])

  const refreshContracts = () => setContracts([...getConfirmedContracts()])

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
    refreshContracts()
  }, [])

  const openDialog = (contract: ConfirmedContract, type: DialogType) => {
    setDialogContract(contract)
    setDialogType(type)
    if (type === "契約者情報変更" || type === "事前通知") {
      setContractorLastName("")
      setContractorFirstName("")
      setContractorLastNameKana("")
      setContractorFirstNameKana("")
      setContractorPrefecture("")
      setContractorAddress("")
      setContractorPhone("")
      setContractorEmail("")
      setContractorEnrollmentDate("")
    }
    if (type === "連帯保証人変更") {
      setGuarantorName("")
    }
    if (type === "事前通知") {
      setNoticeText("")
    }
    if (type === "代位弁済依頼") {
      setRepaymentRequestAmount("")
      setSubrogationFiles(createEmptySubrogationFiles())
      setSubrogationErrors({})
    }
  }

  const closeDialog = () => {
    setDialogType(null)
    setDialogContract(null)
    setSubmitConfirmOpen(false)
    setSubrogationErrors({})
  }

  const handleSubrogationFileUpload = (docId: (typeof SUBROGATION_REQUEST_DOCUMENTS)[number]["id"]) => {
    setSubrogationFiles((prev) => ({
      ...prev,
      [docId]: demoSubrogationUpload(),
    }))
    setSubrogationErrors((prev) => {
      const next = { ...prev }
      delete next[`documents.${docId}`]
      return next
    })
  }

  const handleSubrogationFileRemove = (docId: (typeof SUBROGATION_REQUEST_DOCUMENTS)[number]["id"]) => {
    setSubrogationFiles((prev) => ({
      ...prev,
      [docId]: undefined,
    }))
  }

  const handleDialogSubmit = () => {
    if (!dialogContract || !dialogType) return

    if (dialogType === "契約者情報変更") {
      updateContract(dialogContract.id, {
        studentName: `${contractorLastName} ${contractorFirstName}`,
        enrollmentDate: contractorEnrollmentDate || undefined,
      })
    }
    if (dialogType === "事前通知") {
      addPriorNotice(dialogContract.id, noticeText)
      setNoticeRefreshKey((k) => k + 1)
      setNoticeText("")
    }
    if (dialogType === "代位弁済依頼") {
      updateContract(dialogContract.id, {
        status: SUBROGATION_REQUESTED_STATUS,
        subrogationRequest: {
          repaymentRequestAmount,
          repaymentInvoiceFile: subrogationFiles.repayment_invoice?.name,
          privacyConsentFile: subrogationFiles.privacy_consent?.name,
        },
      })
      if (selectedContract?.id === dialogContract.id) {
        setSelectedContract((prev) =>
          prev
            ? {
                ...prev,
                status: SUBROGATION_REQUESTED_STATUS,
                subrogationRequest: {
                  repaymentRequestAmount,
                  repaymentInvoiceFile: subrogationFiles.repayment_invoice?.name,
                  privacyConsentFile: subrogationFiles.privacy_consent?.name,
                },
              }
            : prev
        )
      }
    }

    const successTitleByDialog: Partial<Record<NonNullable<typeof dialogType>, string>> = {
      契約者情報変更: MODAL_SUCCESS_MESSAGES.contractorInfoChanged,
      連帯保証人変更: MODAL_SUCCESS_MESSAGES.guarantorChanged,
      事前通知: MODAL_SUCCESS_MESSAGES.priorNoticeSent,
      代位弁済依頼: MODAL_SUCCESS_MESSAGES.subrogationRequested,
    }

    completeModalSubmitSuccess({
      title: successTitleByDialog[dialogType] ?? "処理が完了しました",
      onClose: closeDialog,
      onRefresh: refreshContracts,
    })
  }

  const handleDialogSubmitClick = () => {
    if (!dialogContract || !dialogType) return
    if (dialogType === "代位弁済依頼") {
      const errors = validateSubrogationRequest(repaymentRequestAmount, subrogationFiles)
      if (Object.keys(errors).length > 0) {
        setSubrogationErrors(errors)
        return
      }
      setSubrogationErrors({})
    }
    if (isSubmitConfirmDialogType(dialogType)) {
      setSubmitConfirmOpen(true)
      return
    }
    handleDialogSubmit()
  }

  const handleCompletedPayment = () => {
    if (!completionReportContract) return
    updateContract(completionReportContract.id, { status: "解約" })
    if (selectedContract?.id === completionReportContract.id) {
      setSelectedContract((prev) => (prev ? { ...prev, status: "解約" } : prev))
    }
    completeModalSubmitSuccess({
      title: MODAL_SUCCESS_MESSAGES.completionReported,
      onClose: () => setCompletionReportContract(null),
      onRefresh: refreshContracts,
    })
  }

  const openCompletionReportConfirm = (contract: ConfirmedContract) => {
    setCompletionReportContract(contract)
  }

  const closeCompletionReportConfirm = () => {
    setCompletionReportContract(null)
  }

  const roleFilteredContracts = useMemo(
    () => filterContractsByRole(contracts, currentUser),
    [contracts, currentUser]
  )

  const availableYears = useMemo(
    () => getContractYears(roleFilteredContracts),
    [roleFilteredContracts]
  )

  const filteredContracts = useMemo(
    () => applyContractListFilters(roleFilteredContracts, appliedFilters),
    [roleFilteredContracts, appliedFilters]
  )

  const totalPages = Math.ceil(filteredContracts.length / CONTRACT_LIST_ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * CONTRACT_LIST_ITEMS_PER_PAGE
  const paginatedContracts = filteredContracts.slice(
    startIndex,
    startIndex + CONTRACT_LIST_ITEMS_PER_PAGE
  )

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
    setCurrentPage(1)
  }

  const handleClear = () => {
    setFilters({ ...EMPTY_CONTRACT_LIST_FILTERS })
    setAppliedFilters({ ...EMPTY_CONTRACT_LIST_FILTERS })
    setCurrentPage(1)
  }

  const handleExportCsv = () => {
    const headers = ["契約番号", "法人名", "養成施設名", "契約者", "契約確定日", "ステータス"]
    const rows = filteredContracts.map((c) => [
      c.contractNumber, c.corporationName,
      c.facilityName, c.studentName, c.confirmedDate, c.status,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `契約一覧_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const canEdit = currentUser
    ? currentUser.role !== "entrust" && currentUser.role !== "association"
    : false

  if (selectedContract) {
    return (
      <DashboardLayout>
        <ContractDetailView
          key={noticeRefreshKey}
          contract={selectedContract}
          onBack={() => setSelectedContract(null)}
          backLabel="契約一覧に戻る"
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">契約一覧</h1>
            <p className="text-gray-500">確定済み契約の一覧を管理します</p>
          </div>
          <Button onClick={handleExportCsv} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            CSVエクスポート
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">契約番号</label>
                  <Input placeholder="CON-2024-..." value={filters.contractNumber}
                    onChange={(e) => setFilters((f) => ({ ...f, contractNumber: e.target.value }))} className="bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">契約確定日（年）</label>
                  <Select value={filters.contractYear} onValueChange={(v) => setFilters((f) => ({ ...f, contractYear: v }))}>
                    <SelectTrigger className="bg-white w-full"><SelectValue placeholder="すべて" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {availableYears.map((y) => <SelectItem key={y} value={y}>{y}年</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">ステータス</label>
                  <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-white w-full"><SelectValue placeholder="すべて" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="確定済み">確定済み</SelectItem>
                      <SelectItem value="代位弁済依頼中">代位弁済依頼中</SelectItem>
                      <SelectItem value="弁済依頼確認済み">弁済依頼確認済み</SelectItem>
                      <SelectItem value="弁済依頼承認済み">弁済依頼承認済み</SelectItem>
                      <SelectItem value="弁済依頼差し戻し">弁済依頼差し戻し</SelectItem>
                      <SelectItem value="解約">解約</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">契約連帯保証人</label>
                  <Input placeholder="保証人で検索..." value={filters.corporationName}
                    onChange={(e) => setFilters((f) => ({ ...f, corporationName: e.target.value }))} className="bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">契約者</label>
                  <Input placeholder="契約者で検索..." value={filters.studentName}
                    onChange={(e) => setFilters((f) => ({ ...f, studentName: e.target.value }))} className="bg-white" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={handleSearch} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2">
                  <Search className="w-4 h-4" />検索
                </Button>
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <X className="w-4 h-4" />クリア
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              {filteredContracts.length} 件中 {filteredContracts.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + CONTRACT_LIST_ITEMS_PER_PAGE, filteredContracts.length)} 件を表示
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">契約番号</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">契約連帯保証人</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">契約者</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">契約確定日</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-28">ステータス</th>
                    {canEdit && <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-32">各種変更</th>}
                    {canEdit && <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-36">貸付金返還事</th>}
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 min-w-[12rem]">コメント</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.length > 0 ? (
                    paginatedContracts.map((c) => {
                      const isEnded = c.status === "解約"
                      const subrogationDisabled = !isSubrogationRequestEnabled(c)
                      const completionReportDisabled = !isCompletionReportEnabled(c)
                      return (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{c.contractNumber}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{corpFacilityLabel(c)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{c.studentName}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{c.confirmedDate}</td>
                          <td className="py-4 px-4">
                            <ContractStatusBadge status={c.status} />
                          </td>
                          {canEdit && (
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                {(["契約者情報変更", "連帯保証人変更"] as const).map((type, i) => {
                                  const icons = [<UserPen key="up" className="w-4 h-4" />, <Users key="us" className="w-4 h-4" />]
                                  return (
                                    <button
                                      key={type}
                                      onClick={() => openDialog(c, type)}
                                      title={type}
                                      disabled={isEnded}
                                      className={cn(
                                        "p-1.5 rounded transition-colors",
                                        isEnded
                                          ? "text-gray-300 cursor-not-allowed"
                                          : "hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                                      )}
                                    >
                                      {icons[i]}
                                    </button>
                                  )
                                })}
                              </div>
                            </td>
                          )}
                          {canEdit && (
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openDialog(c, "事前通知")}
                                  title="事前通知"
                                  disabled={isEnded}
                                  className={cn("p-1.5 rounded transition-colors", isEnded ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-50 text-orange-500 hover:text-orange-700")}
                                >
                                  <BellRing className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    !completionReportDisabled && openCompletionReportConfirm(c)
                                  }
                                  title="完済完了報告"
                                  disabled={completionReportDisabled}
                                  className={cn(
                                    "p-1.5 rounded transition-colors",
                                    completionReportDisabled
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "hover:bg-green-50 text-green-600 hover:text-green-800"
                                  )}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDialog(c, "代位弁済依頼")}
                                  title="代位弁済依頼"
                                  disabled={subrogationDisabled}
                                  className={cn(
                                    "p-1.5 rounded transition-colors",
                                    subrogationDisabled
                                      ? "text-gray-300 cursor-not-allowed"
                                      : "hover:bg-purple-50 text-purple-500 hover:text-purple-800"
                                  )}
                                >
                                  <Wallet className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {hasContractRemarks(c) ? (
                              <p className="text-xs whitespace-pre-wrap">
                                {getContractRemarksDisplay(c)}
                              </p>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedContract(c)}
                              title="詳細"
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={canEdit ? 9 : 7} className="py-8 text-center text-gray-500">
                        該当する契約が見つかりませんでした
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <ListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>

      {dialogType && dialogContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl shadow-xl w-full ${["契約者情報変更", "連帯保証人変更"].includes(dialogType) ? "max-w-2xl" : dialogType === "代位弁済依頼" ? "max-w-4xl" : "max-w-md"}`}>
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{dialogType}</h2>
              <button onClick={closeDialog} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            {dialogType === "代位弁済依頼" && (
              <div className="px-6 pt-4 pb-0">
                <p className="text-xs text-red-500 leading-relaxed">
                  返済請求書を受け取った後、10日以内にその請求書をイントラストに送付しなければなりません。
                </p>
              </div>
            )}
            <div className="px-6 py-5 space-y-4">

              {dialogType === "契約者情報変更" && (
                <ChangeBeforeAfterLayout>
                  <ChangeBeforeAfterRow
                    label="契約者（姓）"
                    before={dialogContract.studentName?.split(" ")[0] || ""}
                    after={
                      <Input
                        value={contractorLastName}
                        onChange={(e) => setContractorLastName(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="契約者（名）"
                    before={dialogContract.studentName?.split(" ")[1] || ""}
                    after={
                      <Input
                        value={contractorFirstName}
                        onChange={(e) => setContractorFirstName(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="契約者（姓）カナ"
                    before="タナカ"
                    after={
                      <Input
                        value={contractorLastNameKana}
                        onChange={(e) => setContractorLastNameKana(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="契約者（名）カナ"
                    before="タロウ"
                    after={
                      <Input
                        value={contractorFirstNameKana}
                        onChange={(e) => setContractorFirstNameKana(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="都道府県"
                    before="東京都"
                    after={
                      <select
                        value={contractorPrefecture}
                        onChange={(e) => setContractorPrefecture(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">選択してください</option>
                        {PREFECTURES.map((pref) => (
                          <option key={pref} value={pref}>
                            {pref}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="市区町村以降"
                    before="港区赤坂1-2-3"
                    after={
                      <Input
                        value={contractorAddress}
                        onChange={(e) => setContractorAddress(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="電話番号"
                    before="090-0000-0001"
                    after={
                      <Input
                        value={contractorPhone}
                        onChange={(e) => setContractorPhone(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="メールアドレス"
                    before="user@example.com"
                    after={
                      <Input
                        value={contractorEmail}
                        onChange={(e) => setContractorEmail(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="入学日・入学予定日"
                    before={getContractEnrollmentDate(dialogContract)}
                    after={
                      <Input
                        type="date"
                        value={contractorEnrollmentDate}
                        onChange={(e) => setContractorEnrollmentDate(e.target.value)}
                        className="w-full bg-white"
                      />
                    }
                  />
                </ChangeBeforeAfterLayout>
              )}

              {dialogType === "連帯保証人変更" && (
                <ChangeBeforeAfterLayout>
                  <ChangeBeforeAfterRow
                    label="連帯保証人"
                    before={corpFacilityLabel(dialogContract)}
                    after={
                      <select
                        value={guarantorName}
                        onChange={(e) => setGuarantorName(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">選択してください</option>
                        {FACILITY_APPLICANTS.map((f) => (
                          <option
                            key={f.corporationId}
                            value={`${f.corporationName}|${f.facilityName}`}
                          >
                            {facilityApplicantLabel(f)}
                          </option>
                        ))}
                      </select>
                    }
                  />
                  {getGuarantorDetailFields(guarantorBeforeMaster).map(({ label, value }, i) => {
                    const afterValue = getGuarantorDetailFields(guarantorAfterMaster)[i]?.value
                    return (
                      <ChangeBeforeAfterRow
                        key={label}
                        label={label}
                        before={value}
                        after={<p className="text-sm text-gray-800">{afterValue || "—"}</p>}
                      />
                    )
                  })}
                </ChangeBeforeAfterLayout>
              )}

              {dialogType === "事前通知" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">通知内容</label>
                  <textarea
                    value={noticeText}
                    onChange={(e) => setNoticeText(e.target.value)}
                    rows={6}
                    placeholder="通知内容を入力してください"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {dialogType === "代位弁済依頼" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="repaymentRequestAmount">
                      返還請求金額 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="repaymentRequestAmount"
                      type="number"
                      min={0}
                      value={repaymentRequestAmount}
                      onChange={(e) => {
                        setRepaymentRequestAmount(e.target.value)
                        if (subrogationErrors.repaymentRequestAmount) {
                          setSubrogationErrors((prev) => {
                            const next = { ...prev }
                            delete next.repaymentRequestAmount
                            return next
                          })
                        }
                      }}
                      placeholder="金額を入力"
                      className="bg-white w-[240px]"
                    />
                    <p className="text-sm leading-5 text-red-600 min-h-5">
                      {subrogationErrors.repaymentRequestAmount ?? ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SUBROGATION_REQUEST_DOCUMENTS.map((doc) => (
                      <DocumentUploadField
                        key={doc.id}
                        compact
                        doc={{ ...doc, required: true }}
                        file={subrogationFiles[doc.id]}
                        error={subrogationErrors[`documents.${doc.id}`]}
                        onUpload={() => handleSubrogationFileUpload(doc.id)}
                        onRemove={() => handleSubrogationFileRemove(doc.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button variant="outline" onClick={closeDialog}>キャンセル</Button>
              <Button onClick={handleDialogSubmitClick} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white">
                {dialogType === "代位弁済依頼" ||
                dialogType === "契約者情報変更" ||
                dialogType === "連帯保証人変更"
                  ? "申請"
                  : dialogType === "事前通知"
                  ? "送信"
                  : "保存"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {submitConfirmOpen && dialogType && isSubmitConfirmDialogType(dialogType) && (
        <SubmitConfirmDialog
          open={submitConfirmOpen}
          title={dialogType}
          message={SUBMIT_CONFIRM_MESSAGES[dialogType]}
          onCancel={() => setSubmitConfirmOpen(false)}
          onConfirm={handleDialogSubmit}
        />
      )}

      {completionReportContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">完済完了報告</h2>
              <button
                type="button"
                onClick={closeCompletionReportConfirm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm font-medium text-gray-900">完済完了報告を行いますか？</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                1月～3月の期間内で申請する場合は、次年度の保証料請求が確定しているため、翌々年度以降の保証料総額として算出されます。
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button variant="outline" onClick={closeCompletionReportConfirm}>
                キャンセル
              </Button>
              <Button
                onClick={handleCompletedPayment}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
              >
                確認する
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
