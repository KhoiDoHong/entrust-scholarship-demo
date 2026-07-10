import type { Application } from "@/lib/applications-data"
import { formatDateTimeDisplay, toISODateString } from "@/lib/utils"

export type ApplicationExchangeKind = "deficiency" | "comment"

export const APPLICATION_EXCHANGE_KIND_LABELS: Record<
  ApplicationExchangeKind,
  string
> = {
  deficiency: "不備コメント",
  comment: "返信コメント",
}

export interface ApplicationExchangeEntry {
  createdAt: string
  createdByName: string
  kind: ApplicationExchangeKind
  comment: string
}

function normalizeEntry(
  raw: NonNullable<Application["exchanges"]>[number]
): ApplicationExchangeEntry {
  return {
    createdAt: formatDateTimeDisplay(raw.createdAt),
    createdByName: raw.createdByName,
    kind: raw.kind ?? "comment",
    comment: raw.comment,
  }
}

/** 申請詳細のやり取り履歴 — exchanges + 不備/コメントから組み立て */
export function getApplicationExchangeHistory(
  app: Application
): ApplicationExchangeEntry[] {
  if (app.exchanges?.length) {
    return app.exchanges.map(normalizeEntry)
  }

  const entries: ApplicationExchangeEntry[] = []

  if (app.deficiencyMessage?.trim()) {
    entries.push({
      createdAt: toISODateString(app.school.receptionDate),
      createdByName: "イントラスト 審査担当",
      kind: "deficiency",
      comment: app.deficiencyMessage.trim(),
    })
  }

  if (app.statusType === "edited" && app.remarks?.trim()) {
    const remarks = app.remarks.trim()
    if (remarks !== app.deficiencyMessage?.trim()) {
      entries.push({
        createdAt: toISODateString(app.school.receptionDate),
        createdByName: app.school.schoolName,
        kind: "comment",
        comment: remarks,
      })
    }
  }

  return entries
}
