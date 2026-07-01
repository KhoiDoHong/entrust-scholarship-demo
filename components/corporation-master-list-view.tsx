"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Download, UserCog, Landmark, Eye, ArrowLeft } from "lucide-react"
import { getSession, type UserAccount } from "@/lib/auth"
import { ListPagination } from "@/components/list-pagination"
import { getConfirmedContracts, updateContract, type ContractStatus } from "@/lib/contracts-store"
import { cn } from "@/lib/utils"
import {
  applyCorporationMasterFilters,
  filterCorporationMasterByRole,
  CORPORATION_MASTER_ITEMS_PER_PAGE,
  CORPORATION_MASTER_RECORDS,
  EMPTY_CORPORATION_MASTER_FILTERS,
  type CorporationMasterFilters,
  type CorporationMasterRecord,
} from "@/lib/corporation-master-data"
import {
  SubmitConfirmDialog,
  SUBMIT_CONFIRM_MESSAGES,
} from "@/components/submit-confirm-dialog"
import {
  ChangeBeforeAfterLayout,
  ChangeBeforeAfterRow,
} from "@/components/change-before-after-layout"

const SUBROGATION_REQUESTED_STATUS: ContractStatus = "代位弁済依頼中"

type DialogType = "担当者情報変更" | "送金先口座申請" | null

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value?.trim() ? value : "-"}</p>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="bg-white"
      />
    </div>
  )
}

