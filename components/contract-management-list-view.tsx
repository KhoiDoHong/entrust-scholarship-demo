"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X, Eye, Edit, RotateCcw, Send, ClipboardCheck } from "lucide-react"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import {
  acknowledgeWorkflowTargets,
  getConfirmedContracts,
  getLatestPriorNotice,
  isWorkflowTargetAcknowledged,
  updateContract,
  type ConfirmedContract,
} from "@/lib/contracts-store"
import { ContractStatusBadge } from "@/components/status-badge"
import { ContractDetailView } from "@/components/contract-detail-view"
import { ListPagination } from "@/components/list-pagination"
import {
  applyContractListFilters,
  CONTRACT_LIST_ITEMS_PER_PAGE,
  EMPTY_CONTRACT_LIST_FILTERS,
  filterContractsByRole,
  getContractYears,
  type ContractListFilters,
} from "@/lib/contract-list-utils"
import { corpFacilityLabel } from "@/lib/contract-notifications"
import { findCorporationMasterForContract } from "@/lib/corporation-master-data"
import {
  SubmitConfirmDialog,
  WORKFLOW_BULK_CONFIRM_MESSAGES,
} from "@/components/submit-confirm-dialog"
import {
  ChangeBeforeAfterLayout,
  ChangeBeforeAfterRow,
} from "@/components/change-before-after-layout"
import {
  completeModalSubmitSuccess,
  MODAL_SUCCESS_MESSAGES,
} from "@/lib/modal-submit-success"

export type ContractApplyDialogConfig = {
  title: string
  submitLabel?: string
  confirmMessage: string
  variant?: "jobcan" | "remittance-account"
}

interface ContractManagementListViewProps {
  title: string
  subtitle: string
  contractPredicate?: (contract: ConfirmedContract) => boolean
  showJobcan?: boolean
  applyDialog?: ContractApplyDialogConfig
  showBulkSelection?: boolean
  /** When false, only show 選択した契約を確認 (layout like 今月確定通知一覧). */
  showBulkReject?: boolean
  /** After confirm, hide contracts from this workflow list. */
  acknowledgeWorkflowKey?: string
  showPriorNoticeColumn?: boolean
  /** 弁済依頼対象: nút 確認 → detail với 差し戻し/確認 ở cuối */
  detailReviewMode?: boolean
}

function isBulkSelectable(contract: ConfirmedContract): boolean {
  return contract.status !== "弁済依頼確認済み"
}

