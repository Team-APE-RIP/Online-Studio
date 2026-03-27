import { safeFetchApi } from "@/src/lib/api";

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Hoi4ProjectDetail {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  focusTrees: Array<{
    id: string;
    title: string;
    slug: string;
    updatedAt: string;
  }>;
  localizations: Array<{
    id: string;
    title: string;
    slug: string;
    updatedAt: string;
  }>;
  resourceCount: number;
  updatedAt: string;
}

const emptyProjectDetail: Hoi4ProjectDetail = {
  id: "",
  organizationId: "",
  name: "未找到项目",
  slug: "",
  description: "当前项目不存在，或你暂时无权访问该项目。",
  focusTrees: [],
  localizations: [],
  resourceCount: 0,
  updatedAt: new Date().toISOString(),
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;

  const project = await safeFetchApi<Hoi4ProjectDetail>(
    `/hoi4-projects/${slug}`,
    {
      ...emptyProjectDetail,
      slug,
      name: slug,
    },
  );

  const quickStats = [
    {
      label: "Resources",
      value: String(project.resourceCount),
      hint: "当前项目下的全部资源",
    },
    {
      label: "Focus Trees",
      value: String(project.focusTrees.length),
      hint: "当前项目中的国策树资源",
    },
    {
      label: "Localization",
      value: String(project.localizations.length),
      hint: "当前项目中的本地化资源",
    },
    {
      label: "Updated",
      value: new Date(project.updatedAt).toLocaleDateString("zh-CN"),
      hint: "最近一次资源更新时间",
    },
  ];

  const latestResources = [
    ...project.focusTrees.map((resource) => ({
      title: resource.title,
      type: "hoi4_focus_tree",
      updatedAt: resource.updatedAt,
      href: "focus-trees",
    })),
    ...project.localizations.map((resource) => ({
      title: resource.title,
      type: "hoi4_localization",
      updatedAt: resource.updatedAt,
      href: "localizations",
    })),
  ].slice(0, 6);

  const moduleCards = [
    {
      title: "Focus Tree Studio",
      description: "进入国策树编辑区，查看与维护项目下的国策树资源。",
      href: "focus-trees",
      accent: "border-sky-300/20 bg-sky-300/10 text-sky-200",
    },
    {
      title: "Localization Workspace",
      description: "进入本地化编辑区，查看与维护项目下的本地化资源。",
      href: "localizations",
      accent: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    },
  ];

  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/55">
                Project Overview
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                {project.name}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200/78 md:text-base">
                {project.description || "暂无项目描述。"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/studio"
                className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 transition hover:bg-white/12"
              >
                返回工作台
              </a>
              <a
                href="/studio/resources/new"
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
              >
                新建资源
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-4">
          {quickStats.map((item) => (
            <article
              key={item.label}
              className="glass-panel rounded-[26px] p-5"
            >
              <div className="text-xs uppercase tracking-[0.22em] text-slate-300/66">
                {item.label}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {item.value}
              </div>
              <div className="mt-3 text-sm leading-6 text-slate-200/72">
                {item.hint}
              </div>
            </article>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <section className="glass-panel rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">
              Modules
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              核心模块
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {moduleCards.map((module) => (
                <a
                  key={module.title}
                  href={`/studio/projects/${project.slug}/${module.href}`}
                  className="rounded-[26px] border border-white/10 bg-white/6 p-5 transition hover:-translate-y-1 hover:bg-white/10"
                >
                  <div
                    className={`inline-flex rounded-full border px-3 py-1 text-xs ${module.accent}`}
                  >
                    Module
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-200/78">
                    {module.description}
                  </p>
                  <div className="mt-5 text-sm text-sky-200">进入模块 →</div>
                </a>
              ))}
            </div>
          </section>

          <aside className="glass-panel rounded-[30px] p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-white/55">
              Activity
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              最近资源活动
            </h2>

            <div className="mt-6 space-y-4">
              {latestResources.length > 0 ? (
                latestResources.map((resource) => (
                  <a
                    key={`${resource.type}-${resource.title}`}
                    href={`/studio/projects/${project.slug}/${resource.href}`}
                    className="block rounded-[24px] border border-white/10 bg-white/6 p-4 transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-base font-semibold text-white">
                        {resource.title}
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/76">
                        {resource.type}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-slate-200/72">
                      最近更新：
                      {new Date(resource.updatedAt).toLocaleString("zh-CN")}
                    </div>
                  </a>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm leading-7 text-slate-200/72">
                  当前项目下还没有资源活动记录。
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}