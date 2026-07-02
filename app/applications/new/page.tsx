"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getAuthenticatedSession, type UserAccount } from "@/lib/auth"
import {
  WIZARD_STEPS,
  createEmptyFormData,
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

function canCreateApplication(user: UserAccount | null): boolean {
  return user?.role === "school" || user?.role === "entrust"
}

export default function NewApplicationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [schoolId, setSchoolId] = useState("")
  const [corporationId, setCorporationId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMap>({})
  const [formData, setFormData] = useState<ApplicationFormData>(
    createEmptyFormData({ useTodayDates: true })
  )
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null)

  const facilityApplicants = useMemo(
    () => getWizardFacilityApplicants(currentUser),
    [currentUser]
  )
  const schools = useMemo(() => getWizardSchools(currentUser), [currentUser])

  useEffect(() => {
    setCurrentUser(getAuthenticatedSession())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (currentUser && !canCreateApplication(currentUser)) {
      router.replace("/applications")
    }
  }, [currentUser, router])

  useEffect(() => {
    if (schools.length !== 1) return
    const onlySchool = schools[0]
    if (schoolId === onlySchool.schoolId) return
    setSchoolId(onlySchool.schoolId)
    setFormData((prev) => ({
      ...prev,
      schoolId: onlySchool.schoolId,
      associationMemberNumber: onlySchool.associationMemberNumber,
      receptionStaffName: onlySchool.receptionStaffName,
      schoolPhone: onlySchool.phone,
      schoolEmail: onlySchool.email,
    }))
  }, [schools, schoolId])

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
    router.push("/applications")
  }

  if (isLoading || (currentUser && !canCreateApplication(currentUser))) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/applications"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            審査申請一覧に戻る
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">新規申請</h1>
          <p className="text-gray-500 mt-1">奨学金の審査申請を行います</p>
        </div>

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
              confirmBanner="上記の内容で申請を行います。内容に間違いがないことを確認の上、「申請する」ボタンをクリックしてください。"
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
                  申請
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
