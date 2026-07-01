"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  EMPTY_CONTRACT_FILTERS,
  type ContractNotificationFilters,
} from "@/lib/contract-notifications"

interface ContractNotificationFiltersPanelProps {
  filters: ContractNotificationFilters
  onFiltersChange: (filters: ContractNotificationFilters) => void
  onApply: () => void
  onClear: () => void
  showStatusFilter?: boolean
  showConfirmedDateFilter?: boolean
  showSchoolNameFilter?: boolean
  corporationNameLabel?: string
  studentNameLabel?: string
  corporationNamePlaceholder?: string
  studentNamePlaceholder?: string
  statusOptions?: { value: string; label: string }[]
  confirmedDateOptions?: { value: string; label: string }[]
}

const DEFAULT_STATUS_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "pending", label: "確定待ち" },
  { value: "withdrawn", label: "取り下げ" },
  { value: "cancelled", label: "キャンセル" },
]

export function ContractNotificationFiltersPanel({
  filters,
  onFiltersChange,
  onApply,
  onClear,
  showStatusFilter = true,
  showConfirmedDateFilter = false,
  showSchoolNameFilter = false,
  corporationNameLabel = "契約連帯保証人",
  studentNameLabel = "契約者",
  corporationNamePlaceholder = "保証人で検索...",
  studentNamePlaceholder = "契約者で検索...",
  statusOptions = DEFAULT_STATUS_OPTIONS,
  confirmedDateOptions = [{ value: "all", label: "すべて" }],
}: ContractNotificationFiltersPanelProps) {
  const set = (patch: Partial<ContractNotificationFilters>) =>
    onFiltersChange({ ...filters, ...patch })

  const columnCount =
    3 + (showSchoolNameFilter ? 1 : 0) + (showStatusFilter || showConfirmedDateFilter ? 1 : 0)

  const gridColsClass =
    columnCount === 5
      ? "md:grid-cols-5"
      : columnCount === 4
        ? "md:grid-cols-4"
        : "md:grid-cols-3"

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
      <div className={`grid grid-cols-1 gap-3 ${gridColsClass}`}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">契約番号</label>
          <Input
            placeholder="CON-2024-..."
            value={filters.contractNumber}
            onChange={(e) => set({ contractNumber: e.target.value })}
            className="bg-white"
          />
        </div>
        {showStatusFilter && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">ステータス</label>
            <Select
              value={filters.contractStatus}
              onValueChange={(v) => set({ contractStatus: v })}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showSchoolNameFilter && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">養成校名</label>
            <Input
              placeholder="養成校名で検索..."
              value={filters.schoolName}
              onChange={(e) => set({ schoolName: e.target.value })}
              className="bg-white"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">{corporationNameLabel}</label>
          <Input
            placeholder={corporationNamePlaceholder}
            value={filters.corporationName}
            onChange={(e) => set({ corporationName: e.target.value })}
            className="bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">{studentNameLabel}</label>
          <Input
            placeholder={studentNamePlaceholder}
            value={filters.studentName}
            onChange={(e) => set({ studentName: e.target.value })}
            className="bg-white"
          />
        </div>
        {showConfirmedDateFilter && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">確定日</label>
            <Select
              value={filters.confirmedDate || "all"}
              onValueChange={(v) => set({ confirmedDate: v })}
            >
              <SelectTrigger className="bg-white w-full">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                {confirmedDateOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          onClick={onApply}
          className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white gap-2"
        >
          <Search className="w-4 h-4" />
          検索
        </Button>
        <Button variant="outline" onClick={onClear} className="gap-2">
          <X className="w-4 h-4" />
          クリア
        </Button>
      </div>
    </div>
  )
}

export function ListResultCount({
  totalItems,
  startIndex,
  itemsPerPage,
}: {
  totalItems: number
  startIndex: number
  itemsPerPage: number
}) {
  return (
    <div className="text-sm text-gray-500 mb-4">
      {totalItems} 件中 {startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} 件を表示
    </div>
  )
}

export { EMPTY_CONTRACT_FILTERS }
