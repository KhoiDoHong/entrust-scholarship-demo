"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ContractNotificationFiltersPanel,
  ListResultCount,
} from "@/components/contract-notification-filters"
import { ListPagination } from "@/components/list-pagination"
import {
  ITEMS_PER_PAGE,
  corpFacilityLabel,
  type ContractNotificationFilters,
} from "@/lib/contract-notifications"

export type ContractNotificationRow = {
  id: number
  contractNumber: string
  corporationName: string
  facilityName: string
  studentName: string
}

interface ContractNotificationListViewProps {
  title: string
  subtitle: string
  rows: ContractNotificationRow[]
  emptyMessage: string
  filters: ContractNotificationFilters
  onFiltersChange: (filters: ContractNotificationFilters) => void
  onApply: () => void
  onClear: () => void
  showStatusFilter?: boolean
  showStatusColumn?: boolean
  renderStatusCell?: (row: ContractNotificationRow) => ReactNode
  selection?: {
    enabled: boolean
    selectedIds: number[]
    onToggle: (id: number) => void
    onToggleAll: (pageSelectableIds: number[]) => void
    isSelectable: (row: ContractNotificationRow) => boolean
  }
  footer?: ReactNode
}

export function ContractNotificationListView({
  title,
  subtitle,
  rows,
  emptyMessage,
  filters,
  onFiltersChange,
  onApply,
  onClear,
  showStatusFilter = false,
  showStatusColumn = false,
  renderStatusCell,
  selection,
  footer,
}: ContractNotificationListViewProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const handleApply = () => {
    setCurrentPage(1)
    onApply()
  }

  const handleClear = () => {
    setCurrentPage(1)
    onClear()
  }

  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRows = useMemo(
    () => rows.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [rows, startIndex]
  )

  const selectableIds = useMemo(
    () =>
      selection
        ? paginatedRows.filter(selection.isSelectable).map((r) => r.id)
        : [],
    [paginatedRows, selection]
  )

  const columnCount =
    3 + (showStatusColumn ? 1 : 0) + (selection?.enabled ? 1 : 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{subtitle}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <ContractNotificationFiltersPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            onApply={handleApply}
            onClear={handleClear}
            showStatusFilter={showStatusFilter}
          />

          <ListResultCount
            totalItems={rows.length}
            startIndex={startIndex}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {selection?.enabled && (
                    <th className="py-3 px-4 w-10">
                      <Checkbox
                        checked={
                          selectableIds.length > 0 &&
                          selectableIds.every((id) => selection.selectedIds.includes(id))
                        }
                        onCheckedChange={() => selection.onToggleAll(selectableIds)}
                      />
                    </th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">
                    契約番号
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    契約連帯保証人
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    契約者
                  </th>
                  {showStatusColumn && (
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 w-36">
                      ステータス
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => {
                    const rowSelectable =
                      selection?.enabled && selection.isSelectable(row)
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          selection?.selectedIds.includes(row.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        {selection?.enabled && (
                          <td className="py-4 px-4">
                            <Checkbox
                              checked={selection.selectedIds.includes(row.id)}
                              onCheckedChange={() => selection.onToggle(row.id)}
                              disabled={!rowSelectable}
                            />
                          </td>
                        )}
                        <td className="py-4 px-4 text-sm text-gray-900">{row.contractNumber}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {corpFacilityLabel(row)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{row.studentName}</td>
                        {showStatusColumn && renderStatusCell && (
                          <td className="py-4 px-4">{renderStatusCell(row)}</td>
                        )}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={columnCount} className="py-8 text-center text-gray-500">
                      {emptyMessage}
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

          {footer}
        </CardContent>
      </Card>
    </div>
  )
}
