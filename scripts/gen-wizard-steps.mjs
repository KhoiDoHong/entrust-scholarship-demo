import fs from "fs"

const src = fs.readFileSync("app/applications/new/page.tsx", "utf8")
const start = src.indexOf("{/* Step 1: Applicant Information */}")
const end = src.indexOf("{/* Navigation Buttons */}")
const stepsBlock = src.slice(start, end)

const header = `"use client"

import { Upload, FileText, Trash2, Check } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  WIZARD_STEPS,
  REQUIRED_DOCUMENTS,
  PREFECTURES,
  NATIONALITIES,
  FormField,
  SummaryItem,
  formatStudentGender,
  FACILITY_APPLICANTS,
  facilityApplicantLabel,
  SCHOOLS,
  type ApplicationFormData,
  type UploadedFileMap,
} from "@/lib/application-wizard-shared"

export type ApplicationWizardStepsProps = {
  step: number
  formData: ApplicationFormData
  corporationId: string
  schoolId: string
  errors: Record<string, string>
  uploadedFiles: UploadedFileMap
  confirmBanner: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSelectChange: (id: string, value: string) => void
  onCorporationChange: (id: string) => void
  onSchoolChange: (id: string) => void
  onFileUpload: (docId: string) => void
  onRemoveFile: (docId: string) => void
}

export function ApplicationWizardStepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {WIZARD_STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step > s.num
                  ? "bg-green-500 text-white"
                  : step === s.num
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {step > s.num ? <Check className="w-5 h-5" /> : s.num}
            </div>
            <span className={cn(
              "text-sm mt-2",
              step >= s.num ? "text-gray-900 font-medium" : "text-gray-500"
            )}>{s.label}</span>
          </div>
          {i < WIZARD_STEPS.length - 1 && (
            <div
              className={cn(
                "w-20 h-1 mx-3 rounded",
                step > s.num ? "bg-green-500" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function ApplicationWizardSteps({
  step,
  formData,
  corporationId,
  schoolId,
  errors,
  uploadedFiles,
  confirmBanner,
  onInputChange,
  onSelectChange,
  onCorporationChange,
  onSchoolChange,
  onFileUpload,
  onRemoveFile,
}: ApplicationWizardStepsProps) {
  const handleInputChange = onInputChange
  const handleSelectChange = onSelectChange
  const handleCorporationChange = onCorporationChange
  const handleSchoolChange = onSchoolChange
  const handleFileUpload = onFileUpload
  const removeFile = onRemoveFile
  const requiredDocuments = REQUIRED_DOCUMENTS
  return (
    <>
`

const footer = `
    </>
  )
}
`

let body = stepsBlock
body = body.replace(
  "上記の内容で申請します。内容に間違いがないことを確認の上、「申請する」ボタンをクリックしてください。",
  "{confirmBanner}"
)

fs.writeFileSync("components/application-wizard-steps.tsx", header + body + footer)
console.log("OK")
