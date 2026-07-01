"use client"

import Image from "next/image"
import { Upload, FileText, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type DocumentUploadSpec = {
  id: string
  title: string
  description?: string
  supportedFormats: string
  sampleImage: string
  sampleCaption: string
  required?: boolean
}

type DocumentUploadFieldProps = {
  doc: DocumentUploadSpec
  file?: { name: string; size: string }
  error?: string
  compact?: boolean
  onUpload: () => void
  onRemove: () => void
}

export function DocumentUploadField({
  doc,
  file,
  error,
  compact = false,
  onUpload,
  onRemove,
}: DocumentUploadFieldProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      onUpload()
    }
  }

  return (
    <div className={cn("border rounded-lg bg-white", compact ? "p-3" : "p-5")}>
      <div className={compact ? "mb-2" : "mb-4"}>
        <Label className={compact ? "text-sm" : "text-base"}>
          {doc.title} {doc.required !== false && <span className="text-red-500">*</span>}
        </Label>
        {doc.description && (
          <p className={cn("text-gray-500 mt-0.5", compact ? "text-xs line-clamp-1" : "text-sm mt-1")}>
            {doc.description}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">対応形式: {doc.supportedFormats}</p>
      </div>

      <div className={cn("space-y-3", !compact && "space-y-4")}>
        <div className={cn("bg-gray-50 rounded-lg", compact ? "p-2" : "p-3")}>
          <p className="text-xs font-medium text-gray-600 mb-1.5">サンプル画像（参考）</p>
          <div className="relative rounded-md overflow-hidden border border-gray-200 bg-white">
            <Image
              src={doc.sampleImage}
              alt={`${doc.title}のサンプル`}
              width={600}
              height={300}
              className={cn("w-full object-cover", compact ? "h-20" : "h-44")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p
              className={cn(
                "absolute bottom-0 left-0 right-0 text-white",
                compact ? "px-2 py-1 text-[10px] leading-tight line-clamp-2" : "px-3 py-2 text-xs"
              )}
            >
              {doc.sampleCaption}
            </p>
          </div>
        </div>

        <div>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer",
              compact ? "p-3" : "p-6"
            )}
            onClick={onUpload}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onUpload()
              }
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className={cn("text-gray-400 mx-auto", compact ? "w-5 h-5 mb-1" : "w-8 h-8 mb-2")} />
            <p className={cn("text-gray-600", compact ? "text-xs" : "text-sm")}>
              {file
                ? "クリックしてファイルを差し替え"
                : "クリックまたはドラッグ&ドロップでアップロード"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{doc.supportedFormats} (10MB以下)</p>
          </div>

          <div className={cn(compact ? "mt-2 min-h-[40px]" : "mt-3 min-h-[52px]")}>
            {file && (
              <div
                className={cn(
                  "bg-green-50 rounded-lg flex items-center justify-between",
                  compact ? "p-2" : "p-3"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className={cn("shrink-0 text-green-600", compact ? "w-4 h-4" : "w-5 h-5")} />
                  <div className="min-w-0">
                    <p className={cn("font-medium text-gray-900 truncate", compact ? "text-xs" : "text-sm")}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{file.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 hover:bg-green-100 rounded shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          <div className="min-h-4 mt-0.5">
            <p className={cn("leading-4 text-red-600", compact ? "text-xs" : "text-sm leading-5")}>
              {error ?? ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
