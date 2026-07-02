"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  getAuthenticatedSession,
  getSession,
  isOtpVerified,
  type UserAccount,
} from "@/lib/auth"

interface AuthGuardProps {
  children: (user: UserAccount) => ReactNode
  fallback?: ReactNode
}

/**
 * Client-side auth guard for protected UI.
 * Middleware handles first paint; this covers SPA edge cases and supplies the user.
 */
export function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserAccount | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const authenticated = getAuthenticatedSession()
    if (authenticated) {
      setUser(authenticated)
      setChecked(true)
      return
    }

    const pending = getSession()
    if (pending && !isOtpVerified()) {
      router.replace("/otp-verify")
      return
    }

    router.replace("/login")
  }, [router])

  if (!checked || !user) return fallback

  return <>{children(user)}</>
}
