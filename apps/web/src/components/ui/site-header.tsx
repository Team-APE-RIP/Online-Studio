"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { clearAuthToken, getCurrentAuthUser } from "@/src/lib/auth";
import { SitePreferences } from "./site-preferences";

type MenuKey = "workspace" | "resources" | "account" | null;

const workspaceLinks = [
  { href: "/", label: "首页" },
  { href: "/studio", label: "工作台" },
  { href: "/studio/organizations/new", label: "新建组织" },
  { href: "/studio/projects/new", label: "新建项目" },
];

const resourceLinks = [
  { href: "/studio/resources/new", label: "新建资源" },
  { href: "/studio/projects/new", label: "项目入口" },
  { href: "/studio", label: "我的组织" },
];

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const authUser = useMemo(() => getCurrentAuthUser(), []);

  const accountLinks = useMemo(() => {
    if (!authUser) {
      return [
        { href: "/auth/login", label: "登录" },
        { href: "/auth/register", label: "注册" },
      ];
    }

    const items = [
      { href: "/studio", label: "进入工作台" },
    ];

    if (authUser.role === "admin") {
      items.push({ href: "/dash", label: "管理后台" });
    }

    return items;
  }, [authUser]);

  function closeMenu() {
    setOpenMenu(null);
  }

  function toggleMenu(key: Exclude<MenuKey, null>) {
    setOpenMenu((current) => (current === key ? null : key));
  }

  function handleLogout() {
    clearAuthToken();
    window.location.href = "/auth/login";
  }

  return (
    <header className="site-header-wrap">
      <div className="site-header">
        <div className="site-header__brand">
          <Link href="/" className="site-header__brand-link" onClick={closeMenu}>
            <span className="site-header__brand-mark">
              <Image
                src="/branding/apeos-logo-large.webp"
                alt="APEOS"
                width={48}
                height={48}
                className="site-header__brand-image"
                priority
              />
            </span>
            <span className="site-header__brand-copy">
              <span className="site-header__brand-kicker">Team APE:RIP</span>
              <span className="site-header__brand-title">Online Studio</span>
            </span>
          </Link>
        </div>

        <nav className="site-header__nav" aria-label="Primary">
          <Link href="/" className="site-header__nav-link" onClick={closeMenu}>
            首页
          </Link>

          <div className={`site-header__nav-item ${openMenu === "workspace" ? "is-open" : ""}`}>
            <button
              type="button"
              className="site-header__nav-link site-header__nav-link--button"
              onClick={() => toggleMenu("workspace")}
            >
              工作区
              <span className="site-header__nav-arrow">▾</span>
            </button>
            <div className="site-header__dropdown">
              <div className="site-header__dropdown-panel">
                <div className="site-header__dropdown-title">工作区入口</div>
                <div className="site-header__dropdown-links">
                  {workspaceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="site-header__dropdown-link"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`site-header__nav-item ${openMenu === "resources" ? "is-open" : ""}`}>
            <button
              type="button"
              className="site-header__nav-link site-header__nav-link--button"
              onClick={() => toggleMenu("resources")}
            >
              资源
              <span className="site-header__nav-arrow">▾</span>
            </button>
            <div className="site-header__dropdown">
              <div className="site-header__dropdown-panel">
                <div className="site-header__dropdown-title">核心模块</div>
                <div className="site-header__dropdown-links">
                  {resourceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="site-header__dropdown-link"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="site-header__actions">
          <SitePreferences />

          <div className={`site-header__nav-item ${openMenu === "account" ? "is-open" : ""}`}>
            <button
              type="button"
              className="site-header__account"
              onClick={() => toggleMenu("account")}
            >
              <span className="site-header__account-name">
                {authUser ? authUser.username : "账户"}
              </span>
              <span className="site-header__nav-arrow">▾</span>
            </button>

            <div className="site-header__dropdown site-header__dropdown--right">
              <div className="site-header__dropdown-panel site-header__dropdown-panel--compact">
                <div className="site-header__dropdown-title">
                  {authUser ? (authUser.role === "admin" ? "管理员账户" : "当前账户") : "访问入口"}
                </div>
                <div className="site-header__dropdown-links">
                  {accountLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="site-header__dropdown-link"
                      onClick={closeMenu}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {authUser ? (
                    <button
                      type="button"
                      className="site-header__dropdown-link site-header__dropdown-link--danger"
                      onClick={handleLogout}
                    >
                      退出登录
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openMenu ? <button type="button" className="site-header__backdrop" onClick={closeMenu} /> : null}
    </header>
  );
}