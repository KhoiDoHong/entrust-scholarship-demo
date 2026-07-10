"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import {
  completeApplicationCorrection,
  getApplicationById,
} from "@/lib/applications-store"
import { getAuthenticatedSession, canEditApplication } from "@/lib/auth"
import {
  WIZARD_STEPS,
  createEmptyFormData,
  mapApplicationToWizardState,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  getWizardFacilityApplicants,
  getWizardSchools,
  type ApplicationFormData,
  type UploadedFileMap,
} from "@/lib/application-wizard-shared"
import {
  ApplicationWizardStepIndicator,
  ApplicationWizardSteps,
} from "@/components/application-wizard-steps"

export default function EditApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === "string" ? parseInt(params.id, 10) : Number(params.id)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [replyComment, setReplyComment] = useState("")
  const [schoolId, setSchoolId] = useState("")
  const [corporationId, setCorporationId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMap>({})
  const [formData, setFormData] = useState<ApplicationFormData>(createEmptyFormData())
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getAuthenticatedSession>>(null)

  const app = getApplicationById(id)

  const facilityApplicants = useMemo(
    () => getWizardFacilityApplicants(currentUser),
    [currentUser]
  )
  const schools = useMemo(() => getWizardSchools(currentUser), [currentUser])

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
  }, [])

  useEffect(() => {
    if (currentUser && !canEditApplication(currentUser)) {
      router.replace("/applications")
    }
  }, [currentUser, router])

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setIsLoading(false)
      return
    }
    if (app) {
      const mapped = mapApplicationToWizardState(app)
      setFormData(mapped.formData)
      setCorporationId(mapped.corporationId)
      setSchoolId(mapped.schoolId)
      setUploadedFiles(mapped.uploadedFiles)
    }
    setIsLoading(false)
  }, [id, app])

  const clearFieldErrors = (...keys: string[]) => {
    setErrors((prev) => {
      const hasAny = keys.some((key) => prev[key])
      if (!hasAny) return prev
      const next = { ...prev }
      keys.forEach((key) => {
        delete next[key]
      })
      return next
    })
  }

  const handleFileUpload = (docId: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docId]: { name: `uploaded_file_${Date.now()}.pdf`, size: "1.2 MB" },
    }))
    clearFieldErrors(`documents.${docId}`)
  }

  const removeFile = (docId: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id: fieldId, value } = e.currentTarget
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    clearFieldErrors(fieldId)
  }

  const handleSelectChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    clearFieldErrors(fieldId)
  }

  const handleCorporationChange = (corpId: string) => {
    setCorporationId(corpId)
    clearFieldErrors(
      "corporationId",
      "contactName",
      "contactNameKana",
      "applicantPhone",
      "applicantEmail"
    )
    const facility = facilityApplicants.find((f) => f.corporationId === corpId)
    if (facility) {
      setFormData((prev) => ({
        ...prev,
        userId: facility.userId,
        contactName: facility.contactName,
        contactNameKana: facility.contactNameKana,
        applicantPhone: facility.phone,
        applicantEmail: facility.email,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        userId: "",
        contactName: "",
        contactNameKana: "",
        applicantPhone: "",
        applicantEmail: "",
      }))
    }
  }

  const handleSchoolChange = (nextSchoolId: string) => {
    setSchoolId(nextSchoolId)
    clearFieldErrors(
      "schoolId",
      "receptionStaffName",
      "schoolPhone",
      "schoolEmail"
    )
    const school = schools.find((s) => s.schoolId === nextSchoolId)
    if (school) {
      setFormData((prev) => ({
        ...prev,
        schoolId: nextSchoolId,
        associationMemberNumber: school.associationMemberNumber,
        receptionStaffName: school.receptionStaffName,
        schoolPhone: school.phone,
        schoolEmail: school.email,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        schoolId: "",
        associationMemberNumber: "",
        receptionStaffName: "",
        schoolPhone: "",
        schoolEmail: "",
      }))
    }
  }

  const handleNext = () => {
    if (step === 1) {
      const stepErrors = validateStep1(formData, corporationId)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }
      setErrors({})
    } else if (step === 2) {
      const stepErrors = validateStep2(formData)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }
      setErrors({})
    } else if (step === 3) {
      const stepErrors = validateStep3(formData, schoolId)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }
      setErrors({})
    } else if (step === 4) {
      const stepErrors = validateStep4(uploadedFiles)
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors)
        return
      }
      setErrors({})
    }
    setStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length))
  }

  const handleSubmit = () => {
    if (app) {
      completeApplicationCorrection(app.id, replyComment)
    }
    router.push("/applications")
  }

  if (isLoading || (currentUser && !canEditApplication(currentUser))) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!app) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-gray-500">申請が見つかりません</p>
        </div>
      </DashboardLayout>
    )
  }

  if (app.statusType !== "warning") {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-gray-500">この申請は修正対象ではありません</p>
          <Link href="/applications" className="text-blue-600 text-sm mt-2 inline-block">
            審査申請一覧に戻る
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <Link href="/applications" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" />
            審査申請一覧に戻る
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">申請内容修正</h1>
          <p className="text-gray-500 mt-1">不備のある申請内容を修正します</p>
        </div>

        {app.deficiencyMessage && (
          <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900 mb-1">不備コメント</h3>
                <p className="text-sm text-orange-800 whitespace-pre-wrap">{app.deficiencyMessage}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="replyComment">返信コメント</Label>
              <Textarea
                id="replyComment"
                placeholder="コメントを入力してください（任意）"
                value={replyComment}
                onChange={(e) => setReplyComment(e.target.value)}
                rows={3}
                className="bg-white"
              />
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-8">
            <ApplicationWizardStepIndicator step={step} />

            <ApplicationWizardSteps
              step={step}
              formData={formData}
              corporationId={corporationId}
              schoolId={schoolId}
              facilityApplicants={facilityApplicants}
              schools={schools}
              errors={errors}
              uploadedFiles={uploadedFiles}
              confirmBanner="上記の内容で申請を更新します。内容に間違いがないことを確認の上、「更新する」ボタンをクリックしてください。"
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onCorporationChange={handleCorporationChange}
              onSchoolChange={handleSchoolChange}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeFile}
            />

            <div className="flex items-center justify-between mt-12 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                disabled={step === 1}
              >
                前へ
              </Button>
              {step === WIZARD_STEPS.length ? (
                <Button onClick={handleSubmit} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white">
                  更新
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white">
                  次へ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
