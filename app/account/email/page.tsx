"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { getSession, saveSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const RESEND_COOLDOWN_SEC = 60

function formatCooldown(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export default function EmailChangePage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [newEmail, setNewEmail] = useState("")
  const [otpInput, setOtpInput] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpInputRef = useRef<HTMLInputElement>(null)
  const verifyingRef = useRef(false)

  const resendActive = resendCooldown > 0

  useEffect(() => {
    if (!resendActive) return

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendActive])

  const issueOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(otp)
    console.log(`[v0] OTP for demo: ${otp}`)
    setOtpInput("")
    setResendCooldown(RESEND_COOLDOWN_SEC)
  }

  const handleSendOtp = () => {
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError("有効なメールアドレスを入力してください")
      return
    }
    setError("")
    issueOtp()
    setStep(2)
  }

  const handleResend = () => {
    if (resendActive || loading) return
    issueOtp()
    setError("")
    verifyingRef.current = false
    otpInputRef.current?.focus()
    toast({
      variant: "success",
      title: "認証コードを再送信しました。",
    })
  }

  const verifyOtp = (code: string) => {
    if (verifyingRef.current || loading) return

    setError("")

    if (code.length !== 6) {
      setError("認証コードは6桁の数字で入力してください。")
      return
    }

    verifyingRef.current = true
    setLoading(true)

    window.setTimeout(() => {
      if (code !== generatedOtp) {
        setError("認証コードが正しくありません。")
        setOtpInput("")
        otpInputRef.current?.focus()
        setLoading(false)
        verifyingRef.current = false
        return
      }

      const session = getSession()
      if (session) {
        saveSession({ ...session, email: newEmail })
      }
      sessionStorage.setItem("emailChangeSuccess", "1")
      router.push("/")
    }, 400)
  }

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setOtpInput(digits)
    if (error) setError("")

    if (digits.length === 6) {
      verifyOtp(digits)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">メールアドレス変更</h1>
        <p className="text-gray-500 mt-1">登録中のメールアドレスを変更します</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">新しいメールアドレスを設定</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      新しいメールアドレスを入力してください。認証コードを送信します。
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-email">新しいメールアドレス</Label>
                    <Input
                      id="new-email"
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="example@domain.com"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value.replace(/\s/g, ""))
                        setError("")
                      }}
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white py-6"
                  >
                    認証コードを送信
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">認証コードを確認</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium text-gray-700">{newEmail}</span>
                      {" "}に送信した6桁の認証コードを入力してください。
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp">認証コード</Label>
                    <div className="relative">
                      <Input
                        ref={otpInputRef}
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="000000"
                        value={otpInput}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        disabled={loading}
                        className="text-center tracking-[0.4em] text-lg font-mono pr-10"
                        aria-invalid={!!error}
                      />
                      {loading && (
                        <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-[#1e3a5f]" />
                      )}
                    </div>
                    <p
                      className={cn(
                        "min-h-5 text-sm leading-5",
                        error ? "text-red-600" : "text-transparent select-none",
                      )}
                      aria-live="polite"
                    >
                      {error || "\u00a0"}
                    </p>
                    <p className="text-xs text-gray-400">
                      ※ デモ環境ではコードはブラウザのコンソールに表示されます
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
                        : "認証コードを再送信"}
                    </Button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1)
                        setOtpInput("")
                        setError("")
                        setResendCooldown(0)
                        verifyingRef.current = false
                        setLoading(false)
                      }}
                      disabled={loading}
                      className="inline-flex items-center gap-2 text-sm text-[#1e3a5f] hover:underline disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      戻る
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
