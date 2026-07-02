"use client"

import { useState } from "react"
import { AlertCircle, ArrowLeft, RotateCcw, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ContractStatusBadge } from "@/components/status-badge"
import {
  SubmitConfirmDialog,
  SUBMIT_CONFIRM_MESSAGES,
} from "@/components/submit-confirm-dialog"
import {
  getSubrogationRequestForDisplay,
  isSubrogationDetailStatus,
} from "@/lib/subrogation-request-shared"
import { corpFacilityLabel } from "@/lib/contract-notifications"
import { getContractRemarksDisplay } from "@/lib/contract-list-utils"
import { findCorporationMasterForContract } from "@/lib/corporation-master-data"
import { getPriorNotices, type ConfirmedContract } from "@/lib/contracts-store"
import type { Application } from "@/lib/applications-data"
import { getApplications } from "@/lib/applications-store"
import type { CorporationMasterRecord } from "@/lib/corporation-master-data"

function findApplicationForContract(
  contract: ConfirmedContract
): Application | undefined {
  const apps = getApplications()
  if (contract.contractNumber && contract.contractNumber !== "-") {
    const byContract = apps.find(
      (a) => a.contractNumber === contract.contractNumber
    )
    if (byContract) return byContract
  }
  return apps.find((a) => a.applicationNumber === contract.applicationNumber)
}

type PartyDisplay = {
  guarantorFacilityLabel: string
  guarantorPostalCode: string
  guarantorPrefecture: string
  guarantorAddress: string
  guarantorPhone: string
  guarantorEmail: string
  guarantorContactName: string
  guarantorContactNameKana: string
  contractorName: string
  contractorNameKana: string
  contractorPostalCode: string
  contractorPrefecture: string
  contractorAddress: string
  contractorPhone: string
  contractorEmail: string
}

function buildPartyDisplay(
  contract: ConfirmedContract,
  app: Application | undefined,
  master: CorporationMasterRecord | undefined
): PartyDisplay {
  if (app) {
    return {
      guarantorFacilityLabel: corpFacilityLabel(app.applicant),
      guarantorPostalCode: app.student.postalCode,
      guarantorPrefecture: app.student.prefecture,
      guarantorAddress: app.student.address,
      guarantorPhone: app.applicant.phone,
      guarantorEmail: app.applicant.email,
      guarantorContactName: app.applicant.contactName,
      guarantorContactNameKana: app.applicant.contactNameKana,
      contractorName: `${app.student.lastName} ${app.student.firstName}`,
      contractorNameKana: `${app.student.lastNameKana} ${app.student.firstNameKana}`,
      contractorPostalCode: app.student.postalCode,
      contractorPrefecture: app.student.prefecture,
      contractorAddress: app.student.address,
      contractorPhone: app.student.phone,
      contractorEmail: app.student.email,
    }
  }

  return {
    guarantorFacilityLabel: corpFacilityLabel(contract),
    guarantorPostalCode: master?.postalCode ?? "",
    guarantorPrefecture: master?.prefecture ?? "",
    guarantorAddress: master?.address ?? "",
    guarantorPhone: master?.phone ?? "",
    guarantorEmail: master?.email ?? "",
    guarantorContactName: master?.contactName ?? "",
    guarantorContactNameKana: master?.contactNameKana ?? "",
    contractorName: contract.studentName,
    contractorNameKana: "",
    contractorPostalCode: "",
    contractorPrefecture: "",
    contractorAddress: "",
    contractorPhone: "",
    contractorEmail: "",
  }
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 text-sm">{value ?? "-"}</p>
    </div>
  )
}

export interface ContractDetailViewProps {
  contract: ConfirmedContract
  onBack: () => void
  backLabel?: string
  notices?: Record<number, { text: string; date: string }[]>
  subrogationReviewActions?: {
    onConfirm: () => void
    onReject: (comment: string) => void
  }
}

