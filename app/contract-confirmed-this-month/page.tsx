"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Eye, RotateCcw } from "lucide-react"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import {
  confirmedThisMonth,
  corpFacilityLabel,
  matchesContractFilters,
  ITEMS_PER_PAGE,
  EMPTY_CONTRACT_FILTERS,
  type ContractNotificationFilters,
} from "@/lib/contract-notifications"
import {
  getContractNotificationState,
  subscribeContractNotifications,
  withdrawConfirmedThisMonth,
  getConfirmedContracts,
  type ConfirmedContract,
} from "@/lib/contracts-store"
import {
  ContractNotificationFiltersPanel,
  ListResultCount,
} from "@/components/contract-notification-filters"
import { ListPagination } from "@/components/list-pagination"
import { ContractDetailView } from "@/components/contract-detail-view"

export default function ConfirmedThisMonthPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [notificationState, setNotificationState] = useState(getContractNotificationState)
  const [selectedConfirmed, setSelectedConfirmed] = useState<number[]>([])
  const [filters, setFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContract, setSelectedContract] = useState<ConfirmedContract | null>(null)

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
    return subscribeContractNotifications(() => setNotificationState(getContractNotificationState()))
  }, [])

  const confirmedDateOptions = useMemo(() => {
    const dates = [
      ...new Set(
        confirmedThisMonth
          .filter((a) => notificationState.confirmedThisMonthIds.includes(a.id))
          .map((a) => a.confirmedDate)
      ),
    ].sort()
    return [
      { value: "all", label: "すべて" },
      ...dates.map((date) => ({ value: date, label: date })),
    ]
  }, [notificationState.confirmedThisMonthIds])

  const confirmedList = useMemo(() => {
    return confirmedThisMonth
      .filter((a) => notificationState.confirmedThisMonthIds.includes(a.id))
      .filter((a) => matchesContractFilters(a, appliedFilters))
  }, [notificationState.confirmedThisMonthIds, appliedFilters])

  const totalPages = Math.ceil(confirmedList.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRows = confirmedList.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const toggleConfirmed = (id: number) => {
    setSelectedConfirmed((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAllConfirmed = () => {
    const pageIds = paginatedRows.map((a) => a.id)
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedConfirmed.includes(id))
    if (allSelected) {
      setSelectedConfirmed((prev) => prev.filter((id) => !pageIds.includes(id)))
    } else {
      setSelectedConfirmed((prev) => [...new Set([...prev, ...pageIds])])
    }
  }

  const handleWithdraw = () => {
    withdrawConfirmedThisMonth(selectedConfirmed)
    setSelectedConfirmed([])
  }

  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...filters })
    setCurrentPage(1)
  }, [filters])

  const handleClear = useCallback(() => {
    setFilters({ ...EMPTY_CONTRACT_FILTERS })
    setAppliedFilters({ ...EMPTY_CONTRACT_FILTERS })
    setCurrentPage(1)
  }, [])

  const openContractDetail = useCallback((row: (typeof confirmedList)[number]) => {
    const existing = getConfirmedContracts().find(
      (c) =>
        c.contractNumber === row.contractNumber ||
        c.applicationNumber === row.applicationNumber
    )
    if (existing) {
      setSelectedContract(existing)
      return
    }
    setSelectedContract({
      id: row.id,
      applicationNumber: row.applicationNumber,
      contractNumber: row.contractNumber,
      corporationName: row.corporationName,
      facilityName: row.facilityName,
      studentName: row.studentName,
      approvedDate: row.approvedDate,
      confirmedDate: row.confirmedDate ?? "",
      status: "確定済み",
    })
  }, [confirmedList])

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">読み込み中...</div>
      </DashboardLayout>
    )
  }

  if (currentUser.role !== "entrust") {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">このページへのアクセス権限がありません。</div>
      </DashboardLayout>
    )
  }

  if (selectedContract) {
    return (
      <DashboardLayout>
        <ContractDetailView
          contract={selectedContract}
          onBack={() => setSelectedContract(null)}
          backLabel="今月確定通知一覧に戻る"
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">今月確定通知一覧</h1>
        <p className="text-gray-500 mt-1">今月確定された契約の一覧です。取り下げが可能です。</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <ContractNotificationFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleSearch}
            onClear={handleClear}
            showStatusFilter={false}
            showConfirmedDateFilter
            corporationNameLabel="契約連帯保証人"
            studentNameLabel="契約者"
            corporationNamePlaceholder="契約連帯保証人で検索..."
            studentNamePlaceholder="契約者で検索..."
            confirmedDateOptions={confirmedDateOptions}
          />

          <ListResultCount
            totalItems={confirmedList.length}
            startIndex={startIndex}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 w-10">
                    <Checkbox
                      checked={
                        paginatedRows.length > 0 &&
                        paginatedRows.every((a) => selectedConfirmed.includes(a.id))
                      }
                      onCheckedChange={toggleAllConfirmed}
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">契約番号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">契約連帯保証人</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">契約者</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">契約確定日</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((app) => (
                    <tr
                      key={app.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        selectedConfirmed.includes(app.id) ? "bg-orange-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={selectedConfirmed.includes(app.id)}
                          onCheckedChange={() => toggleConfirmed(app.id)}
                        />
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{app.contractNumber}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{corpFacilityLabel(app)}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{app.studentName}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{app.confirmedDate}</td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openContractDetail(app)}
                          title="契約詳細"
                          aria-label="契約詳細"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      今月の確定通知済み契約はありません
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

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleWithdraw}
              disabled={selectedConfirmed.length === 0}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 gap-2 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              選択した契約を取り下げ ({selectedConfirmed.length}件)
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
