"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type FieldErrors = {
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

function validateFields(newPassword: string, confirmPassword: string): FieldErrors {
  const errors: FieldErrors = {}

  if (!newPassword) {
    errors.newPassword = "新しいパスワードを入力してください。"
  } else if (!isPasswordPolicyValid(newPassword)) {
    errors.newPassword = "パスワードは8文字以上で、大文字・小文字・数字・記号を含めてください。"
  }

  if (!confirmPassword) {
    errors.confirmPassword = "新しいパスワード（確認）を入力してください。"
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = "パスワードが一致しません。"
  }

  return errors
}

export default function PasswordResetPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

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

    const errors = validateFields(newPassword, confirmPassword)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    sessionStorage.setItem("passwordResetSuccess", "1")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">イントラスト</h1>
          <p className="text-sm text-gray-500">介護福祉士修学資金保証システム</p>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">パスワード設定</h2>
            <p className="text-sm text-gray-500 mt-1">新しいパスワードを入力してください</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  type={showConfirm ? "text" : "password"}
                  placeholder="再度入力"
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
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldInlineError id="confirm-pw-error" message={fieldErrors.confirmPassword} />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6 mt-2"
            >
              設定する
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-400 mt-8">
        © 2024 イントラスト株式会社 All rights reserved.
      </p>
    </div>
  )
}
