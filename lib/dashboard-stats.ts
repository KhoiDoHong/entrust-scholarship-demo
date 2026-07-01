import type { UserAccount } from "@/lib/auth"
import { getApplications } from "@/lib/applications-store"
import { filterApplicationsByRole, filterContractsByRole } from "@/lib/data-scope"
import { approvedApps, filterAppsByRole } from "@/lib/contract-notifications"
import {
  getConfirmedContracts,
  getContractNotificationState,
} from "@/lib/contracts-store"
import { APPLICATION_STATUS_LABELS } from "@/lib/application-status-styles"
import { DASHBOARD_CONTRACT_STATUSES } from "@/lib/contract-status-styles"

export function countPendingContractConfirmations(user: UserAccount | null): number {
  const state = getContractNotificationState()
  const { pendingIds, confirmedPendingIds, cancelledIds, withdrawnPendingIds } = state
  return filterAppsByRole(
    approvedApps.filter(
      (a) =>
        pendingIds.includes(a.id) &&
        !confirmedPendingIds.includes(a.id) &&
        !cancelledIds.includes(a.id) &&
        !withdrawnPendingIds.includes(a.id)
    ),
    user
  ).length
}

export function getDashboardApplicationCounts(user: UserAccount | null): Record<string, number> {
  const visible = filterApplicationsByRole(getApplications(), user)
  return Object.fromEntries(
    APPLICATION_STATUS_LABELS.map((status) => [
      status,
      visible.filter((a) => a.status === status).length,
    ])
  )
}

export function getDashboardContractCounts(user: UserAccount | null): Record<string, number> {
  const visible = filterContractsByRole(
    getConfirmedContracts().filter((c) => c.status !== "取り下げ"),
    user
  )
  const counts = Object.fromEntries(
    DASHBOARD_CONTRACT_STATUSES.filter((s) => s !== "確定待ち").map((status) => [
      status,
      visible.filter((c) => c.status === status).length,
    ])
  ) as Record<string, number>
  counts["確定待ち"] = countPendingContractConfirmations(user)
  return counts
}
