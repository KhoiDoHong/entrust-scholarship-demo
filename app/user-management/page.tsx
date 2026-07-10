"use client"

import { useState, useMemo } from "react"
import { Plus, X, PowerOff, Power, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DEMO_ACCOUNTS, type UserAccount, type UserRole } from "@/lib/auth"
import { applications } from "@/lib/applications-data"
import { cn } from "@/lib/utils"
import {
  completeModalSubmitSuccess,
  MODAL_SUCCESS_MESSAGES,
} from "@/lib/modal-submit-success"

import { SCHOOLS, schoolOptionLabel, CORPORATIONS as CORP_MASTER, corporationOptionLabel } from "@/lib/masters"

const unique = (arr: string[]) => [...new Set(arr)].sort()
const CORP_NAMES = unique(applications.map((a) => a.corporationName))
const FACILITY_NAMES = unique(applications.map((a) => a.facilityName))

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "school", label: "養成校" },
  { value: "corporation", label: "法人施設" },
  { value: "association", label: "介護協" },
  { value: "entrust", label: "イントラスト社内" },
]

const ROLE_BADGE: Record<UserRole, string> = {
  school: "bg-green-100 text-green-700",
  corporation: "bg-blue-100 text-blue-700",
  association: "bg-purple-100 text-purple-700",
  entrust: "bg-orange-100 text-orange-700",
}

interface FormState {
  email: string
  phone: string
  name: string
  nameKana: string
  role: UserRole | ""
  houjinId: string
  operatorId: string
}

const EMPTY: FormState = { email: "", phone: "", name: "", nameKana: "", role: "", houjinId: "", operatorId: "" }