export function CorporationMasterListView() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [filters, setFilters] = useState<CorporationMasterFilters>({
    ...EMPTY_CORPORATION_MASTER_FILTERS,
  })
  const [appliedFilters, setAppliedFilters] = useState<CorporationMasterFilters>({
    ...EMPTY_CORPORATION_MASTER_FILTERS,
  })
  const [currentPage, setCurrentPage] = useState(1)

  const [dialogType, setDialogType] = useState<DialogType>(null)
  const [dialogRecord, setDialogRecord] = useState<CorporationMasterRecord | null>(null)

  const [staffName, setStaffName] = useState("")
  const [staffNameKana, setStaffNameKana] = useState("")
  const [staffDepartment, setStaffDepartment] = useState("")
  const [staffPhone, setStaffPhone] = useState("")
  const [staffEmail, setStaffEmail] = useState("")

  const [bankCode, setBankCode] = useState("")
  const [bankName, setBankName] = useState("")
  const [branchCode, setBranchCode] = useState("")
  const [bankBranch, setBankBranch] = useState("")
  const [bankAccountType, setBankAccountType] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankAccountHolder, setBankAccountHolder] = useState("")
  const [bankAccountHolderKana, setBankAccountHolderKana] = useState("")

  const [daiiSubmittedIds, setDaiiSubmittedIds] = useState<Set<string>>(new Set())
  const [selectedRecord, setSelectedRecord] = useState<CorporationMasterRecord | null>(null)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)

  useEffect(() => {
    setCurrentUser(getSession())
  }, [])

  const roleScopedRecords = useMemo(
    () => filterCorporationMasterByRole(CORPORATION_MASTER_RECORDS, currentUser),
    [currentUser]
  )

  const filteredRecords = useMemo(
    () => applyCorporationMasterFilters(roleScopedRecords, appliedFilters),
    [roleScopedRecords, appliedFilters]
  )

  const totalPages = Math.ceil(filteredRecords.length / CORPORATION_MASTER_ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * CORPORATION_MASTER_ITEMS_PER_PAGE
  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + CORPORATION_MASTER_ITEMS_PER_PAGE
  )

  const openDialog = (record: CorporationMasterRecord, type: DialogType) => {
    setDialogRecord(record)
    setDialogType(type)
    if (type === "担当者情報変更") {
      setStaffName("")
      setStaffNameKana("")
      setStaffDepartment("")
      setStaffPhone("")
      setStaffEmail("")
    }
    if (type === "送金先口座申請") {
      setBankCode("")
      setBankName("")
      setBranchCode("")
      setBankBranch("")
      setBankAccountType("")
      setBankAccountNumber("")
      setBankAccountHolder("")
      setBankAccountHolderKana("")
    }
  }

  const closeDialog = () => {
    setDialogType(null)
    setDialogRecord(null)
    setSubmitConfirmOpen(false)
  }

  const handleDialogSubmit = () => {
    if (!dialogRecord) return

    if (dialogType === "送金先口座申請") {
      getConfirmedContracts()
        .filter(
          (c) =>
            c.corporationName === dialogRecord.corporationName &&
            c.facilityName === dialogRecord.facilityName
        )
        .forEach((c) => updateContract(c.id, { status: SUBROGATION_REQUESTED_STATUS }))
      setDaiiSubmittedIds((prev) => new Set([...prev, dialogRecord.id]))
    }
    setSubmitConfirmOpen(false)
    closeDialog()
  }

  const handleDialogSubmitClick = () => {
    if (!dialogRecord || !dialogType) return
    setSubmitConfirmOpen(true)
  }

  const handleSearch = () => {
    setAppliedFilters({ ...filters })
    setCurrentPage(1)
  }

  const handleClear = () => {
    setFilters({ ...EMPTY_CORPORATION_MASTER_FILTERS })
    setAppliedFilters({ ...EMPTY_CORPORATION_MASTER_FILTERS })
    setCurrentPage(1)
  }

  const handleExportCsv = () => {
    const headers = [
      "利用者ID",
      "法人名・施設名",
      "担当者名",
      "役職/部署",
      "担当者メールアドレス",
    ]
    const rows = filteredRecords.map((r) => [
      r.userId,
      r.corporationFacilityName,
      r.contactName,
      r.contactDepartment,
      r.contactEmail,
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `法人マスタ一覧_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!currentUser) return null

  const canEdit = currentUser.role !== "entrust" && currentUser.role !== "association"
  const tableColSpan = canEdit ? 8 : 6

  if (selectedRecord) {
    return (
      <div>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setSelectedRecord(null)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            法人マスタ一覧に戻る
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">法人マスタ詳細</h1>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <DetailField label="利用者ID" value={selectedRecord.userId} />
                <DetailField label="法人名・施設名" value={selectedRecord.corporationFacilityName} />
                <div className="md:col-span-2">
                <DetailField label="郵便番号" value={`〒${selectedRecord.postalCode}`} />
                </div>
                <DetailField label="都道府県" value={selectedRecord.prefecture} />
                <DetailField label="市区町村以降" value={selectedRecord.address} />
                <DetailField label="電話番号" value={selectedRecord.phone} />
                <DetailField label="メールアドレス" value={selectedRecord.email} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">担当者情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <DetailField label="担当者名" value={selectedRecord.contactName} />
                <DetailField label="担当者名カナ" value={selectedRecord.contactNameKana} />
                <div className="md:col-span-2">
                <DetailField label="役職/部署" value={selectedRecord.contactDepartment} />
                </div>
                <DetailField label="電話番号" value={selectedRecord.contactPhone} />
                <DetailField label="担当者メールアドレス" value={selectedRecord.contactEmail} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">送金先口座</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                <DetailField label="金融機関名" value={selectedRecord.bankName} />
                <DetailField label="金融機関コード" value={selectedRecord.bankCode} />
                <DetailField label="支店名" value={selectedRecord.branchName} />
                <DetailField label="支店コード" value={selectedRecord.branchCode} />
                <DetailField label="預金種別" value={selectedRecord.accountType} />
                <DetailField label="口座番号" value={selectedRecord.accountNumber} />
                <DetailField label="口座名義人" value={selectedRecord.accountHolder} />
                <DetailField label="口座名義人カナ" value={selectedRecord.accountHolderKana} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">法人マスタ</h1>
          <p className="text-gray-500 mt-1">法人・施設のマスタ情報を管理します</p>
        </div>
        <Button onClick={handleExportCsv} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          CSVエクスポート
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">利用者ID</label>
                <Input
                  placeholder="KG01..."
                  value={filters.userId}
                  onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">法人名・施設名</label>
                <Input
                  placeholder="法人名・施設名で検索..."
                  value={filters.corporationFacilityName}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, corporationFacilityName: e.target.value }))
                  }
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">担当者名</label>
                <Input
                  placeholder="担当者名で検索..."
                  value={filters.contactName}
                  onChange={(e) => setFilters((f) => ({ ...f, contactName: e.target.value }))}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">役職/部署</label>
                <Input
                  placeholder="役職/部署で検索..."
                  value={filters.contactDepartment}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, contactDepartment: e.target.value }))
                  }
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">担当者メールアドレス</label>
                <Input
                  placeholder="example@..."
                  value={filters.contactEmail}
                  onChange={(e) => setFilters((f) => ({ ...f, contactEmail: e.target.value }))}
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
            {filteredRecords.length} 件中{" "}
            {filteredRecords.length === 0 ? 0 : startIndex + 1} -{" "}
            {Math.min(startIndex + CORPORATION_MASTER_ITEMS_PER_PAGE, filteredRecords.length)} 件を表示
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-28">
                    利用者ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    法人名・施設名
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">
                    担当者名
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-32">
                    役職/部署
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    担当者メールアドレス
                  </th>
                  {canEdit && (
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      担当者情報変更
                    </th>
                  )}
                  {canEdit && (
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      送金先口座申請
                    </th>
                  )}
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-16">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">{r.userId}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{r.corporationFacilityName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{r.contactName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{r.contactDepartment}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{r.contactEmail}</td>
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openDialog(r, "担当者情報変更")}
                            title="担当者情報変更"
                            className="p-1.5 rounded transition-colors hover:bg-blue-50 text-blue-600 hover:text-blue-800"
                          >
                            <UserCog className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openDialog(r, "送金先口座申請")}
                            title="送金先口座申請"
                            disabled={daiiSubmittedIds.has(r.id)}
                            className={cn(
                              "p-1.5 rounded transition-colors",
                              daiiSubmittedIds.has(r.id)
                                ? "text-gray-300 cursor-not-allowed"
                                : "hover:bg-purple-50 text-purple-500 hover:text-purple-800"
                            )}
                          >
                            <Landmark className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedRecord(r)}
                          title="詳細"
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableColSpan} className="py-8 text-center text-gray-500">
                      該当する法人が見つかりませんでした
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

      {dialogType && dialogRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`bg-white rounded-xl shadow-xl w-full ${
              dialogType === "担当者情報変更" || dialogType === "送金先口座申請"
                ? "max-w-4xl"
                : "max-w-md"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{dialogType}</h2>
              <button onClick={closeDialog} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {dialogType === "担当者情報変更" && (
                <ChangeBeforeAfterLayout>
                  <ChangeBeforeAfterRow
                    label="担当者氏名"
                    before={dialogRecord.contactName}
                    after={
                      <Input
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="担当者氏名カナ"
                    before={dialogRecord.contactNameKana}
                    after={
                      <Input
                        value={staffNameKana}
                        onChange={(e) => setStaffNameKana(e.target.value)}
                        placeholder="例：ヤマダ タロウ"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="役職/部署"
                    before={dialogRecord.contactDepartment}
                    after={
                      <Input
                        value={staffDepartment}
                        onChange={(e) => setStaffDepartment(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="電話番号"
                    before={dialogRecord.phone}
                    after={
                      <Input
                        value={staffPhone}
                        onChange={(e) => setStaffPhone(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="メールアドレス"
                    before={dialogRecord.email}
                    after={
                      <Input
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="bg-white"
                      />
                    }
                  />
                </ChangeBeforeAfterLayout>
              )}

              {dialogType === "送金先口座申請" && (
                <ChangeBeforeAfterLayout>
                  <ChangeBeforeAfterRow
                    label="金融機関コード"
                    before={dialogRecord.bankCode}
                    after={
                      <Input
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        placeholder="例：0001"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="金融機関名"
                    before={dialogRecord.bankName}
                    after={
                      <Input
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="例：〇〇銀行"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="支店コード"
                    before={dialogRecord.branchCode}
                    after={
                      <Input
                        value={branchCode}
                        onChange={(e) => setBranchCode(e.target.value)}
                        placeholder="例：001"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="支店名"
                    before={dialogRecord.branchName}
                    after={
                      <Input
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        placeholder="例：〇〇支店"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="預金種別"
                    before={dialogRecord.accountType}
                    after={
                      <select
                        value={bankAccountType}
                        onChange={(e) => setBankAccountType(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    before={dialogRecord.accountNumber}
                    after={
                      <Input
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="1234567"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="口座名義人"
                    before={dialogRecord.accountHolder}
                    after={
                      <Input
                        value={bankAccountHolder}
                        onChange={(e) => setBankAccountHolder(e.target.value)}
                        placeholder="例：ヤマダタロウ"
                        className="bg-white"
                      />
                    }
                  />
                  <ChangeBeforeAfterRow
                    label="口座名義人カナ"
                    before={dialogRecord.accountHolderKana}
                    after={
                      <Input
                        value={bankAccountHolderKana}
                        onChange={(e) => setBankAccountHolderKana(e.target.value)}
                        placeholder="例：ヤマダタロウ"
                        className="bg-white"
                      />
                    }
                  />
                </ChangeBeforeAfterLayout>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button variant="outline" onClick={closeDialog}>
                キャンセル
              </Button>
              <Button
                onClick={handleDialogSubmitClick}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
              >
                申請
              </Button>
            </div>
          </div>
        </div>
      )}

      {submitConfirmOpen && dialogType && dialogRecord && (
        <SubmitConfirmDialog
          open={submitConfirmOpen}
          title={dialogType}
          message={SUBMIT_CONFIRM_MESSAGES[dialogType]}
          onCancel={() => setSubmitConfirmOpen(false)}
          onConfirm={handleDialogSubmit}
        />
      )}
    </div>
  )
}