export function ContractDetailView({
  contract,
  onBack,
  backLabel = "一覧に戻る",
  notices = {},
  subrogationReviewActions,
}: ContractDetailViewProps) {
  const app = findApplicationForContract(contract)
  const remittanceAccount = findCorporationMasterForContract(
    contract.corporationName,
    contract.facilityName
  )
  const subrogation = isSubrogationDetailStatus(contract.status)
    ? getSubrogationRequestForDisplay(contract)
    : undefined
  const contractNotices =
    notices?.[contract.id]?.length ? notices[contract.id]! : getPriorNotices(contract.id)
  const contractNoticesNewestFirst = [...contractNotices].reverse()
  const canShowPriorNotices =
    contract.status !== "確定待ち" &&
    contract.status !== "取り下げ" &&
    contract.status !== "キャンセル"
  const party = buildPartyDisplay(contract, app, remittanceAccount)
  const rejectionComment = getContractRemarksDisplay(contract)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewCommentError, setReviewCommentError] = useState("")
  const [pendingReviewAction, setPendingReviewAction] = useState<"reject" | "confirm" | null>(
    null
  )

  const openRejectConfirm = () => {
    const trimmed = reviewComment.trim()
    if (!trimmed) {
      setReviewCommentError("コメントを入力してください。")
      return
    }
    setReviewCommentError("")
    setPendingReviewAction("reject")
  }

  const executePendingReviewAction = () => {
    if (!subrogationReviewActions || !pendingReviewAction) return
    if (pendingReviewAction === "reject") {
      subrogationReviewActions.onReject(reviewComment.trim())
    } else {
      subrogationReviewActions.onConfirm()
    }
    setPendingReviewAction(null)
  }

  const priorNoticesSection =
    canShowPriorNotices && contractNoticesNewestFirst.length > 0 ? (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">事前通知</h2>
          <div className="space-y-4">
            {contractNoticesNewestFirst.map((n, i) => (
              <div
                key={`${n.date}-${i}`}
                className="border border-gray-100 rounded-lg p-4 bg-gray-50"
              >
                <p className="text-xs text-gray-400 mb-2">{n.date}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ) : null

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">契約詳細</h1>
            <ContractStatusBadge status={contract.status} size="md" variant="icon" />
          </div>
          <p className="text-gray-500 mt-1">{contract.contractNumber}</p>
        </div>
      </div>

      {rejectionComment && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-orange-600 font-medium">差し戻しコメント</h3>
              <p className="text-orange-600 text-sm mt-1 whitespace-pre-wrap">{rejectionComment}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {priorNoticesSection}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">契約連帯保証人</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="col-span-2">
                    <DetailRow label="法人名・施設名" value={party.guarantorFacilityLabel} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">郵便番号</p>
                    <p className="text-gray-900 text-sm">
                      {party.guarantorPostalCode ? `〒${party.guarantorPostalCode}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">都道府県</p>
                    <p className="text-gray-900 text-sm">{party.guarantorPrefecture || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">市区町村以降</p>
                    <p className="text-gray-900 text-sm">{party.guarantorAddress || "-"}</p>
                  </div>
                  <DetailRow label="電話番号" value={party.guarantorPhone} />
                  <DetailRow label="メールアドレス" value={party.guarantorEmail} />
                  <DetailRow label="担当者氏名" value={party.guarantorContactName} />
                  <DetailRow label="担当者氏名（カナ）" value={party.guarantorContactNameKana} />
                  <DetailRow label="担当者電話番号" value={party.guarantorPhone} />
                  <DetailRow label="担当者メールアドレス" value={party.guarantorEmail} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">契約者</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <DetailRow label="契約者" value={party.contractorName} />
                  <DetailRow
                    label="契約者（カナ）"
                    value={party.contractorNameKana || undefined}
                  />
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">郵便番号</p>
                    <p className="text-gray-900 text-sm">
                      {party.contractorPostalCode ? `〒${party.contractorPostalCode}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">都道府県</p>
                    <p className="text-gray-900 text-sm">{party.contractorPrefecture || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">市区町村以降</p>
                    <p className="text-gray-900 text-sm">{party.contractorAddress || "-"}</p>
                  </div>
                  <DetailRow label="電話番号" value={party.contractorPhone} />
                  <DetailRow label="メールアドレス" value={party.contractorEmail} />
                </div>
              </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">送金先口座</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <DetailRow label="金融機関名" value={remittanceAccount?.bankName} />
              <DetailRow label="金融機関コード" value={remittanceAccount?.bankCode} />
              <DetailRow label="支店名" value={remittanceAccount?.branchName} />
              <DetailRow label="支店コード" value={remittanceAccount?.branchCode} />
              <DetailRow label="預金種別" value={remittanceAccount?.accountType} />
              <DetailRow label="口座番号" value={remittanceAccount?.accountNumber} />
              <DetailRow label="口座名義人" value={remittanceAccount?.accountHolder} />
              <DetailRow label="口座名義人カナ" value={remittanceAccount?.accountHolderKana} />
            </div>
          </CardContent>
        </Card>

        {subrogation && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-3">弁済依頼</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <DetailRow label="返還請求金額" value={subrogation.repaymentRequestAmount} />
              <div className="md:col-span-2">
                <DetailRow label="貸付金返済の請求書" value={subrogation.repaymentInvoiceFile} />
              </div>
              <div className="md:col-span-2">
                <DetailRow label="個人情報利用の同意書" value={subrogation.privacyConsentFile} />
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      {subrogationReviewActions && contract.status === "代位弁済依頼中" && (
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="subrogation-review-comment" className="text-sm font-medium text-gray-700">
              コメント
            </label>
            <Textarea
              id="subrogation-review-comment"
              value={reviewComment}
              onChange={(e) => {
                setReviewComment(e.target.value)
                if (reviewCommentError) setReviewCommentError("")
              }}
              placeholder="差し戻しの場合はコメントを入力してください"
              rows={4}
              className="bg-white resize-y"
            />
            {reviewCommentError && (
              <p className="text-sm text-red-600">{reviewCommentError}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={openRejectConfirm}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              差し戻し
            </Button>
            <Button
              type="button"
              onClick={() => setPendingReviewAction("confirm")}
              className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2"
            >
              <Send className="w-4 h-4" />
              確認
            </Button>
          </div>
        </div>
      )}

      {pendingReviewAction === "reject" && (
        <SubmitConfirmDialog
          open
          title="差し戻し"
          message={SUBMIT_CONFIRM_MESSAGES["弁済依頼差し戻し"]}
          confirmLabel="差し戻す"
          onCancel={() => setPendingReviewAction(null)}
          onConfirm={executePendingReviewAction}
        />
      )}
      {pendingReviewAction === "confirm" && (
        <SubmitConfirmDialog
          open
          title="確認"
          message={SUBMIT_CONFIRM_MESSAGES["弁済依頼確認"]}
          confirmLabel="確認する"
          onCancel={() => setPendingReviewAction(null)}
          onConfirm={executePendingReviewAction}
        />
      )}
    </div>
  )
}
