import { toast } from "@/hooks/use-toast"

export type ModalSubmitSuccessOptions = {
  title: string
  description?: string
  onClose: () => void
  onRefresh?: () => void
}

/** Close modal, refresh list data, and show a success toast. */
export function completeModalSubmitSuccess({
  title,
  description,
  onClose,
  onRefresh,
}: ModalSubmitSuccessOptions) {
  onClose()
  onRefresh?.()
  toast({
    variant: "success",
    title,
    ...(description ? { description } : {}),
  })
}

export const MODAL_SUCCESS_MESSAGES = {
  userCreated: "ユーザを作成しました",
  userActivated: "ユーザを有効化しました",
  userDeactivated: "ユーザを無効化しました",
  contractorInfoChanged: "契約者情報の変更を申請しました",
  guarantorChanged: "連帯保証人の変更を申請しました",
  priorNoticeSent: "事前通知を送信しました",
  subrogationRequested: "代位弁済依頼を申請しました",
  staffInfoChanged: "担当者情報の変更を申請しました",
  remittanceAccountApplied: "送金先口座の申請を行いました",
  jobcanUpdated: "ジョブカンを更新しました",
  remittanceAccountSubmitted: "送金先口座申請を送信しました",
  completionReported: "完済完了報告を行いました",
  documentsUploaded: "書類をアップロードしました",
  contractsConfirmed: "選択した契約を確定しました",
  contractsCancelled: "選択した契約をキャンセルしました",
  contractsWithdrawn: "選択した契約を取り下げしました",
  subrogationConfirmed: "弁済依頼を確認しました",
  subrogationRejected: "弁済依頼を差し戻しました",
  bulkConfirmed: "選択した契約を確認しました",
  bulkRejected: "選択した契約を差し戻しました",
  passwordChanged: "パスワードを変更しました",
} as const
