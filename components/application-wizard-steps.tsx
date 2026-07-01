"use client"

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
  WizardReadOnlyField,
  SummaryItem,
  formatStudentGender,
  formatEnrollmentDateDisplay,
  facilityApplicantLabel,
  type ApplicationFormData,
  type FacilityApplicantMaster,
  type SchoolMaster,
  type UploadedFileMap,
} from "@/lib/application-wizard-shared"

export type ApplicationWizardStepsProps = {
  step: number
  formData: ApplicationFormData
  corporationId: string
  schoolId: string
  facilityApplicants: FacilityApplicantMaster[]
  schools: SchoolMaster[]
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
  facilityApplicants,
  schools,
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
{/* Step 1: Applicant Information */}
            {step === 1 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <h3 className="font-medium text-lg text-gray-900 border-b pb-3">申請者</h3>

                <FormField
                  label="申込日（西暦）"
                  htmlFor="applicationDate"
                  required
                  error={errors.applicationDate}
                >
                  <Input
                    id="applicationDate"
                    type="date"
                    className="w-[180px]"
                    value={formData.applicationDate}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="法人名・施設名"
                  htmlFor="corporationId"
                  required
                  error={errors.corporationId}
                >
                  <Select value={corporationId} onValueChange={handleCorporationChange}>
                    <SelectTrigger id="corporationId" className="w-[300px]">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilityApplicants.map((f) => (
                        <SelectItem key={f.corporationId} value={f.corporationId}>
                          {facilityApplicantLabel(f)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <WizardReadOnlyField label="利用者ID" value={formData.userId} />
                <WizardReadOnlyField label="担当者名" value={formData.contactName} />
                <WizardReadOnlyField label="担当者名（カナ）" value={formData.contactNameKana} />
                <WizardReadOnlyField label="電話番号（携帯推奨）" value={formData.applicantPhone} />
                <WizardReadOnlyField label="申請者メールアドレス" value={formData.applicantEmail} />
              </div>
            )}

            {/* Step 2: Student Information */}
            {step === 2 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <h3 className="font-medium text-lg text-gray-900 border-b pb-3">学生</h3>

                <FormField
                  label="郵便番号"
                  htmlFor="studentPostalCode"
                  required
                  error={errors.studentPostalCode}
                >
                  <Input
                    id="studentPostalCode"
                    placeholder="000-0000"
                    className="w-[150px]"
                    value={formData.studentPostalCode}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="住所（都道府県）"
                  htmlFor="studentPrefecture"
                  required
                  error={errors.studentPrefecture}
                >
                  <Select
                    value={formData.studentPrefecture}
                    onValueChange={(value) => handleSelectChange("studentPrefecture", value)}
                  >
                    <SelectTrigger id="studentPrefecture" className="w-[200px]">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREFECTURES.map((pref) => (
                        <SelectItem key={pref} value={pref}>
                          {pref}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="住所（市区町村以降）"
                  htmlFor="studentAddress"
                  required
                  error={errors.studentAddress}
                >
                  <Input
                    id="studentAddress"
                    className="w-[400px]"
                    value={formData.studentAddress}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="氏名（姓）"
                  htmlFor="studentLastName"
                  required
                  error={errors.studentLastName}
                >
                  <Input
                    id="studentLastName"
                    className="w-[200px]"
                    value={formData.studentLastName}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="氏名（名）"
                  htmlFor="studentFirstName"
                  required
                  error={errors.studentFirstName}
                >
                  <Input
                    id="studentFirstName"
                    className="w-[200px]"
                    value={formData.studentFirstName}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="氏名カナ（姓）"
                  htmlFor="studentLastNameKana"
                  required
                  error={errors.studentLastNameKana}
                >
                  <Input
                    id="studentLastNameKana"
                    className="w-[200px]"
                    value={formData.studentLastNameKana}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="氏名カナ（名）"
                  htmlFor="studentFirstNameKana"
                  required
                  error={errors.studentFirstNameKana}
                >
                  <Input
                    id="studentFirstNameKana"
                    className="w-[200px]"
                    value={formData.studentFirstNameKana}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="国籍"
                  htmlFor="nationality"
                  required
                  error={errors.nationality}
                >
                  <Select
                    value={formData.nationality}
                    onValueChange={(value) => handleSelectChange("nationality", value)}
                  >
                    <SelectTrigger id="nationality" className="w-[200px]">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="生年月日（西暦）"
                  htmlFor="studentBirthDate"
                  required
                  error={errors.studentBirthDate}
                >
                  <Input
                    id="studentBirthDate"
                    type="date"
                    className="w-[180px]"
                    value={formData.studentBirthDate}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="性別"
                  htmlFor="studentGender"
                  required
                  error={errors.studentGender}
                >
                  <div className="flex h-10 items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        className="w-4 h-4"
                        checked={formData.studentGender === "male"}
                        onChange={(e) => handleSelectChange("studentGender", e.target.value)}
                      />
                      <span>男</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        className="w-4 h-4"
                        checked={formData.studentGender === "female"}
                        onChange={(e) => handleSelectChange("studentGender", e.target.value)}
                      />
                      <span>女</span>
                    </label>
                  </div>
                </FormField>

                <FormField
                  label="携帯電話番号"
                  htmlFor="studentPhone"
                  required
                  error={errors.studentPhone}
                >
                  <Input
                    id="studentPhone"
                    placeholder="090-0000-0000"
                    className="w-[200px]"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="学生メールアドレス"
                  htmlFor="studentEmail"
                  required
                  error={errors.studentEmail}
                >
                  <Input
                    id="studentEmail"
                    type="email"
                    placeholder="example@email.com"
                    className="w-[280px]"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="入学日・入学予定日（西暦）"
                  htmlFor="enrollmentDate"
                  required
                  error={errors.enrollmentDate}
                >
                  <Input
                    id="enrollmentDate"
                    type="date"
                    className="w-[180px]"
                    value={formData.enrollmentDate}
                    onChange={handleInputChange}
                  />
                </FormField>
              </div>
            )}

            {/* Step 3: School Usage */}
            {step === 3 && (
              <div className="space-y-5 max-w-4xl mx-auto">
                <h3 className="font-medium text-lg text-gray-900 border-b pb-3">養成校使用欄</h3>

                <FormField
                  label="受付日（西暦）"
                  htmlFor="receptionDate"
                  required
                  error={errors.receptionDate}
                >
                  <Input
                    id="receptionDate"
                    type="date"
                    className="w-[180px]"
                    value={formData.receptionDate}
                    onChange={handleInputChange}
                  />
                </FormField>

                <FormField
                  label="養成校名"
                  htmlFor="schoolId"
                  required
                  error={errors.schoolId}
                >
                  <Select value={schoolId} onValueChange={handleSchoolChange}>
                    <SelectTrigger id="schoolId" className="w-[300px]">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((s) => (
                        <SelectItem key={s.schoolId} value={s.schoolId}>
                          {s.schoolName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <WizardReadOnlyField label="介養協 会員番号" value={formData.associationMemberNumber} />
                <WizardReadOnlyField label="受付担当者名" value={formData.receptionStaffName} />
                <WizardReadOnlyField label="電話番号" value={formData.schoolPhone} />
                <WizardReadOnlyField label="養成校メールアドレス" value={formData.schoolEmail} />
              </div>
            )}

            {/* Step 4: Attached Documents */}
            {step === 4 && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <h3 className="font-medium text-lg text-gray-900 border-b pb-3">添付書類</h3>

                <div className="space-y-6">
                  {requiredDocuments.map((doc) => {
                    const file = uploadedFiles[doc.id]
                    const docError = errors[`documents.${doc.id}`]
                    return (
                      <div key={doc.id} className="border rounded-lg p-5 bg-white">
                        <div className="mb-4">
                          <Label className="text-base">
                            {doc.title} {doc.required && <span className="text-red-500">*</span>}
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                          <p className="text-xs text-gray-400 mt-1">対応形式: {doc.supportedFormats}</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-xs font-medium text-gray-600 mb-2">サンプル画像（参考）</p>
                          <div className="relative rounded-md overflow-hidden border border-gray-200 bg-white">
                            <Image
                              src={doc.sampleImage}
                              alt={`${doc.title}のサンプル`}
                              width={600}
                              height={300}
                              className="w-full h-44 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <p className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-white">
                              {doc.sampleCaption}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                            onClick={() => handleFileUpload(doc.id)}
                          >
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              {file
                                ? "クリックしてファイルを差し替え"
                                : "クリックまたはドラッグ&ドロップでアップロード"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{doc.supportedFormats} (10MB以下)</p>
                          </div>

                          <div className="mt-3 min-h-[52px]">
                            {file && (
                              <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="w-5 h-5 shrink-0 text-green-600" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.size}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="p-1 hover:bg-green-100 rounded shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(doc.id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-500" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="min-h-5 mt-1">
                            <p className="text-sm leading-5 text-red-600">{docError ?? ""}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-1.5 pt-4 border-t">
                  <Label htmlFor="remarks">備考</Label>
                  <p className="text-sm text-gray-500">その他、ご連絡事項があればご記入ください</p>
                  <textarea
                    id="remarks"
                    rows={4}
                    className={cn(
                      "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background placeholder:text-muted-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    value={formData.remarks}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <h3 className="font-medium text-lg text-gray-900 border-b pb-3">入力内容の確認</h3>

                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  {/* Applicant Info Summary */}
                  <div className="border-b pb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">申請者</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="col-span-2">
                      <SummaryItem label="申込日（西暦）" value={formData.applicationDate} />
                      </div>
                      <SummaryItem
                        label="法人名・施設名"
                        value={
                          facilityApplicants.find((f) => f.corporationId === corporationId)
                            ? facilityApplicantLabel(
                                facilityApplicants.find((f) => f.corporationId === corporationId)!
                              )
                            : undefined
                        }
                      />
                      <SummaryItem label="利用者ID" value={formData.userId} />
                      <SummaryItem label="担当者名" value={formData.contactName} />
                      <SummaryItem label="担当者名（カナ）" value={formData.contactNameKana} />
                      <SummaryItem label="電話番号（携帯推奨）" value={formData.applicantPhone} />
                      <SummaryItem label="申請者メールアドレス" value={formData.applicantEmail} />
                    </div>
                  </div>

                  {/* Student Info Summary */}
                  <div className="border-b pb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">学生</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="col-span-2">
                      <SummaryItem label="郵便番号" value={formData.studentPostalCode} />
                    </div>
                      <SummaryItem label="住所（都道府県）" value={formData.studentPrefecture} />
                      <SummaryItem label="住所（市区町村以降）" value={formData.studentAddress} />
                      <SummaryItem label="氏名（姓）" value={formData.studentLastName} />
                      <SummaryItem label="氏名（名）" value={formData.studentFirstName} />
                      <SummaryItem label="氏名カナ（姓）" value={formData.studentLastNameKana} />
                      <SummaryItem label="氏名カナ（名）" value={formData.studentFirstNameKana} />
                      <SummaryItem label="国籍" value={formData.nationality} />
                      <SummaryItem label="生年月日（西暦）" value={formData.studentBirthDate} />
                      <SummaryItem label="性別" value={formatStudentGender(formData.studentGender)} />
                      <SummaryItem label="携帯電話番号" value={formData.studentPhone} />
                      <SummaryItem label="学生メールアドレス" value={formData.studentEmail} />
                      <SummaryItem label="入学日・入学予定日（西暦）" value={formatEnrollmentDateDisplay(formData.enrollmentDate)} />
                    </div>
                  </div>

                  {/* School Usage Info Summary */}
                  <div className="border-b pb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">養成校使用欄</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="col-span-2">
                      <SummaryItem label="受付日（西暦）" value={formData.receptionDate} />
                    </div>
                      <SummaryItem
                        label="養成校名"
                        value={schools.find((s) => s.schoolId === schoolId)?.schoolName}
                      />
                      <SummaryItem label="介養協 会員番号" value={formData.associationMemberNumber} />
                      <div className="col-span-2">  
                      <SummaryItem label="受付担当者名" value={formData.receptionStaffName} />
                      </div>
                      <SummaryItem label="電話番号" value={formData.schoolPhone} />
                      <SummaryItem label="養成校メールアドレス" value={formData.schoolEmail} />
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">添付書類</h4>
                    <div className="space-y-3 text-sm">
                      {requiredDocuments.map((doc) => {
                        const file = uploadedFiles[doc.id]
                        return (
                          <div key={doc.id} className="flex items-start gap-2">
                            <FileText className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                            <div>
                              <span className="text-gray-900">{doc.title}</span>
                              {file ? (
                                <span className="ml-2 text-green-600">
                                  {file.name} ({file.size})
                                </span>
                              ) : (
                                <span className="ml-2 text-red-500">(未アップロード)</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <span>備考: {formData.remarks.trim() ? formData.remarks : "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    {confirmBanner}
                  </p>
                </div>
              </div>
            )}

            
    </>
  )
}