function FormField({
  id, label, value, onChange, placeholder, type = "text", required = false,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-white" />
    </div>
  )
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

type ExtUser = UserAccount & {
  loginId: string
  email: string
  phone?: string
  nameKana?: string
  schoolName?: string
  corporationName?: string
  houjinId?: string
  operatorId?: string
  active?: boolean
}

function toExtUser(u: UserAccount): ExtUser {
  return {
    ...u,
    loginId: u.userId,
    email: `${u.userId}@example.com`,
    phone: "090-0000-0001",
    nameKana: "",
    schoolName: u.role === "school" ? u.organization : undefined,
    corporationName: u.role === "corporation" ? u.organization : undefined,
    active: u.role !== "association",
  }
}

let sessionExtraUsers: ExtUser[] = []
const userActiveOverrides = new Map<string, boolean>()

function fetchUsers(): ExtUser[] {
  return [...DEMO_ACCOUNTS.map(toExtUser), ...sessionExtraUsers].map((u) => ({
    ...u,
    active: userActiveOverrides.has(u.loginId)
      ? userActiveOverrides.get(u.loginId)
      : u.active,
  }))
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<ExtUser[]>(() => fetchUsers())

  const refreshUsers = () => setUsers(fetchUsers())

  const [filters, setFilters] = useState({
    loginId: "",
    name: "",
    email: "",
    phone: "",
    userType: "all",
    schoolName: "",
    corporationName: "",
    activeStatus: "all",
  })
  const [appliedFilters, setAppliedFilters] = useState({ ...filters })
  const [confirmTarget, setConfirmTarget] = useState<{ index: number; action: "deactivate" | "activate" } | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const set = (key: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const openCreate = () => {
    setForm(EMPTY)
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setForm(EMPTY)
    setErrors({})
  }

  const toggleActive = (index: number) => {
    const user = users[index]
    const isActive = user.active !== false
    setConfirmTarget({ index, action: isActive ? "deactivate" : "activate" })
  }

  const confirmToggle = () => {
    if (!confirmTarget) return
    const { index, action } = confirmTarget
    const targetUser = users[index]
    userActiveOverrides.set(targetUser.loginId, action === "activate")
    completeModalSubmitSuccess({
      title:
        action === "activate"
          ? MODAL_SUCCESS_MESSAGES.userActivated
          : MODAL_SUCCESS_MESSAGES.userDeactivated,
      onClose: () => setConfirmTarget(null),
      onRefresh: refreshUsers,
    })
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (appliedFilters.loginId && !u.loginId.toLowerCase().includes(appliedFilters.loginId.toLowerCase())) return false
      if (appliedFilters.name && !u.name.includes(appliedFilters.name)) return false
      if (appliedFilters.email && !u.email.toLowerCase().includes(appliedFilters.email.toLowerCase())) return false
      if (appliedFilters.phone && !(u.phone ?? "").includes(appliedFilters.phone)) return false
      if (appliedFilters.userType !== "all" && u.role !== appliedFilters.userType) return false
      if (appliedFilters.schoolName && !(u.schoolName ?? u.organization ?? "").includes(appliedFilters.schoolName)) return false
      if (appliedFilters.corporationName && !(u.corporationName ?? u.organization ?? "").includes(appliedFilters.corporationName)) return false
      const isActive = u.active !== false
      if (appliedFilters.activeStatus === "active" && !isActive) return false
      if (appliedFilters.activeStatus === "inactive" && isActive) return false
      return true
    })
  }, [users, appliedFilters])

  const handleSearch = () => setAppliedFilters({ ...filters })
  const handleClear = () => {
    const empty = {
      loginId: "",
      name: "",
      email: "",
      phone: "",
      userType: "all",
      schoolName: "",
      corporationName: "",
      activeStatus: "all",
    }
    setFilters(empty)
    setAppliedFilters(empty)
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.email) errs.email = "メールアドレスを入力してください"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "有効なメールアドレスを入力してください"
    if (!form.phone) errs.phone = "電話番号を入力してください"
    if (!form.name) errs.name = "氏名を入力してください"
    if (!form.nameKana) errs.nameKana = "氏名カナを入力してください"
    if (!form.role) errs.role = "ユーザ種別を選択してください"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const roleLabel = USER_ROLES.find((r) => r.value === form.role)?.label ?? ""
    const newUser: ExtUser = {
      loginId: form.email.split("@")[0] || form.name,
      email: form.email,
      phone: form.phone,
      name: form.name,
      nameKana: form.nameKana,
      role: form.role as UserRole,
      userId: form.email.split("@")[0] || form.name,
      label: roleLabel,
      organization: form.houjinId || form.operatorId,
      schoolName: form.houjinId || undefined,
      corporationName: form.operatorId || undefined,
      houjinId: form.houjinId,
      operatorId: form.operatorId,
      active: true,
    }
    sessionExtraUsers = [...sessionExtraUsers, newUser]
    completeModalSubmitSuccess({
      title: MODAL_SUCCESS_MESSAGES.userCreated,
      description: form.email,
      onClose: closeModal,
      onRefresh: refreshUsers,
    })
  }

  const showHoujin = form.role === "school"
  const showOperator = form.role === "corporation"
  const hideAll = form.role === "association" || form.role === "entrust"

  const activeCount = users.filter((u) => u.active !== false).length

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">ユーザ管理</h1>
            <p className="text-gray-500 mt-1">システムユーザの一覧と管理</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={openCreate}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
            >
              <Plus className="w-4 h-4" />
              ユーザ作成
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField id="f-loginId" label="ID" value={filters.loginId} onChange={(v) => setFilters((f) => ({ ...f, loginId: v }))} placeholder="IDで検索..." />
                <FormField id="f-name" label="氏名" value={filters.name} onChange={(v) => setFilters((f) => ({ ...f, name: v }))} placeholder="氏名で検索..." />
                <FormField id="f-email" label="メールアドレス" value={filters.email} onChange={(v) => setFilters((f) => ({ ...f, email: v }))} placeholder="メールアドレスで検索..." />
                <div className="space-y-1.5">
                  <Label>ユーザ種別</Label>
                  <Select value={filters.userType} onValueChange={(v) => setFilters((f) => ({ ...f, userType: v }))}>
                    <SelectTrigger className="w-full bg-white"><SelectValue placeholder="すべて" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      {USER_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField id="f-phone" label="電話番号" value={filters.phone} onChange={(v) => setFilters((f) => ({ ...f, phone: v }))} placeholder="電話番号で検索..." />
                <FormField id="f-school" label="養成校名" value={filters.schoolName} onChange={(v) => setFilters((f) => ({ ...f, schoolName: v }))} placeholder="養成校名で検索..." />
                <FormField id="f-corp" label="法人名・施設名" value={filters.corporationName} onChange={(v) => setFilters((f) => ({ ...f, corporationName: v }))} placeholder="法人名・施設名で検索..." />
                <div className="space-y-1.5">
                  <Label>有効状態</Label>
                  <Select
                    value={filters.activeStatus}
                    onValueChange={(v) => setFilters((f) => ({ ...f, activeStatus: v }))}
                  >
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="active">有効</SelectItem>
                      <SelectItem value="inactive">無効</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleSearch}
                  className="gap-2 bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
                >
                  <Search className="w-4 h-4" />
                  検索
                </Button>
                <Button variant="outline" onClick={handleClear} className="gap-2">
                  <X className="w-4 h-4" />
                  クリア
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              {filteredUsers.length} 件中 1 - {filteredUsers.length} 件を表示
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">氏名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">メールアドレス</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">電話番号</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ユーザ種別</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">養成校名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">法人名・施設名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">有効状態</th>
                    <th className="py-3 px-4 font-medium text-gray-600 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400">該当するユーザが見つかりませんでした</td>
                    </tr>
                  ) : filteredUsers.map((u) => {
                    const i = users.indexOf(u)
                    const isActive = u.active !== false
                    return (
                      <tr key={u.loginId} className={cn("transition-colors", isActive ? "hover:bg-gray-50" : "bg-gray-50 opacity-60")}>
                        <td className="py-3 px-4 text-gray-600">{u.loginId}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4 text-gray-600">{u.phone ?? "-"}</td>
                        <td className="py-3 px-4">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", ROLE_BADGE[u.role])}>{u.label}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.role === "school" ? (u.schoolName ?? u.organization ?? "-") : "-"}</td>
                        <td className="py-3 px-4 text-gray-600">{u.role === "corporation" ? (u.corporationName ?? u.organization ?? "-") : "-"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                            )}
                          >
                            {isActive ? "有効" : "無効"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => toggleActive(i)} title={isActive ? "無効化" : "有効化"}
                            className={cn("p-1.5 rounded transition-colors", isActive ? "hover:bg-red-50 text-red-400 hover:text-red-600" : "hover:bg-green-50 text-green-500 hover:text-green-700")}>
                            {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmTarget.action === "deactivate" ? "ユーザの無効化" : "ユーザの有効化"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmTarget.action === "deactivate"
                ? "このユーザを無効化しますか？"
                : "このユーザを有効化しますか？"}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmTarget(null)}>キャンセル</Button>
              <Button onClick={confirmToggle} variant={confirmTarget.action === "deactivate" ? "destructive" : "default"}>
                {confirmTarget.action === "deactivate" ? "無効化する" : "有効化する"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">ユーザ作成</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <FormField id="m-email" label="メールアドレス" type="email" value={form.email}
                        onChange={set("email")} placeholder="example@domain.com" required />
                      <FieldInlineError id="m-email-error" message={errors.email} />
                    </div>
                    <div>
                      <FormField id="m-phone" label="電話番号" type="tel" value={form.phone}
                        onChange={set("phone")} placeholder="090-0000-0000" required />
                      <FieldInlineError id="m-phone-error" message={errors.phone} />
                    </div>
                    <div>
                      <FormField id="m-name" label="氏名" value={form.name}
                        onChange={set("name")} placeholder="山田 太郎" required />
                      <FieldInlineError id="m-name-error" message={errors.name} />
                    </div>
                    <div>
                      <FormField id="m-nameKana" label="氏名カナ" value={form.nameKana}
                        onChange={set("nameKana")} placeholder="ヤマダ タロウ" required />
                      <FieldInlineError id="m-nameKana-error" message={errors.nameKana} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="m-role">
                      ユーザ種別<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select value={form.role} onValueChange={(v) => {
                      set("role")(v)
                      set("houjinId")("")
                      set("operatorId")("")
                    }}>
                      <SelectTrigger id="m-role" className="w-full">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldInlineError id="m-role-error" message={errors.role} />
                  </div>

                  {!hideAll && showHoujin && (
                    <div className="space-y-1.5">
                      <Label htmlFor="m-houjin">養成校名</Label>
                      <Select value={form.houjinId} onValueChange={(v) => set("houjinId")(v)}>
                        <SelectTrigger id="m-houjin" className="w-full">
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHOOLS.map((s) => (
                            <SelectItem key={s.schoolId} value={s.schoolName}>{schoolOptionLabel(s)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!hideAll && showOperator && (
                    <div className="space-y-1.5">
                      <Label htmlFor="m-operator">法人名・施設名</Label>
                      <Select value={form.operatorId} onValueChange={(v) => set("operatorId")(v)}>
                        <SelectTrigger id="m-operator" className="w-full">
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          {CORP_MASTER.map((c) => (
                            <SelectItem key={c.corporationId} value={c.corporationName}>{corporationOptionLabel(c)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-5">
              <Button variant="outline" onClick={closeModal}>キャンセル</Button>
              <Button
                onClick={handleSubmit}
                className="bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white"
              >
                作成
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
