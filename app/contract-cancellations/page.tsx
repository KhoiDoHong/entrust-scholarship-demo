"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import {
  approvedApps,
  filterAppsByRole,
  matchesContractFilters,
  EMPTY_CONTRACT_FILTERS,
  type ContractNotificationFilters,
} from "@/lib/contract-notifications"
import {
  getContractNotificationState,
  subscribeContractNotifications,
  getConfirmedContracts,
  type ConfirmedContract,
} from "@/lib/contracts-store"
import { ContractNotificationListView, type ContractNotificationRow } from "@/components/contract-notification-list-view"
import { ContractDetailView } from "@/components/contract-detail-view"

export default function ContractCancellationsPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [notificationState, setNotificationState] = useState(getContractNotificationState)
  const [filters, setFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [selectedContract, setSelectedContract] = useState<ConfirmedContract | null>(null)

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
    return subscribeContractNotifications(() => setNotificationState(getContractNotificationState()))
  }, [])

  const cancelledList = useMemo(() => {
    return filterAppsByRole(
      approvedApps
        .filter((a) => notificationState.cancelledIds.includes(a.id))
        .filter((a) => matchesContractFilters(a, appliedFilters)),
      currentUser
    )
  }, [notificationState.cancelledIds, appliedFilters, currentUser])

  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...filters })
  }, [filters])

  const handleClear = useCallback(() => {
    setFilters({ ...EMPTY_CONTRACT_FILTERS })
    setAppliedFilters({ ...EMPTY_CONTRACT_FILTERS })
  }, [])

  const openContractDetail = useCallback((row: ContractNotificationRow) => {
    const app = approvedApps.find((a) => a.id === row.id)
    const existing = getConfirmedContracts().find(
      (c) =>
        c.contractNumber === row.contractNumber ||
        (app != null && c.applicationNumber === app.applicationNumber)
    )
    const base: ConfirmedContract = existing ?? {
      id: row.id,
      applicationNumber: app?.applicationNumber ?? "",
      contractNumber: row.contractNumber,
      corporationName: row.corporationName,
      facilityName: row.facilityName,
      studentName: row.studentName,
      approvedDate: app?.approvedDate,
      confirmedDate: "",
      status: "確定済み",
    }
    setSelectedContract({
      ...base,
      status: "キャンセル",
    })
  }, [])

  if (selectedContract) {
    return (
      <DashboardLayout>
        <ContractDetailView
          contract={selectedContract}
          onBack={() => setSelectedContract(null)}
          backLabel="契約キャンセル一覧に戻る"
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ContractNotificationListView
        title="契約キャンセル一覧"
        subtitle="キャンセルされた契約の一覧です。"
        rows={cancelledList}
        emptyMessage="キャンセルされた契約はありません"
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleSearch}
        onClear={handleClear}
        showActionColumn
        onViewRow={openContractDetail}
      />
    </DashboardLayout>
  )
}
