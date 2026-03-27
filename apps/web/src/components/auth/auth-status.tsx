"use client";

import { useEffect, useState } from "react";
import { clearAuthToken, getCurrentAuthUser, type AuthUserPayload } from "@/src/lib/auth";

export function AuthStatus() {
  const [user, setUser] = useState<AuthUserPayload | null>(null);

  useEffect(() => {
    setUser(getCurrentAuthUser());
  }, []);

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    window.location.href = "/";
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/auth/login"
          className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 transition hover:bg-white/12"
        >
          登录
        </a>
        <a
          href="/auth/register"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
        >
          注册
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
        {user.username} · {user.role}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 transition hover:bg-white/12"
      >
        退出
      </button>
    </div>
  );
}