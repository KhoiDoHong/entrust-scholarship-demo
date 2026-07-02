"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, FileText, Check, AlertCircle, Upload, Plus, X } from "lucide-react"
import { formatEnrollmentDateDisplay } from "@/lib/application-wizard-shared"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { ApplicationStatusBadge } from "@/components/status-badge"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { getApplicationById } from "@/lib/applications-store"
import {
  APPLICATION_EXCHANGE_KIND_LABELS,
  getApplicationExchangeHistory,
} from "@/lib/application-exchange-history"
import { corpFacilityLabel } from "@/lib/contract-notifications"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ApplicationDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [showUploadAlert, setShowUploadAlert] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
  }, [])

  const canUpload = currentUser?.role !== "corporation" && currentUser?.role !== "association"

  const handleUploadClick = () => {
    setShowUploadAlert(false)
    setShowUploadModal(true)
  }

  const handleSubmitApplication = () => {
    if (uploadedDocs.length === 0) {
      setShowUploadAlert(true)
      return
    }
    setShowUploadAlert(false)
    // proceed with submission
  }

  const app = getApplicationById(Number(id))

  if (!app) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">申請データが見つかりません。</div>
      </DashboardLayout>
    )
  }

  const status = app.status
  const exchangeHistory = getApplicationExchangeHistory(app)

  const data = {
    applicationNumber: app.applicationNumber,
    status,
    deficiencyMessage: app.deficiencyMessage,
    applicant: app.applicant,
    student: app.student,
    school: app.school,
    documents: app.documents,
  }

  return (
    <DashboardLayout>
      <div className="p-8">

        {/* Upload required alert banner */}
        {showUploadAlert && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 mb-6">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="font-medium text-sm">書類が未アップロードです</p>
              <p className="text-sm text-red-700 mt-0.5">書類をアップロードしてから再度お試しください。</p>
            </div>
            <button
              onClick={() => setShowUploadAlert(false)}
              className="text-red-400 hover:text-red-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/applications"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            審査申請一覧に戻る
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">申請詳細</h1>
              <ApplicationStatusBadge status={data.status} size="md" />
            </div>
            <p className="text-gray-500 mt-1">{data.status === "審査中" ? "-" : data.applicationNumber}</p>
          </div>
        </div>

        {/* 不備あり — 最新の不備コメント（対応待ち） */}
        {app.statusType === "warning" && data.deficiencyMessage && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="text-orange-600 font-medium">不備コメント</h3>
                <p className="text-orange-600 text-sm mt-1 whitespace-pre-wrap">
                  {data.deficiencyMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - 3 sections */}
        <div className="space-y-6">
          {/* Row 1: 申請者 and 学生 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 申請者情報 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-3">申請者</h2>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">申込日</p>
                    <p className="text-gray-900">{data.applicant.applicationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">利用者ID</p>
                    <p className="text-gray-900">{data.applicant.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">法人名・施設名</p>
                    <p className="text-gray-900">{corpFacilityLabel(data.applicant)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">担当者名</p>
                    <p className="text-gray-900">{data.applicant.contactName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">担当者名（カナ）</p>
                    <p className="text-gray-900">{data.applicant.contactNameKana}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">電話番号（携帯推奨）</p>
                    <p className="text-gray-900">{data.applicant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">申請者メールアドレス</p>
                    <p className="text-gray-900">{data.applicant.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 学生情報 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-3">学生</h2>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">氏名</p>
                    <p className="text-gray-900">{data.student.lastName} {data.student.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">氏名カナ</p>
                    <p className="text-gray-900">{data.student.lastNameKana} {data.student.firstNameKana}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">郵便番号</p>
                    <p className="text-gray-900">〒{data.student.postalCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">住所（都道府県）</p>
                    <p className="text-gray-900">{data.student.prefecture}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">住所（市区町村以降）</p>
                    <p className="text-gray-900">{data.student.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">国籍</p>
                    <p className="text-gray-900">{data.student.nationality}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">生年月日</p>
                    <p className="text-gray-900">{data.student.birthDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">性別</p>
                    <p className="text-gray-900">{data.student.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">携帯電話番号</p>
                    <p className="text-gray-900">{data.student.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">学生メールアドレス</p>
                    <p className="text-gray-900">{data.student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">入学日・入学予定日</p>
                    <p className="text-gray-900">{formatEnrollmentDateDisplay(data.student.enrollmentDate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: 養成校使用欄 and 提出書類 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 養成校使用欄 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-3">養成校</h2>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">受付日</p>
                    <p className="text-gray-900">{data.school.receptionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">介養協 会員番号</p>
                    <p className="text-gray-900">{data.school.kaiyokyoMemberNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">養成校名</p>
                    <p className="text-gray-900">{data.school.schoolName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">受付担当者名</p>
                    <p className="text-gray-900">{data.school.receptionStaffName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">電話番号</p>
                    <p className="text-gray-900">{data.school.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">養成校メールアドレス</p>
                    <p className="text-gray-900">{data.school.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 提出書類 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b pb-3">提出書類</h2>
                <p className="text-sm text-gray-500 mb-4">必要書類の確認状況</p>

                <div className="space-y-3">
                  {data.documents.map((doc, index) => {
                    const hasFile = doc.submitted && !!doc.fileName
                    return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border",
                        doc.submitted
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className={cn(
                          "w-5 h-5 shrink-0",
                          doc.submitted ? "text-green-600" : "text-gray-400"
                        )} />
                        <div className="min-w-0">
                          <span className="text-gray-900">{doc.name}</span>
                          {hasFile && (
                            <p className="text-sm text-green-700 truncate mt-0.5">{doc.fileName}</p>
                          )}
                        </div>
                      </div>
                      {hasFile ? null : doc.submitted ? (
                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                    </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {exchangeHistory.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">
                  やり取り履歴
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 pr-4 w-28">種別</th>
                        <th className="py-2 pr-4 w-36">日時</th>
                        <th className="py-2 pr-4 w-44">登録者</th>
                        <th className="py-2">内容</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchangeHistory.map((ex, i) => (
                        <tr key={i} className="border-b border-gray-100 align-top">
                          <td className="py-3 pr-4">
                            <span
                              className={cn(
                                "inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
                                ex.kind === "deficiency"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                              )}
                            >
                              {APPLICATION_EXCHANGE_KIND_LABELS[ex.kind]}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                            {ex.createdAt}
                          </td>
                          <td className="py-3 pr-4 text-gray-900">{ex.createdByName}</td>
                          <td className="py-3 text-gray-700 whitespace-pre-wrap">
                            {ex.comment}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
