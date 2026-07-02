import {
  APPLICATION_STATUS_LABELS,
} from "@/lib/application-status-styles"
import {
  initialApplications,
  demoDocumentFileName,
  type Application,
} from "@/lib/applications-data"
import type { ApplicationExchangeEntry } from "@/lib/application-exchange-history"

export type { Application }

let _applications: Application[] = initialApplications.map((a) => ({ ...a }))

export function getApplications(): Application[] {
  return _applications
}

export function getApplicationById(id: number): Application | undefined {
  return _applications.find((a) => a.id === id)
}

/** 一覧の備考列 — 修正済みは remarks、不備ありは不備コメント */
export function getApplicationRemarksDisplay(app: Application): string {
  if (app.statusType === "edited") {
    return (
      app.remarks?.trim() ||
      app.deficiencyMessage?.trim() ||
      ""
    )
  }
  if (app.statusType === "warning") {
    return app.deficiencyMessage?.trim() || app.remarks?.trim() || ""
  }
  return ""
}

export function hasApplicationRemarks(app: Application): boolean {
  return getApplicationRemarksDisplay(app).length > 0
}

/** 不備あり → 修正済み。備考 = 返信内容、空なら不備コメントを引き継ぐ */
export function completeApplicationCorrection(
  id: number,
  replyComment: string
): Application | null {
  const idx = _applications.findIndex((a) => a.id === id)
  if (idx === -1) return null

  const app = _applications[idx]
  if (app.statusType !== "warning") return null

  const remarks =
    replyComment.trim() ||
    app.deficiencyMessage?.trim() ||
    app.remarks?.trim() ||
    ""

  const commentEntry: ApplicationExchangeEntry = {
    createdAt: new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdByName: app.school.schoolName,
    kind: "comment",
    comment: remarks,
  }

  const existingExchanges = app.exchanges ?? []
  const hasDeficiencyInHistory = existingExchanges.some(
    (e) => (e.kind ?? "comment") === "deficiency"
  )
  const deficiencyEntries: ApplicationExchangeEntry[] =
    !hasDeficiencyInHistory && app.deficiencyMessage?.trim()
      ? [
          {
            createdAt: app.school.receptionDate,
            createdByName: "イントラスト 審査担当",
            kind: "deficiency",
            comment: app.deficiencyMessage.trim(),
          },
        ]
      : []

  const updated: Application = {
    ...app,
    status: APPLICATION_STATUS_LABELS[2],
    statusType: "edited",
    missingDocuments: [],
    remarks,
    exchanges: [...existingExchanges, ...deficiencyEntries, commentEntry],
    documents: app.documents.map((doc) => ({
      ...doc,
      submitted: true,
      fileName: doc.fileName ?? demoDocumentFileName(doc.name),
    })),
  }

  _applications = _applications.map((a, i) => (i === idx ? updated : a))
  return updated
}
