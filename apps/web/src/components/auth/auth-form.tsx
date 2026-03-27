"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { saveAuthToken } from "@/src/lib/auth";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

interface AuthSuccessResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string;
      globalRole: string;
      createdAt: string;
    };
  };
  timestamp: string;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const endpoint = useMemo(
    () =>
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}/auth/${
        isRegister ? "register" : "login"
      }`,
    [isRegister],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = isRegister
        ? {
            email,
            username,
            displayName,
            password,
          }
        : {
            emailOrUsername,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as AuthSuccessResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Authentication failed");
      }

      saveAuthToken(result.data.token);
      setFeedback(isRegister ? "注册成功，正在进入工作台..." : "登录成功，正在进入工作台...");
      router.push("/studio");
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "请求失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-panel rounded-[30px] p-6 md:p-8"
    >
      <div className="grid gap-6">
        {isRegister ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">邮箱</span>
              <input
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">用户名</span>
              <input
                name="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="例如：taros_ape"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">显示名称</span>
              <input
                name="displayName"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="例如：Taros APE"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>
          </>
        ) : (
          <label className="grid gap-2">
            <span className="text-sm font-medium text-white">邮箱或用户名</span>
            <input
              name="emailOrUsername"
              required
              value={emailOrUsername}
              onChange={(event) => setEmailOrUsername(event.target.value)}
              placeholder="输入邮箱或用户名"
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
            />
          </label>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-white">密码</span>
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "提交中..." : isRegister ? "注册账号" : "登录"}
        </button>
        <a
          href={isRegister ? "/auth/login" : "/auth/register"}
          className="rounded-full border border-white/10 bg-white/8 px-6 py-3 text-sm text-white/82 transition hover:bg-white/12"
        >
          {isRegister ? "去登录" : "去注册"}
        </a>
      </div>

      {feedback ? (
        <div className="mt-6 rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm leading-7 text-sky-100/85">
          {feedback}
        </div>
      ) : null}
    </form>
  );
}