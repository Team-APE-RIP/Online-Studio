"use client";

import { fetchApi } from "@/src/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
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

interface ProjectItem {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

type LoadState = "loading" | "ready" | "error" | "forbidden";

function formatDateTime(value: string, locale: string) {
  return new Date(value).toLocaleString(locale === "zh-CN" ? "zh-CN" : "en-US");
}

function getRoleLabel(role: string, t: ReturnType<typeof useTranslations>) {
  switch (role.toLowerCase()) {
    case "owner":
      return t("owner");
    case "admin":
      return t("admin");
    case "maintainer":
      return t("maintainer");
    case "editor":
      return t("editor");
    case "viewer":
      return t("viewer");
    case "guest":
      return t("guest");
    default:
      return role;
  }
}

export default function OrganizationWorkspacePage() {
  const params = useParams<{ slug: string }>();
  const locale = useLocale();
  const t = useTranslations("studio.organization");
  const roleT = useTranslations("studio.roles");

  const [organization, setOrganization] = useState<OrganizationItem | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const organizationResponse = await fetchApi<OrganizationItem[]>("/organizations");

        if (cancelled) {
          return;
        }

        const currentOrganization =
          organizationResponse.data.find((item) => item.slug === params.slug) ?? null;

        if (!currentOrganization) {
          setOrganization(null);
          setProjects([]);
          setLoadState("forbidden");
          return;
        }

        const projectResponse = await fetchApi<ProjectItem[]>(
          `/projects?organizationId=${currentOrganization.id}`,
        );

        if (cancelled) {
          return;
        }

        setOrganization(currentOrganization);
        setProjects(projectResponse.data);
        setLoadState("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setOrganization(null);
        setProjects([]);
        setLoadState("error");
      }
    }

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  const statCards = useMemo(() => {
    if (!organization) {
      return [];
    }

    return [
      {
        label: t("stats.repositories"),
        value: String(organization.repositoryCount),
      },
      {
        label: t("stats.projects"),
        value: String(projects.length),
      },
      {
        label: t("stats.role"),
        value: getRoleLabel(organization.role, roleT),
      },
      {
        label: t("stats.updated"),
        value: formatDateTime(organization.updatedAt, locale),
      },
    ];
  }, [locale, organization, projects.length, roleT, t]);

  return (
    <main className="min-h-screen px-4 pb-14 pt-6 md:px-8 lg:px-10">
      <section className="relative z-10 mx-auto flex max-w-[1260px] flex-col gap-6">
        <header className="glass-panel-strong overflow-hidden rounded-[36px] px-6 py-6 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <a
                href="/studio"
                className="inline-flex rounded-full border border-[var(--line-soft)] bg-white/6 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]"
              >
                {t("back")}
              </a>

              <div className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {t("eyebrow")}
              </div>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.08em] text-[var(--text-strong)] md:text-6xl">
                {organization?.name ?? params.slug}
              </h1>

              <p className="mt-5 max-w-[52ch] text-sm leading-8 text-[var(--text-secondary)] md:text-base">
                {organization?.description || t("subtitle")}
              </p>
            </div>

            {organization ? (
              <a
                href={`/studio/projects/new?organizationId=${organization.id}`}
                className="rounded-full px-5 py-3 text-sm font-bold"
                style={{
                  background: "var(--button-primary-bg)",
                  color: "var(--button-primary-text)",
                  boxShadow: "var(--shadow-medium)",
                }}
              >
                {t("createProject")}
              </a>
            ) : null}
          </div>
        </header>

        {loadState === "loading" ? (
          <section className="glass-panel rounded-[32px] p-6 text-sm text-[var(--text-secondary)]">
            {t("loading")}
          </section>
        ) : null}

        {loadState === "error" ? (
          <section className="glass-panel rounded-[32px] p-6">
            <div className="text-lg font-semibold text-[var(--text-strong)]">
              {t("accessDeniedTitle")}
            </div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              {t("accessDeniedDescription")}
            </div>
          </section>
        ) : null}

        {loadState === "forbidden" ? (
          <section className="glass-panel rounded-[32px] p-6">
            <div className="text-lg font-semibold text-[var(--text-strong)]">
              {t("accessDeniedTitle")}
            </div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              {t("accessDeniedDescription")}
            </div>
          </section>
        ) : null}

        {loadState === "ready" && organization ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((item) => (
                <article key={item.label} className="glass-panel rounded-[28px] p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {item.label}
                  </div>
                  <div className="mt-3 text-2xl font-bold tracking-[-0.05em] text-[var(--text-strong)] md:text-3xl">
                    {item.value}
                  </div>
                </article>
              ))}
            </section>

            <section className="glass-panel rounded-[32px] p-6 md:p-7">
              <div className="max-w-3xl">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t("projectsTag")}
                </div>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text-strong)]">
                  {t("projectsTitle")}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {t("projectsDescription")}
                </p>
              </div>

              <div className="mt-6">
                {projects.length === 0 ? (
                  <div className="rounded-[26px] border border-[var(--line-soft)] bg-white/6 px-5 py-5 text-sm text-[var(--text-secondary)]">
                    {t("emptyProjects")}
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {projects.map((project) => (
                      <article
                        key={project.id}
                        className="rounded-[28px] border border-[var(--line-soft)] bg-white/6 p-6 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-[var(--line-soft)] px-3 py-1 text-xs font-semibold text-[var(--badge-core-text)]">
                            {project.type}
                          </span>
                          <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            {project.slug}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-strong)]">
                          {project.name}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                          {project.description || t("projectDescriptionFallback")}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-sm text-[var(--text-secondary)]">
                            {t("stats.updated")} · {formatDateTime(project.updatedAt, locale)}
                          </div>

                          <a
                            href={`/studio/projects/${project.slug}`}
                            className="rounded-full px-4 py-2 text-sm font-semibold"
                            style={{
                              background: "var(--button-primary-bg)",
                              color: "var(--button-primary-text)",
                            }}
                          >
                            {t("openProject")}
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}