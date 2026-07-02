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
} from "@/lib/contracts-store"
import { ContractNotificationListView } from "@/components/contract-notification-list-view"

export default function ContractCancellationsPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [notificationState, setNotificationState] = useState(getContractNotificationState)
  const [filters, setFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })

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
      />
    </DashboardLayout>
  )
}
