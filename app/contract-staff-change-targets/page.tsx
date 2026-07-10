"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ContractManagementListView } from "@/components/contract-management-list-view"
import { SUBMIT_CONFIRM_MESSAGES } from "@/components/submit-confirm-dialog"

export default function ContractStaffChangeTargetsPage() {
  return (
    <DashboardLayout>
      <ContractManagementListView
        title="担当者変更対象"
        subtitle="担当者変更の対象となる契約の一覧です"
        showJobcan
        showBulkSelection
        showBulkReject={false}
        acknowledgeWorkflowKey="staff-change"
        applyDialog={{
          title: "ジョブカン編集",
          submitLabel: "保存",
          confirmMessage: SUBMIT_CONFIRM_MESSAGES["ジョブカン編集"],
        }}
        contractPredicate={(c) => c.status === "確定済み"}
      />
    </DashboardLayout>
  )
}
