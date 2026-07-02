"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ContractManagementListView } from "@/components/contract-management-list-view"
import { SUBMIT_CONFIRM_MESSAGES } from "@/components/submit-confirm-dialog"

export default function ContractRemittanceAccountTargetsPage() {
  return (
    <DashboardLayout>
      <ContractManagementListView
        title="送金先口座申請対象"
        subtitle="送金先口座申請の対象となる契約の一覧です"
        showJobcan
        showBulkSelection
        showBulkReject={false}
        acknowledgeWorkflowKey="remittance-account"
        applyDialog={{
          title: "送金先口座申請",
          submitLabel: "申請",
          confirmMessage: SUBMIT_CONFIRM_MESSAGES["送金先口座申請"],
        }}
        contractPredicate={(c) =>
          c.status === "確定済み" ||
          c.status === "代位弁済依頼中" ||
          c.status === "弁済依頼差し戻し"
        }
      />
    </DashboardLayout>
  )
}
