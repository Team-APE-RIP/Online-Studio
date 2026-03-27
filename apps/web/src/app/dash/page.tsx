"use client";

import Image from "next/image";
import { clearAuthToken, getCurrentAuthUser } from "@/src/lib/auth";
import { fetchApi } from "@/src/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface AdminSummary {
  users: number;
  organizations: number;
  repositories: number;
  projects: number;
  resources: number;
  verifiedEmails: number;
  activeMembers: number;
}

interface AdminUserItem {
  id: string;
  username: string;
  displayName: string;
  globalRole: string;
  accountStatus: string;
  primaryEmail: string | null;
  organizationCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminRuntimeInfo {
  appName: string;
  nodeEnv: string;
  uptimeSeconds: number;
  timestamp: string;
  runtime: {
    uploadDir: string;
    tempDir: string;
    cacheDir: string;
    logDir: string;
  };
}

interface AdminSystemInfo {
  appName: string;
  defaultLocale: string;
  fallbackLocale: string;
  serverPort: number;
  runtime: {
    uploadDir: string;
    tempDir: string;
    cacheDir: string;
    logDir: string;
  };
}

type DashboardSection = "overview" | "users" | "system";
type LoadState = "loading" | "ready" | "forbidden" | "error";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN");
}

function formatUptime(seconds: number) {
  const total = Math.max(0, seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  parts.push(`${minutes}分钟`);
  return parts.join(" ");
}

export default function DashPage() {
  const router = useRouter();
  const authUser = useMemo(() => getCurrentAuthUser(), []);
  const [section, setSection] = useState<DashboardSection>("overview");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [runtimeInfo, setRuntimeInfo] = useState<AdminRuntimeInfo | null>(null);
  const [systemInfo, setSystemInfo] = useState<AdminSystemInfo | null>(null);

  useEffect(() => {
    if (!authUser) {
      router.replace("/auth/login");
      return;
    }

    if (authUser.role !== "admin") {
      setLoadState("forbidden");
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      try {
        await fetchApi("/admin/verify");
        const [summaryResponse, usersResponse, runtimeResponse, systemResponse] =
          await Promise.all([
            fetchApi<AdminSummary>("/admin/summary"),
            fetchApi<AdminUserItem[]>("/admin/users"),
            fetchApi<AdminRuntimeInfo>("/admin/runtime"),
            fetchApi<AdminSystemInfo>("/admin/system"),
          ]);

        if (cancelled) {
          return;
        }

        setSummary(summaryResponse.data);
        setUsers(usersResponse.data);
        setRuntimeInfo(runtimeResponse.data);
        setSystemInfo(systemResponse.data);
        setLoadState("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setLoadState("error");
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [authUser, router]);

  function handleLogout() {
    clearAuthToken();
    router.replace("/auth/login");
    router.refresh();
  }

  const overviewCards = summary
    ? [
        { label: "用户总数", value: summary.users, hint: "当前系统中的全部账号" },
        {
          label: "组织数量",
          value: summary.organizations,
          hint: "当前已创建的组织",
        },
        {
          label: "库数量",
          value: summary.repositories,
          hint: "当前已创建的组织库",
        },
        { label: "项目数量", value: summary.projects, hint: "当前已创建的项目" },
        {
          label: "资源数量",
          value: summary.resources,
          hint: "当前系统内全部资源",
        },
        {
          label: "已验证邮箱",
          value: summary.verifiedEmails,
          hint: "当前已验证的邮箱数",
        },
        {
          label: "有效成员关系",
          value: summary.activeMembers,
          hint: "当前有效组织成员数",
        },
      ]
    : [];

  return (
    <main className="min-h-screen px-4 pb-10 pt-6 md:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel-strong rounded-[32px] p-5">
          <div className="rounded-[24px] border border-[var(--line-soft)] bg-white/6 p-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border border-[var(--line-soft)] bg-white/8">
              <Image
                src="/branding/apeos-logo-large.webp"
                alt="APEOS"
                width={80}
                height={80}
                className="h-20 w-20 object-cover"
                priority
              />
            </div>
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Team APE:RIP
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-[-0.05em] text-[var(--text-strong)]">
              Admin Dashboard
            </h1>
            <div className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              管理员专用控制台，用于查看运行状态、用户信息与系统概要。
            </div>
          </div>

          <nav className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={() => setSection("overview")}
              className={`rounded-[20px] border px-4 py-3 text-left text-sm font-semibold transition ${
                section === "overview"
                  ? "border-transparent text-[var(--button-primary-text)]"
                  : "border-[var(--line-soft)] bg-white/6 text-[var(--text-secondary)]"
              }`}
              style={
                section === "overview"
                  ? {
                      background: "var(--button-primary-bg)",
                    }
                  : undefined
              }
            >
              主仪表盘
            </button>
            <button
              type="button"
              onClick={() => setSection("users")}
              className={`rounded-[20px] border px-4 py-3 text-left text-sm font-semibold transition ${
                section === "users"
                  ? "border-transparent text-[var(--button-primary-text)]"
                  : "border-[var(--line-soft)] bg-white/6 text-[var(--text-secondary)]"
              }`}
              style={
                section === "users"
                  ? {
                      background: "var(--button-primary-bg)",
                    }
                  : undefined
              }
            >
              用户信息
            </button>
            <button
              type="button"
              onClick={() => setSection("system")}
              className={`rounded-[20px] border px-4 py-3 text-left text-sm font-semibold transition ${
                section === "system"
                  ? "border-transparent text-[var(--button-primary-text)]"
                  : "border-[var(--line-soft)] bg-white/6 text-[var(--text-secondary)]"
              }`}
              style={
                section === "system"
                  ? {
                      background: "var(--button-primary-bg)",
                    }
                  : undefined
              }
            >
              运行状态
            </button>
          </nav>

          <div className="mt-5 rounded-[24px] border border-[var(--line-soft)] bg-white/6 p-5">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              当前账号
            </div>
            <div className="mt-3 text-base font-semibold text-[var(--text-strong)]">
              {authUser?.username ?? "-"}
            </div>
            <div className="mt-1 text-sm text-[var(--text-secondary)]">
              {authUser?.email ?? "-"}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[var(--line-soft)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/10"
              >
                退出登录
              </button>
            </div>
          </div>
        </aside>

        <section className="grid gap-6">
          {loadState === "loading" ? (
            <div className="glass-panel rounded-[32px] p-6 text-sm text-[var(--text-secondary)]">
              正在加载管理员面板…
            </div>
          ) : null}

          {loadState === "forbidden" ? (
            <div className="glass-panel rounded-[32px] p-6">
              <div className="text-lg font-semibold text-[var(--text-strong)]">
                无权访问
              </div>
              <div className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                当前账号不是管理员，无法进入该页面。
              </div>
            </div>
          ) : null}

          {loadState === "error" ? (
            <div className="glass-panel rounded-[32px] p-6">
              <div className="text-lg font-semibold text-[var(--text-strong)]">
                加载失败
              </div>
              <div className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                管理员接口暂时不可用，请检查登录状态或后端服务。
              </div>
            </div>
          ) : null}

          {loadState === "ready" && section === "overview" ? (
            <>
              <header className="glass-panel-strong rounded-[32px] p-6 md:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Dashboard
                </div>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--text-strong)]">
                  主仪表盘
                </h2>
                <p className="mt-3 max-w-[52ch] text-sm leading-7 text-[var(--text-secondary)]">
                  查看当前系统内的用户、组织、库、项目与资源概况。
                </p>
              </header>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card) => (
                  <article key={card.label} className="glass-panel rounded-[28px] p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {card.label}
                    </div>
                    <div className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--text-strong)]">
                      {card.value}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {card.hint}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {loadState === "ready" && section === "users" ? (
            <>
              <header className="glass-panel-strong rounded-[32px] p-6 md:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Users
                </div>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--text-strong)]">
                  用户信息
                </h2>
                <p className="mt-3 max-w-[52ch] text-sm leading-7 text-[var(--text-secondary)]">
                  查看账号、主邮箱、角色、组织数量与创建时间。
                </p>
              </header>

              <div className="glass-panel rounded-[32px] p-4 md:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        <th className="px-3 py-2">用户名</th>
                        <th className="px-3 py-2">显示名称</th>
                        <th className="px-3 py-2">邮箱</th>
                        <th className="px-3 py-2">角色</th>
                        <th className="px-3 py-2">状态</th>
                        <th className="px-3 py-2">组织数</th>
                        <th className="px-3 py-2">创建时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="rounded-[20px] bg-white/6 text-sm text-[var(--text-secondary)]">
                          <td className="rounded-l-[20px] px-3 py-4 font-semibold text-[var(--text-strong)]">
                            {user.username}
                          </td>
                          <td className="px-3 py-4">{user.displayName}</td>
                          <td className="px-3 py-4">{user.primaryEmail || "-"}</td>
                          <td className="px-3 py-4">{user.globalRole}</td>
                          <td className="px-3 py-4">{user.accountStatus}</td>
                          <td className="px-3 py-4">{user.organizationCount}</td>
                          <td className="rounded-r-[20px] px-3 py-4">
                            {formatDateTime(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}

          {loadState === "ready" && section === "system" ? (
            <>
              <header className="glass-panel-strong rounded-[32px] p-6 md:p-7">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Runtime
                </div>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--text-strong)]">
                  运行状态
                </h2>
                <p className="mt-3 max-w-[52ch] text-sm leading-7 text-[var(--text-secondary)]">
                  查看当前服务运行时间、环境配置与运行目录。
                </p>
              </header>

              <div className="grid gap-4 xl:grid-cols-2">
                <section className="glass-panel rounded-[28px] p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Runtime Overview
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">应用名称：</span>
                      {runtimeInfo?.appName ?? "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">运行环境：</span>
                      {runtimeInfo?.nodeEnv ?? "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">运行时长：</span>
                      {runtimeInfo ? formatUptime(runtimeInfo.uptimeSeconds) : "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">最近时间：</span>
                      {runtimeInfo ? formatDateTime(runtimeInfo.timestamp) : "-"}
                    </div>
                  </div>
                </section>

                <section className="glass-panel rounded-[28px] p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    System Overview
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">默认语言：</span>
                      {systemInfo?.defaultLocale ?? "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">回退语言：</span>
                      {systemInfo?.fallbackLocale ?? "-"}
                    </div>
                    <div>
                      <span className="font-semibold text-[var(--text-strong)]">服务端口：</span>
                      {systemInfo?.serverPort ?? "-"}
                    </div>
                  </div>
                </section>
              </div>

              <div className="glass-panel rounded-[32px] p-6">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Runtime Paths
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="font-semibold text-[var(--text-strong)]">Uploads</div>
                    <div className="mt-1 break-all">{runtimeInfo?.runtime.uploadDir ?? "-"}</div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="font-semibold text-[var(--text-strong)]">Temp</div>
                    <div className="mt-1 break-all">{runtimeInfo?.runtime.tempDir ?? "-"}</div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="font-semibold text-[var(--text-strong)]">Cache</div>
                    <div className="mt-1 break-all">{runtimeInfo?.runtime.cacheDir ?? "-"}</div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="font-semibold text-[var(--text-strong)]">Logs</div>
                    <div className="mt-1 break-all">{runtimeInfo?.runtime.logDir ?? "-"}</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}