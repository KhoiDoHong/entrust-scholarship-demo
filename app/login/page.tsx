"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Shield, User } from "lucide-react"
import Link from "next/link"
import { DEMO_ACCOUNTS, findAccount, saveSession } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type FieldErrors = {
  loginId?: string
  password?: string
}

function validateFields(loginId: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  const id = loginId.trim()

  if (!id) {
    errors.loginId = "IDを入力してください。"
  } else if (id.length > 15) {
    errors.loginId = "IDは10文字以内で入力してください。"
  }

  if (!password) {
    errors.password = "パスワードを入力してください。"
  } else if (password.length > 255) {
    errors.password = "パスワードは255文字以内で入力してください。"
  }

  return errors
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

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (sessionStorage.getItem("passwordResetSuccess") === "1") {
      sessionStorage.removeItem("passwordResetSuccess")
      toast({
        variant: "success",
        title: "パスワードを設定しました。ログインしてください。",
      })
      return
    }

    if (sessionStorage.getItem("passwordChangeSuccess") === "1") {
      sessionStorage.removeItem("passwordChangeSuccess")
      toast({
        variant: "success",
        title: "パスワードを変更しました。再度ログインしてください。",
      })
    }
  }, [toast])

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateFields(userId, password)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    const account = findAccount(userId.trim())
    if (!account) {
      toast({
        variant: "destructive",
        title: "IDまたはパスワードが正しくありません。",
      })
      return
    }

    saveSession(account, { otpVerified: false })
    router.push("/otp-verify")
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
            <h2 className="text-xl font-bold text-gray-900">ログイン</h2>
            <p className="text-sm text-gray-500 mt-1">アカウント情報を入力してください</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="userId">ID</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="userId"
                  type="text"
                  placeholder="IDを入力"
                  value={userId}
                  maxLength={10}
                  onChange={(e) => {
                    setUserId(e.target.value.replace(/\s/g, "").slice(0, 10))
                    clearFieldError("loginId")
                  }}
                  className={cn("pl-10", fieldErrors.loginId && "border-red-500 focus-visible:ring-red-500")}
                  aria-invalid={!!fieldErrors.loginId}
                  aria-describedby="userId-error"
                />
              </div>
              <FieldInlineError id="userId-error" message={fieldErrors.loginId} />
            </div>

            <div>
              <Label htmlFor="password">パスワード</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  value={password}
                  maxLength={255}
                  onChange={(e) => {
                    setPassword(e.target.value.slice(0, 255))
                    clearFieldError("password")
                  }}
                  className={cn("pl-10", fieldErrors.password && "border-red-500 focus-visible:ring-red-500")}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby="password-error"
                />
              </div>
              <FieldInlineError id="password-error" message={fieldErrors.password} />
            </div>

            <div className="flex items-center justify-end pt-1">
              <Link href="/forgot-password" className="text-sm text-[#1e3a5f] hover:underline">
                パスワードをお忘れの方
              </Link>
            </div>

            <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6">
              ログイン
            </Button>
          </form>

          <div className="mt-6 border-t pt-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">デモアカウント一覧</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.userId}
                  type="button"
                  onClick={() => {
                    setUserId(account.userId)
                    setPassword("demo")
                    setFieldErrors({})
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors text-left group"
                >
                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 w-32 shrink-0">
                    {account.label}
                  </span>
                  <span className="text-xs text-gray-400 group-hover:text-blue-500 truncate">
                    {account.userId}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">クリックで自動入力。パスワードは任意で入力してください。</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-400 mt-8">
        © 2024 イントラスト株式会社 All rights reserved.
      </p>
    </div>
  )
}
