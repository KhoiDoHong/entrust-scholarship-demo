"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Ban, Send } from "lucide-react"
import { ContractStatusBadge } from "@/components/status-badge"
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
  confirmPendingContracts,
  cancelPendingContracts,
} from "@/lib/contracts-store"
import { ContractNotificationListView } from "@/components/contract-notification-list-view"
import {
  SubmitConfirmDialog,
  SUBMIT_CONFIRM_MESSAGES,
} from "@/components/submit-confirm-dialog"

type PendingConfirmAction = "confirm" | "cancel" | null

export default function ContractConfirmationPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [notificationState, setNotificationState] = useState(getContractNotificationState)
  const [selectedPending, setSelectedPending] = useState<number[]>([])
  const [filters, setFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [appliedFilters, setAppliedFilters] = useState<ContractNotificationFilters>({ ...EMPTY_CONTRACT_FILTERS })
  const [pendingAction, setPendingAction] = useState<PendingConfirmAction>(null)

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
    return subscribeContractNotifications(() => setNotificationState(getContractNotificationState()))
  }, [])

  const canAccess =
    currentUser?.role === "school" ||
    currentUser?.role === "corporation" ||
    currentUser?.role === "association"
  const canConfirm = currentUser?.role === "school"

  const visiblePendingRows = useMemo(() => {
    const { pendingIds, confirmedPendingIds, withdrawnPendingIds, cancelledIds } = notificationState
    return filterAppsByRole(
      approvedApps
        .filter((a) => pendingIds.includes(a.id))
        .filter((a) => !confirmedPendingIds.includes(a.id) && !cancelledIds.includes(a.id))
        .filter((a) => matchesContractFilters(a, appliedFilters))
        .filter((a) => {
          if (appliedFilters.contractStatus === "pending") {
            return !withdrawnPendingIds.includes(a.id)
          }
          if (appliedFilters.contractStatus === "withdrawn") {
            return withdrawnPendingIds.includes(a.id)
          }
          if (appliedFilters.contractStatus === "cancelled") return false
          return true
        }),
      currentUser
    )
  }, [notificationState, appliedFilters, currentUser])

  const togglePending = (id: number) => {
    setSelectedPending((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAllPending = useCallback((pageSelectableIds: number[]) => {
    const allSelected =
      pageSelectableIds.length > 0 &&
      pageSelectableIds.every((id) => selectedPending.includes(id))
    if (allSelected) {
      setSelectedPending((prev) => prev.filter((id) => !pageSelectableIds.includes(id)))
    } else {
      setSelectedPending((prev) => [...new Set([...prev, ...pageSelectableIds])])
    }
  }, [selectedPending])

  const executePendingAction = () => {
    if (pendingAction === "confirm") {
      confirmPendingContracts(selectedPending)
      setSelectedPending([])
    } else if (pendingAction === "cancel") {
      cancelPendingContracts(selectedPending)
      setSelectedPending([])
    }
    setPendingAction(null)
  }

  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...filters })
  }, [filters])

  const handleClear = useCallback(() => {
    setFilters({ ...EMPTY_CONTRACT_FILTERS })
    setAppliedFilters({ ...EMPTY_CONTRACT_FILTERS })
  }, [])

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">読み込み中...</div>
      </DashboardLayout>
    )
  }

  if (!canAccess) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">このページへのアクセス権限がありません。</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ContractNotificationListView
        title="契約確定通知"
        subtitle={
          currentUser.role === "corporation"
            ? "法人施設に関連する契約確定待ち一覧です"
            : currentUser.role === "association"
              ? "契約確定待ちの一覧を確認できます"
              : "承認済みの案件に対して契約確定処理を行います"
        }
        rows={visiblePendingRows}
        emptyMessage="確定待ちの契約はありません"
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleSearch}
        onClear={handleClear}
        showStatusFilter
        showStatusColumn
        renderStatusCell={(row) =>
          notificationState.withdrawnPendingIds.includes(row.id) ? (
            <ContractStatusBadge status="取り下げ" />
          ) : (
            <ContractStatusBadge status="確定待ち" />
          )
        }
        selection={
          canConfirm
            ? {
                enabled: true,
                selectedIds: selectedPending,
                onToggle: togglePending,
                onToggleAll: toggleAllPending,
                isSelectable: () => true,
              }
            : undefined
        }
        footer={
          canConfirm ? (
            <div className="flex justify-end gap-3 mt-4">
              <Button
                onClick={() => setPendingAction("cancel")}
                disabled={selectedPending.length === 0}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 gap-2 disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                選択した契約をキャンセル ({selectedPending.length}件)
              </Button>
              <Button
                onClick={() => setPendingAction("confirm")}
                disabled={selectedPending.length === 0}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                選択した契約を確定 ({selectedPending.length}件)
              </Button>
            </div>
          ) : undefined
        }
      />
      {pendingAction === "cancel" && (
        <SubmitConfirmDialog
          open
          title="契約キャンセル"
          message={SUBMIT_CONFIRM_MESSAGES["契約キャンセル"]}
          confirmLabel="キャンセルする"
          onCancel={() => setPendingAction(null)}
          onConfirm={executePendingAction}
        />
      )}
      {pendingAction === "confirm" && (
        <SubmitConfirmDialog
          open
          title="契約確定"
          message={SUBMIT_CONFIRM_MESSAGES["契約確定"]}
          confirmLabel="確定する"
          onCancel={() => setPendingAction(null)}
          onConfirm={executePendingAction}
        />
      )}
    </DashboardLayout>
  )
}
