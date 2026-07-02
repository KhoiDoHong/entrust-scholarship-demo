export const AUTH_USER_ID_COOKIE = "entrust_user_id"
export const AUTH_OTP_VERIFIED_COOKIE = "entrust_otp_verified"

export const PUBLIC_PATHS = [
  "/login",
  "/otp-verify",
  "/forgot-password",
  "/password-reset",
] as const

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}
