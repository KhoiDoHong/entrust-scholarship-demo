"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ContractManagementListView } from "@/components/contract-management-list-view"
import { isPriorNotificationTarget } from "@/lib/contracts-store"

export default function ContractPriorNotificationTargetsPage() {
  return (
    <DashboardLayout>
      <ContractManagementListView
        title="事前通知対象"
        subtitle="事前通知が送信された契約の一覧です"
        showPriorNoticeColumn
        showBulkSelection
        showBulkReject={false}
        acknowledgeWorkflowKey="prior-notification"
        contractPredicate={isPriorNotificationTarget}
      />
    </DashboardLayout>
  )
}
