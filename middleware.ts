import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  AUTH_OTP_VERIFIED_COOKIE,
  AUTH_USER_ID_COOKIE,
  isPublicPath,
} from "@/lib/auth-constants"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userId = request.cookies.get(AUTH_USER_ID_COOKIE)?.value
  const otpVerified = request.cookies.get(AUTH_OTP_VERIFIED_COOKIE)?.value === "1"

  if (isPublicPath(pathname)) {
    if (pathname.startsWith("/login")) {
      if (userId && otpVerified) {
        return NextResponse.redirect(new URL("/", request.url))
      }
      if (userId && !otpVerified) {
        return NextResponse.redirect(new URL("/otp-verify", request.url))
      }
    }

    if (pathname.startsWith("/otp-verify")) {
      if (!userId) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      if (otpVerified) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    return NextResponse.next()
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (!otpVerified) {
    return NextResponse.redirect(new URL("/otp-verify", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