export function ContractManagementListView({
  title,
  subtitle,
  contractPredicate,
  showJobcan = false,
  applyDialog,
  showBulkSelection = false,
  showBulkReject = true,
  acknowledgeWorkflowKey,
  showPriorNoticeColumn = false,
  detailReviewMode = false,
}: ContractManagementListViewProps) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [contracts, setContracts] = useState<ConfirmedContract[]>([])
  const [selectedContract, setSelectedContract] = useState<ConfirmedContract | null>(null)
  const [filters, setFilters] = useState<ContractListFilters>({ ...EMPTY_CONTRACT_LIST_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<ContractListFilters>({ ...EMPTY_CONTRACT_LIST_FILTERS })
  const [currentPage, setCurrentPage] = useState(1)
  const [jobcanDialogContract, setJobcanDialogContract] = useState<ConfirmedContract | null>(null)
  const [jobcanAfter, setJobcanAfter] = useState("")
  const [bankCodeAfter, setBankCodeAfter] = useState("")
  const [bankNameAfter, setBankNameAfter] = useState("")
  const [branchCodeAfter, setBranchCodeAfter] = useState("")
  const [branchNameAfter, setBranchNameAfter] = useState("")
  const [accountTypeAfter, setAccountTypeAfter] = useState("")
  const [accountNumberAfter, setAccountNumberAfter] = useState("")
  const [accountHolderAfter, setAccountHolderAfter] = useState("")
  const [accountHolderKanaAfter, setAccountHolderKanaAfter] = useState("")
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const refreshContracts = () => setContracts([...getConfirmedContracts()])

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
    refreshContracts()
  }, [])

  useEffect(() => {
    setSelectedContract((prev) => {
      if (!prev) return null
      return contracts.find((c) => c.id === prev.id) ?? null
    })
  }, [contracts])

  const roleFilteredContracts = useMemo(() => {
    const base = filterContractsByRole(contracts, currentUser)
    const predicateFiltered = contractPredicate ? base.filter(contractPredicate) : base
    if (!acknowledgeWorkflowKey) return predicateFiltered
    return predicateFiltered.filter(
      (c) => !isWorkflowTargetAcknowledged(acknowledgeWorkflowKey, c.id)
    )
  }, [contracts, currentUser, contractPredicate, acknowledgeWorkflowKey])

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

  const isRemittanceApply = applyDialog?.variant === "remittance-account"

  const openJobcanDialog = (contract: ConfirmedContract) => {
    setJobcanDialogContract(contract)
    if (isRemittanceApply) {
      setBankCodeAfter("")
      setBankNameAfter("")
      setBranchCodeAfter("")
      setBranchNameAfter("")
      setAccountTypeAfter("")
      setAccountNumberAfter("")
      setAccountHolderAfter("")
      setAccountHolderKanaAfter("")
    } else {
      setJobcanAfter(contract.jobcan ?? "")
    }
  }

  const closeJobcanDialog = () => {
    setJobcanDialogContract(null)
    setJobcanAfter("")
    setBankCodeAfter("")
    setBankNameAfter("")
    setBranchCodeAfter("")
    setBranchNameAfter("")
    setAccountTypeAfter("")
    setAccountNumberAfter("")
    setAccountHolderAfter("")
    setAccountHolderKanaAfter("")
  }

  const handleJobcanSave = () => {
    if (!jobcanDialogContract) return
    if (!isRemittanceApply) {
      updateContract(jobcanDialogContract.id, { jobcan: jobcanAfter.trim() || undefined })
    }
    completeModalSubmitSuccess({
      title: isRemittanceApply
        ? MODAL_SUCCESS_MESSAGES.remittanceAccountSubmitted
        : MODAL_SUCCESS_MESSAGES.jobcanUpdated,
      onClose: closeJobcanDialog,
      onRefresh: refreshContracts,
    })
  }

  const handleJobcanSubmitClick = () => {
    handleJobcanSave()
  }

  const applyDialogTitle = applyDialog?.title ?? "ジョブカン変更"
  const applySubmitLabel = applyDialog?.submitLabel ?? "保存"
  const remittanceMaster = jobcanDialogContract
    ? findCorporationMasterForContract(
        jobcanDialogContract.corporationName,
        jobcanDialogContract.facilityName
      )
    : undefined

  const selectableIds = useMemo(
    () => paginatedContracts.filter(isBulkSelectable).map((c) => c.id),
    [paginatedContracts]
  )

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAllSelection = () => {
    const allSelected =
      selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableIds.includes(id)))
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...selectableIds])])
    }
  }

  const handleBulkConfirmClick = () => {
    if (acknowledgeWorkflowKey) {
      setBulkConfirmOpen(true)
      return
    }
    handleBulkConfirm()
  }

  const handleBulkConfirm = () => {
    const ids = selectedIds.filter((id) => {
      const contract = contracts.find((c) => c.id === id)
      return contract && isBulkSelectable(contract)
    })
    if (acknowledgeWorkflowKey) {
      acknowledgeWorkflowTargets(acknowledgeWorkflowKey, ids)
    } else {
      ids.forEach((id) => {
        updateContract(id, { status: "弁済依頼確認済み" })
      })
    }
    setSelectedIds([])
    completeModalSubmitSuccess({
      title: MODAL_SUCCESS_MESSAGES.bulkConfirmed,
      onClose: () => setBulkConfirmOpen(false),
      onRefresh: refreshContracts,
    })
  }

  const handleBulkReject = () => {
    selectedIds.forEach((id) => {
      const contract = contracts.find((c) => c.id === id)
      if (!contract || !isBulkSelectable(contract)) return
      updateContract(id, {
        status: "弁済依頼差し戻し",
        rejectionComment: "提出書類に不備があります。内容を確認のうえ再提出してください。",
      })
    })
    setSelectedIds([])
    completeModalSubmitSuccess({
      title: MODAL_SUCCESS_MESSAGES.bulkRejected,
      onClose: () => {},
      onRefresh: refreshContracts,
    })
  }

  const rejectSubrogationRequest = (id: number, rejectionComment: string) => {
    updateContract(id, {
      status: "弁済依頼差し戻し",
      rejectionComment,
    })
    completeModalSubmitSuccess({
      title: MODAL_SUCCESS_MESSAGES.subrogationRejected,
      onClose: () => setSelectedContract(null),
      onRefresh: refreshContracts,
    })
  }

  const confirmSubrogationRequest = (id: number) => {
    updateContract(id, { status: "弁済依頼確認済み" })
    completeModalSubmitSuccess({
      title: MODAL_SUCCESS_MESSAGES.subrogationConfirmed,
      onClose: () => setSelectedContract(null),
      onRefresh: refreshContracts,
    })
  }

  const columnCount =
    (showJobcan ? 7 : 6) + (showBulkSelection ? 1 : 0) + (showPriorNoticeColumn ? 1 : 0)

  if (selectedContract) {
    return (
      <ContractDetailView
        contract={selectedContract}
        onBack={() => setSelectedContract(null)}
        backLabel={`${title}に戻る`}
        subrogationReviewActions={
          detailReviewMode
            ? {
                onConfirm: () => confirmSubrogationRequest(selectedContract.id),
                onReject: (comment) => rejectSubrogationRequest(selectedContract.id, comment),
              }
            : undefined
        }
      />
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">契約番号</label>
                <Input
                  placeholder="CON-2024-..."
                  value={filters.contractNumber}
                  onChange={(e) => setFilters((f) => ({ ...f, contractNumber: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">契約確定日（年）</label>
                <Select
                  value={filters.contractYear}
                  onValueChange={(v) => setFilters((f) => ({ ...f, contractYear: v }))}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {availableYears.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ステータス</label>
                <Select
                  value={filters.status}
                  onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
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
                <Input
                  placeholder="保証人で検索..."
                  value={filters.corporationName}
                  onChange={(e) => setFilters((f) => ({ ...f, corporationName: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">契約者</label>
                <Input
                  placeholder="契約者で検索..."
                  value={filters.studentName}
                  onChange={(e) => setFilters((f) => ({ ...f, studentName: e.target.value }))}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleSearch} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2">
                <Search className="w-4 h-4" />
                検索
              </Button>
              <Button variant="outline" onClick={handleClear} className="gap-2">
                <X className="w-4 h-4" />
                クリア
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {filteredContracts.length} 件中{" "}
            {filteredContracts.length === 0 ? 0 : startIndex + 1} -{" "}
            {Math.min(startIndex + CONTRACT_LIST_ITEMS_PER_PAGE, filteredContracts.length)} 件を表示
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {showBulkSelection && (
                    <th className="py-3 px-4 w-10">
                      <Checkbox
                        checked={
                          selectableIds.length > 0 &&
                          selectableIds.every((id) => selectedIds.includes(id))
                        }
                        onCheckedChange={toggleAllSelection}
                      />
                    </th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">契約番号</th>
                  {showJobcan && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">ジョブカン</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">契約連帯保証人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">契約者</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">契約確定日</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-28">ステータス</th>
                  {showPriorNoticeColumn && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">通知内容</th>
                  )}
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-16">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContracts.length > 0 ? (
                  paginatedContracts.map((c) => {
                    const rowSelectable = showBulkSelection && isBulkSelectable(c)
                    return (
                    <tr
                      key={c.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        selectedIds.includes(c.id)
                          ? showBulkReject
                            ? "bg-blue-50"
                            : "bg-orange-50"
                          : ""
                      }`}
                    >
                      {showBulkSelection && (
                        <td className="py-4 px-4">
                          <Checkbox
                            checked={selectedIds.includes(c.id)}
                            onCheckedChange={() => toggleSelection(c.id)}
                            disabled={!rowSelectable}
                          />
                        </td>
                      )}
                      <td className="py-4 px-4 text-sm text-gray-900">{c.contractNumber}</td>
                      {showJobcan && (
                        <td className="py-4 px-4 text-sm text-gray-900">{c.jobcan || "—"}</td>
                      )}
                      <td className="py-4 px-4 text-sm text-gray-900">{corpFacilityLabel(c)}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{c.studentName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{c.confirmedDate}</td>
                      <td className="py-4 px-4">
                        <ContractStatusBadge status={c.status} />
                      </td>
                      {showPriorNoticeColumn && (
                        <td className="py-4 px-4 text-sm text-gray-900 max-w-xs">
                          <p className="line-clamp-2 whitespace-pre-wrap">
                            {getLatestPriorNotice(c.id)?.text ?? "—"}
                          </p>
                        </td>
                      )}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title={detailReviewMode ? "確認" : "詳細"}
                            aria-label={detailReviewMode ? "確認" : "詳細"}
                            onClick={() => setSelectedContract(c)}
                            className={`p-1.5 rounded transition-colors ${
                              detailReviewMode
                                ? "hover:bg-blue-50 text-[#1e3a5f] hover:text-[#2a4a6f]"
                                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            {detailReviewMode ? (
                              <ClipboardCheck className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          {showJobcan && (
                            <button
                              type="button"
                              title="ジョブカン編集"
                              onClick={() => openJobcanDialog(c)}
                              className="p-1.5 rounded hover:bg-orange-50 text-orange-500 hover:text-orange-700 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={columnCount} className="py-8 text-center text-gray-500">
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

          {showBulkSelection && (
            <div className="flex justify-end mt-4">
              {showBulkReject && (
                <Button
                  onClick={handleBulkReject}
                  disabled={selectedIds.length === 0}
                  variant="outline"
                  className="border-orange-300 text-orange-600 hover:bg-orange-50 gap-2 disabled:opacity-50 mr-3"
                >
                  <RotateCcw className="w-4 h-4" />
                  選択した契約を差し戻し ({selectedIds.length}件)
                </Button>
              )}
              <Button
                onClick={handleBulkConfirmClick}
                disabled={selectedIds.length === 0}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                選択した契約を確認 ({selectedIds.length}件)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showJobcan && jobcanDialogContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-xl shadow-xl w-full ${
              isRemittanceApply ? "max-w-4xl" : "max-w-2xl"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{applyDialogTitle}</h2>
              <button
                type="button"
                onClick={closeJobcanDialog}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5">
              {isRemittanceApply ? (
                <ChangeBeforeAfterLayout>
                  <ChangeBeforeAfterRow
                    label="金融機関コード"
                    before={remittanceMaster?.bankCode}
                    after={
                      <Input
                        value={bankCodeAfter}
                        onChange={(e) => setBankCodeAfter(e.target.value)}
                        placeholder="例：0001"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="金融機関名"
                    before={remittanceMaster?.bankName}
                    after={
                      <Input
                        value={bankNameAfter}
                        onChange={(e) => setBankNameAfter(e.target.value)}
                        placeholder="例：〇〇銀行"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="支店コード"
                    before={remittanceMaster?.branchCode}
                    after={
                      <Input
                        value={branchCodeAfter}
                        onChange={(e) => setBranchCodeAfter(e.target.value)}
                        placeholder="例：001"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="支店名"
                    before={remittanceMaster?.branchName}
                    after={
                      <Input
                        value={branchNameAfter}
                        onChange={(e) => setBranchNameAfter(e.target.value)}
                        placeholder="例：〇〇支店"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="預金種別"
                    before={remittanceMaster?.accountType}
                    after={
                      <select
                        value={accountTypeAfter}
                        onChange={(e) => setAccountTypeAfter(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">選択してください</option>
                        <option value="普通">普通</option>
                        <option value="当座">当座</option>
                        <option value="貯蓄">貯蓄</option>
                      </select>
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="口座番号"
                    before={remittanceMaster?.accountNumber}
                    after={
                      <Input
                        value={accountNumberAfter}
                        onChange={(e) => setAccountNumberAfter(e.target.value)}
                        placeholder="1234567"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="口座名義人"
                    before={remittanceMaster?.accountHolder}
                    after={
                      <Input
                        value={accountHolderAfter}
                        onChange={(e) => setAccountHolderAfter(e.target.value)}
                        placeholder="例：ヤマダタロウ"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="口座名義人カナ"
                    before={remittanceMaster?.accountHolderKana}
                    after={
                      <Input
                        value={accountHolderKanaAfter}
                        onChange={(e) => setAccountHolderKanaAfter(e.target.value)}
                        placeholder="例：ヤマダタロウ"
                        className="bg-white"
                      />
                    }
                  />
                </ChangeBeforeAfterLayout>
              ) : (
                <ChangeBeforeAfterLayout>
                  <ChangeBeforeAfterRow
                    label="ジョブカン"
                    before={jobcanDialogContract.jobcan || "（未設定）"}
                    after={
                      <Input
                        value={jobcanAfter}
                        onChange={(e) => setJobcanAfter(e.target.value)}
                        placeholder="例：JC-2024-0101"
                        className="bg-white"
                      />
                    }
                  />
                </ChangeBeforeAfterLayout>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button variant="outline" onClick={closeJobcanDialog}>
                キャンセル
              </Button>
              <Button
                onClick={handleJobcanSubmitClick}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
              >
                {applySubmitLabel}
              </Button>
            </div>
          </div>
        </div>
      )}

      {bulkConfirmOpen && acknowledgeWorkflowKey && (
        <SubmitConfirmDialog
          open={bulkConfirmOpen}
          title="確認"
          message={
            WORKFLOW_BULK_CONFIRM_MESSAGES[acknowledgeWorkflowKey] ??
            "選択した契約を確認します。よろしいですか？"
          }
          confirmLabel="確認する"
          onCancel={() => setBulkConfirmOpen(false)}
          onConfirm={handleBulkConfirm}
        />
      )}
    </div>
  )
}
