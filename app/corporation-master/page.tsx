"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CorporationMasterListView } from "@/components/corporation-master-list-view"

export default function CorporationMasterPage() {
  return (
    <DashboardLayout>
      <CorporationMasterListView />
    </DashboardLayout>
  )
}
