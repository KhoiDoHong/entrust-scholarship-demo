"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Shield, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateEmail(email: string): string | undefined {
  const value = email.trim()

  if (!value) {
    return "メールアドレスを入力してください。"
  }
  if (value.length > 255) {
    return "メールアドレスの形式が正しくありません。"
  }
  if (!isValidEmail(value)) {
    return "メールアドレスの形式が正しくありません。"
  }

  return undefined
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | undefined>()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
      return
    }

    setEmailError(undefined)
    setIsSubmitted(true)
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
          {!isSubmitted ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">パスワードをお忘れの方</h2>
                <p className="text-sm text-gray-500 mt-1">
                  登録済みのメールアドレスを入力してください。パスワード再設定用のURLをお送りします。
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="example@company.co.jp"
                      value={email}
                      maxLength={255}
                      onChange={(e) => {
                        setEmail(e.target.value.replace(/\s/g, "").slice(0, 255))
                        if (emailError) setEmailError(undefined)
                      }}
                      className={cn(
                        "pl-10",
                        emailError && "border-red-500 focus-visible:ring-red-500",
                      )}
                      aria-invalid={!!emailError}
                      aria-describedby="email-error"
                    />
                  </div>
                  <FieldInlineError id="email-error" message={emailError} />
                  <p className="text-sm text-gray-500 mt-2">
                    メールアドレスをお忘れの方は、イントラスト管理までお問い合わせください。
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6"
                >
                  送信
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ログインに戻る
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">メールを送信しました</h2>
              <p className="text-sm text-gray-500 mb-6">
                メールに記載のURLからパスワードを再設定してください。
              </p>
              <p className="text-xs text-gray-400 mb-6">
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ログインに戻る
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-gray-400 mt-8">
        © 2024 イントラスト株式会社 All rights reserved.
      </p>
    </div>
  )
}
