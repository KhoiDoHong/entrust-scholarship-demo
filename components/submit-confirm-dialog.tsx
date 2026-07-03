"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type SubmitConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export function SubmitConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "確認する",
  onCancel,
  onConfirm,
}: SubmitConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export const SUBMIT_CONFIRM_MESSAGES: Record<string, string> = {
  契約者情報変更: "契約者情報の変更を申請します。よろしいですか？",
  連帯保証人変更: "連帯保証人の変更を申請します。イントラスト確認完了まで再変更できません。よろしいですか？",
  代位弁済依頼: "代位弁済依頼を申請します。よろしいですか？",
  担当者情報変更: "担当者情報の変更を申請します。イントラスト確認完了まで再変更できません。よろしいですか？",
  送金先口座申請: "送金先口座の申請を行います。イントラスト確認完了まで再変更できません。よろしいですか？",
  弁済依頼確認: "弁済依頼を確認します。よろしいですか？",
  弁済依頼差し戻し: "弁済依頼を差し戻します。よろしいですか？",
  契約確定: "選択した契約を確定します。よろしいですか？",
  契約キャンセル: "選択した契約をキャンセルします。よろしいですか？",
}

export const WORKFLOW_BULK_CONFIRM_MESSAGES: Record<string, string> = {
  "prior-notification": "事前通知対象の契約を確認します。よろしいですか？",
  "remittance-account": "送金先口座申請対象の契約を確認します。よろしいですか？",
  "staff-change": "担当者変更対象の契約を確認します。よろしいですか？",
  "guarantor-change": "連帯保証人変更対象の契約を確認します。よろしいですか？",
}
