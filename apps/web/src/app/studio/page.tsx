"use client";

import { AuthStatus } from "@/src/components/auth/auth-status";
import { fetchApi } from "@/src/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

interface OrganizationItem {
  id: string;
  membershipId: string;
  name: string;
  slug: string;
  description: string | null;
  role: string;
  repositoryCount: number;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

type LoadState = "loading" | "ready" | "error";

function formatDateTime(value: string, locale: string) {
  return new Date(value).toLocaleString(locale === "zh-CN" ? "zh-CN" : "en-US");
}

function getRoleLabel(role: string, locale: ReturnType<typeof useTranslations>) {
  switch (role.toLowerCase()) {
    case "owner":
      return locale("owner");
    case "admin":
      return locale("admin");
    case "maintainer":
      return locale("maintainer");
    case "editor":
      return locale("editor");
    case "viewer":
      return locale("viewer");
    case "guest":
      return locale("guest");
    default:
      return role;
  }
}

export default function StudioPage() {
  const t = useTranslations("studio.page");
  const roleT = useTranslations("studio.roles");
  const locale = useLocale();

  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      try {
        const response = await fetchApi<OrganizationItem[]>("/organizations");

        if (cancelled) {
          return;
        }

        setOrganizations(response.data);
        setLoadState("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setOrganizations([]);
        setLoadState("error");
      }
    }

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(
    () => ({
      organizationCount: organizations.length,
      repositoryCount: organizations.reduce(
        (sum, organization) => sum + organization.repositoryCount,
        0,
      ),
      projectCount: organizations.reduce(
        (sum, organization) => sum + organization.projectCount,
        0,
      ),
      membershipCount: organizations.length,
    }),
    [organizations],
  );

  const statCards = [
    {
      label: t("stats.organizations"),
      value: summary.organizationCount,
      hint: t("statsHints.organizations"),
    },
    {
      label: t("stats.repositories"),
      value: summary.repositoryCount,
      hint: t("statsHints.repositories"),
    },
    {
      label: t("stats.projects"),
      value: summary.projectCount,
      hint: t("statsHints.projects"),
    },
    {
      label: t("stats.memberships"),
      value: summary.membershipCount,
      hint: t("statsHints.memberships"),
    },
  ];

  return (
    <main className="min-h-screen px-4 pb-14 pt-6 md:px-8 lg:px-10">
      <section className="relative z-10 mx-auto flex max-w-[1260px] flex-col gap-6">
        <header className="glass-panel-strong overflow-hidden rounded-[36px] px-6 py-6 md:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-end">
            <div>
              <div className="inline-flex rounded-full border border-[var(--line-soft)] bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {t("eyebrow")}
              </div>
              <h1 className="mt-5 max-w-[10ch] text-4xl font-black leading-[0.92] tracking-[-0.08em] text-[var(--text-strong)] md:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-5 max-w-[52ch] text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                {t("subtitle")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/studio/organizations/new"
                  className="rounded-full px-5 py-3 text-sm font-bold"
                  style={{
                    background: "var(--button-primary-bg)",
                    color: "var(--button-primary-text)",
                    boxShadow: "var(--shadow-medium)",
                  }}
                >
                  {t("primaryCta")}
                </a>
                <a
                  href="/"
                  className="rounded-full border border-[var(--line-soft)] px-5 py-3 text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-white/10"
                  style={{
                    background: "var(--button-secondary-bg)",
                  }}
                >
                  {t("secondaryCta")}
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-[var(--line-soft)] bg-white/6 p-5 shadow-[var(--shadow-medium)]">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t("authCardTag")}
                </div>
                <div className="mt-4">
                  <AuthStatus />
                </div>
              </div>

              <div className="rounded-[30px] border border-[var(--line-soft)] bg-white/6 p-5 shadow-[var(--shadow-medium)]">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t("scopeTitle")}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {t("scopeDescription")}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <article key={item.label} className="glass-panel rounded-[28px] p-5">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {item.label}
              </div>
              <div className="mt-3 text-4xl font-black tracking-[-0.06em] text-[var(--text-strong)]">
                {item.value}
              </div>
              <div className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {item.hint}
              </div>
            </article>
          ))}
        </section>

        <section className="glass-panel rounded-[32px] p-6 md:p-7">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {t("sectionTag")}
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text-strong)]">
              {t("sectionTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {t("sectionDescription")}
            </p>
          </div>

          <div className="mt-6">
            {loadState === "loading" ? (
              <div className="rounded-[26px] border border-[var(--line-soft)] bg-white/6 px-5 py-5 text-sm text-[var(--text-secondary)]">
                {t("loading")}
              </div>
            ) : null}

            {loadState === "error" ? (
              <div className="rounded-[26px] border border-[var(--line-soft)] bg-white/6 px-5 py-5 text-sm text-[var(--text-secondary)]">
                {t("error")}
              </div>
            ) : null}

            {loadState === "ready" && organizations.length === 0 ? (
              <div className="rounded-[26px] border border-[var(--line-soft)] bg-white/6 px-5 py-5">
                <div className="text-lg font-semibold text-[var(--text-strong)]">
                  {t("emptyTitle")}
                </div>
                <div className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {t("emptyDescription")}
                </div>
              </div>
            ) : null}

            {loadState === "ready" && organizations.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {organizations.map((organization) => (
                  <article
                    key={organization.membershipId}
                    className="rounded-[28px] border border-[var(--line-soft)] bg-white/6 p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                          {organization.name}
                        </h3>
                        <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {organization.slug}
                        </div>
                      </div>

                      <span className="rounded-full border border-[var(--line-soft)] px-3 py-1 text-xs font-semibold text-[var(--badge-core-text)]">
                        {getRoleLabel(organization.role, roleT)}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                      {organization.description || organization.slug}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {t("repositories")}
                        </div>
                        <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                          {organization.repositoryCount}
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {t("projects")}
                        </div>
                        <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                          {organization.projectCount}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-[var(--text-secondary)]">
                        {t("updatedAt")} ·{" "}
                        {formatDateTime(organization.updatedAt, locale)}
                      </div>

                      <a
                        href={`/studio/organizations/${organization.slug}`}
                        className="rounded-full px-4 py-2 text-sm font-semibold"
                        style={{
                          background: "var(--button-primary-bg)",
                          color: "var(--button-primary-text)",
                        }}
                      >
                        {t("openOrganization")}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}