"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ContractManagementListView } from "@/components/contract-management-list-view"

export default function ContractSubrogationRequestTargetsPage() {
  return (
    <DashboardLayout>
      <ContractManagementListView
        title="弁済依頼対象"
        subtitle="弁済依頼の対象となる契約の一覧です"
        detailReviewMode
        contractPredicate={(c) => c.status === "代位弁済依頼中"}
      />
    </DashboardLayout>
  )
}
