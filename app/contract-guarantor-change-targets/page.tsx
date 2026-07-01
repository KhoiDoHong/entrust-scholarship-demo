"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ContractManagementListView } from "@/components/contract-management-list-view"

export default function ContractGuarantorChangeTargetsPage() {
  return (
    <DashboardLayout>
      <ContractManagementListView
        title="連帯保証人変更対象"
        subtitle="連帯保証人変更の対象となる契約の一覧です"
        showBulkSelection
        showBulkReject={false}
        acknowledgeWorkflowKey="guarantor-change"
        contractPredicate={(c) => c.status === "確定済み"}
      />
    </DashboardLayout>
  )
}
