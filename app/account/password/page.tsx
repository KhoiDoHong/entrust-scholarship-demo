"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { cn } from "@/lib/utils"

type FieldErrors = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

function FieldInlineError({ id, message }: { id?: string; message?: string }) {
  return (
    <p
      id={id}
      className={cn(
        "min-h-5 text-sm leading-5",
        message ? "text-red-600" : "text-transparent select-none",
      )}
      aria-live="polite"
    >
      {message ?? "\u00a0"}
    </p>
  )
}

function isPasswordPolicyValid(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 255 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  )
}

function validateFields(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): FieldErrors {
  const errors: FieldErrors = {}

  if (!currentPassword) {
    errors.currentPassword = "現在のパスワードを入力してください。"
  }

  if (!newPassword) {
    errors.newPassword = "新しいパスワードを入力してください。"
  } else if (!isPasswordPolicyValid(newPassword)) {
    errors.newPassword = "パスワードは8文字以上で、大文字・小文字・数字・記号を含めてください。"
  } else if (currentPassword && newPassword === currentPassword) {
    errors.newPassword = "現在と異なるパスワードを設定してください。"
  }

  if (!confirmPassword) {
    errors.confirmPassword = "新しいパスワード（確認）を入力してください。"
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = "パスワードが一致しません。"
  }

  return errors
}

export default function PasswordChangePage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateFields(currentPassword, newPassword, confirmPassword)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setShowConfirmDialog(true)
  }

  const handleConfirmChange = () => {
    setShowConfirmDialog(false)
    sessionStorage.setItem("passwordChangeSuccess", "1")
    router.push("/login")
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">パスワード変更</h1>
        <p className="text-gray-500 mt-1">ログインパスワードを変更します</p>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            role="alertdialog"
            aria-labelledby="password-change-confirm-title"
            aria-describedby="password-change-confirm-desc"
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            <div className="px-6 pt-5 pb-4 border-b">
              <p id="password-change-confirm-title" className="text-lg font-semibold text-gray-900">
                パスワードを変更しますか？
              </p>
            </div>
            <div className="px-6 py-5">
              <p id="password-change-confirm-desc" className="text-sm text-gray-600 leading-relaxed">
                パスワードを変更すると、変更後は再度ログインが必要です。
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button type="button" variant="outline" onClick={() => setShowConfirmDialog(false)}>
                キャンセル
              </Button>
              <Button
                type="button"
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
                onClick={handleConfirmChange}
              >
                変更
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-8">
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">パスワードを変更</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    現在のパスワードと新しいパスワードを入力してください。
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="current-pw">現在のパスワード</Label>
                    <div className="relative mt-2">
                      <Input
                        id="current-pw"
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        maxLength={255}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value.slice(0, 255))
                          clearFieldError("currentPassword")
                        }}
                        className={cn(
                          "pr-10",
                          fieldErrors.currentPassword && "border-red-500 focus-visible:ring-red-500",
                        )}
                        aria-invalid={!!fieldErrors.currentPassword}
                        aria-describedby="current-pw-error"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldInlineError id="current-pw-error" message={fieldErrors.currentPassword} />
                  </div>

                  <div>
                    <Label htmlFor="new-pw">新しいパスワード</Label>
                    <div className="relative mt-2">
                      <Input
                        id="new-pw"
                        type={showNew ? "text" : "password"}
                        placeholder="8文字以上"
                        value={newPassword}
                        maxLength={255}
                        onChange={(e) => {
                          setNewPassword(e.target.value.slice(0, 255))
                          clearFieldError("newPassword")
                        }}
                        className={cn(
                          "pr-10",
                          fieldErrors.newPassword && "border-red-500 focus-visible:ring-red-500",
                        )}
                        aria-invalid={!!fieldErrors.newPassword}
                        aria-describedby="new-pw-error"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <ul className="mt-1.5 space-y-0.5 text-xs text-gray-500">
                      <li>・8文字以上</li>
                      <li>・大文字（A〜Z）を含む</li>
                      <li>・小文字（a〜z）を含む</li>
                      <li>・数字（0〜9）を含む</li>
                      <li>・特殊文字（例：!@#$%^&*）を含む</li>
                    </ul>
                    <FieldInlineError id="new-pw-error" message={fieldErrors.newPassword} />
                  </div>

                  <div>
                    <Label htmlFor="confirm-pw">新しいパスワード（確認）</Label>
                    <div className="relative mt-2">
                      <Input
                        id="confirm-pw"
                        type={showConfirmPw ? "text" : "password"}
                        placeholder="再入力"
                        value={confirmPassword}
                        maxLength={255}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value.slice(0, 255))
                          clearFieldError("confirmPassword")
                        }}
                        className={cn(
                          "pr-10",
                          fieldErrors.confirmPassword && "border-red-500 focus-visible:ring-red-500",
                        )}
                        aria-invalid={!!fieldErrors.confirmPassword}
                        aria-describedby="confirm-pw-error"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldInlineError id="confirm-pw-error" message={fieldErrors.confirmPassword} />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6 mt-2"
                  >
                    変更
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
