"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Plus, Eye, X, Download, Upload, Edit } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ListPagination } from "@/components/list-pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge, getStatusType } from "@/components/status-badge"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getAuthenticatedSession, canEditApplication, type UserAccount } from "@/lib/auth"
import {
  getApplications,
  getApplicationRemarksDisplay,
  hasApplicationRemarks,
} from "@/lib/applications-store"
import { filterApplicationsByRole } from "@/lib/data-scope"
import { corpFacilityLabel } from "@/lib/contract-notifications"

const ITEMS_PER_PAGE = 5

export default function ApplicationsPage() {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)
  const [uploadTargetId, setUploadTargetId] = useState<number | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
  }, [])

  const canEditApplicationRow = canEditApplication(currentUser)

  const handleUploadSubmit = () => {
    setUploadTargetId(null)
    setUploadFiles([])
  }

  const roleFilteredApplications = useMemo(
    () => filterApplicationsByRole(getApplications(), currentUser),
    [currentUser, pathname]
  )

  const [searchApplicationNumber, setSearchApplicationNumber] = useState("")
  const [searchContractNumber, setSearchContractNumber] = useState("")
  const [searchSchoolName, setSearchSchoolName] = useState("")
  const [searchCorporationName, setSearchCorporationName] = useState("")
  const [searchStudentName, setSearchStudentName] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [appliedFilters, setAppliedFilters] = useState({
    applicationNumber: "",
    contractNumber: "",
    schoolName: "",
    corporationName: "",
    studentName: "",
    status: "all",
  })

  const [currentPage, setCurrentPage] = useState(1)

  const filteredApplications = useMemo(() => {
    return roleFilteredApplications.filter((app) => {
      const matchesApplicationNumber = app.applicationNumber
        .toLowerCase()
        .includes(appliedFilters.applicationNumber.toLowerCase())
      const matchesContractNumber = app.contractNumber
        .toLowerCase()
        .includes(appliedFilters.contractNumber.toLowerCase())
      const matchesSchoolName = app.school.schoolName
        .toLowerCase()
        .includes(appliedFilters.schoolName.toLowerCase())
      const matchesCorporationName = corpFacilityLabel(app)
        .toLowerCase()
        .includes(appliedFilters.corporationName.toLowerCase())
      const matchesStudentName = app.studentName
        .toLowerCase()
        .includes(appliedFilters.studentName.toLowerCase())
      const matchesStatus = appliedFilters.status === "all" || app.statusType === appliedFilters.status

      return (
        matchesApplicationNumber &&
        matchesContractNumber &&
        matchesSchoolName &&
        matchesCorporationName &&
        matchesStudentName &&
        matchesStatus
      )
    })
  }, [appliedFilters, roleFilteredApplications])

  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  const handleSearch = () => {
    setAppliedFilters({
      applicationNumber: searchApplicationNumber,
      contractNumber: searchContractNumber,
      schoolName: searchSchoolName,
      corporationName: searchCorporationName,
      studentName: searchStudentName,
      status: statusFilter,
    })
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchApplicationNumber("")
    setSearchContractNumber("")
    setSearchSchoolName("")
    setSearchCorporationName("")
    setSearchStudentName("")
    setStatusFilter("all")
    setAppliedFilters({
      applicationNumber: "",
      contractNumber: "",
      schoolName: "",
      corporationName: "",
      studentName: "",
      status: "all",
    })
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const headers = ["審査管理ID", "契約番号", "養成校名", "法人名・施設名", "学生名", "ステータス", "備考"]

    const csvData = filteredApplications.map((app) => [
      app.applicationNumber,
      app.contractNumber,
      app.school.schoolName,
      corpFacilityLabel(app),
      app.studentName,
      app.status,
      hasApplicationRemarks(app) ? getApplicationRemarksDisplay(app) : "-",
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `審査申請一覧_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">審査申請</h1>
          <p className="text-gray-500 mt-1">奨学金の審査申請一覧を管理します</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            CSVエクスポート
          </Button>
          {currentUser?.role !== "corporation" && currentUser?.role !== "association" && (
            <Link href="/applications/new">
              <Button className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2">
                <Plus className="w-4 h-4" />
                新規申請
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">審査管理ID</label>
                <Input
                  placeholder="ENT-2024-..."
                  value={searchApplicationNumber}
                  onChange={(e) => setSearchApplicationNumber(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">契約番号</label>
                <Input
                  placeholder="CON-2024-..."
                  value={searchContractNumber}
                  onChange={(e) => setSearchContractNumber(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ステータス</label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="bg-white w-full">
                    <SelectValue placeholder="すべて" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="reviewing">審査中</SelectItem>
                    <SelectItem value="warning">不備あり</SelectItem>
                    <SelectItem value="edited">修正済み</SelectItem>
                    <SelectItem value="approved">承認</SelectItem>
                    <SelectItem value="rejected">否決</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">養成校名</label>
                <Input
                  placeholder="養成校名で検索..."
                  value={searchSchoolName}
                  onChange={(e) => setSearchSchoolName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">法人名・施設名</label>
                <Input
                  placeholder="法人名・施設名で検索..."
                  value={searchCorporationName}
                  onChange={(e) => setSearchCorporationName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">学生名</label>
                <Input
                  placeholder="学生名で検索..."
                  value={searchStudentName}
                  onChange={(e) => setSearchStudentName(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleSearch}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2"
              >
                <Search className="w-4 h-4" />
                検索
              </Button>
              <Button variant="outline" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                クリア
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            {filteredApplications.length} 件中 {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredApplications.length)} 件を表示
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">審査管理ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">契約番号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">養成校名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">法人名・施設名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">学生名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">ステータス</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">備考</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.length > 0 ? (
                  paginatedApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {app.statusType === "reviewing" ? "-" : app.applicationNumber}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{app.contractNumber}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{app.school.schoolName}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{corpFacilityLabel(app)}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{app.studentName}</td>
                      <td className="py-4 px-4">
                        <StatusBadge status={app.status} type={getStatusType(app.status)} />
                      </td>
                      <td className="py-4 px-4">
                        {hasApplicationRemarks(app) ? (
                          <p className="text-xs text-gray-900 whitespace-pre-wrap">
                            {getApplicationRemarksDisplay(app)}
                          </p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/applications/${app.id}`}
                            title="詳細"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {app.statusType === "warning" && canEditApplicationRow && (
                            <Link
                              href={`/applications/${app.id}/edit`}
                              title="内容修正"
                              className="p-1.5 rounded hover:bg-orange-50 text-orange-500 hover:text-orange-700 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      該当する申請が見つかりませんでした
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {uploadTargetId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">書類アップロード</h2>
              <button onClick={() => setUploadTargetId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">クリックまたはドラッグ&ドロップで選択</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              {uploadFiles.length > 0 && (
                <ul className="space-y-1">
                  {uploadFiles.map((f, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                      <Upload className="w-3 h-3 text-gray-400" />
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button variant="outline" onClick={() => setUploadTargetId(null)}>キャンセル</Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={uploadFiles.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                アップロード
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
