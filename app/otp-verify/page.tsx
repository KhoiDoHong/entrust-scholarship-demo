"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Loader2, ArrowLeft } from "lucide-react"
import { clearSession, getSession, markOtpVerified } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const RESEND_COOLDOWN_SEC = 60

function formatCooldown(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function OTPVerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SEC)
  const otpInputRef = useRef<HTMLInputElement>(null)
  const verifyingRef = useRef(false)

  const resendActive = resendCooldown > 0

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login")
    }
  }, [router])

  useEffect(() => {
    if (!resendActive) return

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendActive])

  const verifyOtp = (code: string) => {
    if (verifyingRef.current || loading) return

    setError("")

    if (code.length !== 6) {
      setError("認証コードは6桁の数字で入力してください。")
      return
    }

    verifyingRef.current = true
    setLoading(true)

    if (code === "123456") {
      markOtpVerified()
      window.setTimeout(() => router.push("/"), 400)
      return
    }

    toast({
      variant: "destructive",
      title: "ワンタイムパスワードが正しくありません。",
    })
    setOtp("")
    otpInputRef.current?.focus()
    setLoading(false)
    verifyingRef.current = false
  }

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setOtp(digits)
    if (error) setError("")

    if (digits.length === 6) {
      verifyOtp(digits)
    }
  }

  const handleResend = () => {
    if (resendActive || loading) return
    setResendCooldown(RESEND_COOLDOWN_SEC)
    setError("")
    setOtp("")
    otpInputRef.current?.focus()
  }

  const handleBackToLogin = () => {
    clearSession()
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
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">ワンタイムパスワード認証</h2>
            <p className="text-sm text-gray-500 mt-2">
              登録メールアドレスに送信された6桁のコードを入力してください
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">6桁のコード</Label>
              <div className="relative mt-2">
                <Input
                  ref={otpInputRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono pr-10"
                  disabled={loading}
                  aria-invalid={!!error}
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[#1e3a5f]" />
                )}
              </div>
              <p
                className={cn(
                  "min-h-5 text-sm leading-5 mt-1",
                  error ? "text-red-600" : "text-transparent select-none",
                )}
                aria-live="polite"
              >
                {error || "\u00a0"}
              </p>
            </div>

            <div className="pt-1">
              <Button
                type="button"
                className="w-full min-h-[52px] bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6 disabled:opacity-100 disabled:bg-[#1e3a5f]/45 disabled:text-white disabled:hover:bg-[#1e3a5f]/45"
                onClick={handleResend}
                disabled={resendActive || loading}
                aria-live="polite"
              >
                {resendActive
                  ? `再送信まで: ${formatCooldown(resendCooldown)}`
                  : "コードを再送信"}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline disabled:opacity-50 disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4" />
                ログインに戻る
              </button>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <p className="text-xs text-gray-600 mb-3">
              <strong>デモワンタイムパスワード:</strong>{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span>
            </p>
            <p className="text-xs text-gray-400">
              コードを受け取れない場合は、お使いのメールアドレスが登録されているか確認してください。
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-400 mt-8">
        © 2024 イントラスト株式会社 All rights reserved.
      </p>
    </div>
  )
}
