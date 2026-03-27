import { LocalizationEditor } from "@/src/components/localization/localization-editor";
import { safeFetchApi } from "@/src/lib/api";

interface LocalizationsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface LocalizationItem {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  summary: string | null;
  updatedAt: string;
  content?: {
    entries?: Array<{
      key: string;
      zh: string;
      en: string;
    }>;
  };
}

const fallbackLocalizations: LocalizationItem[] = [];

export default async function LocalizationsPage({
  params,
}: LocalizationsPageProps) {
  const { slug } = await params;

  const localizations = await safeFetchApi<LocalizationItem[]>(
    `/hoi4-projects/${slug}/localizations`,
    fallbackLocalizations,
  );

  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/55">
                Localization Workspace
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                {slug} / 本地化编辑器
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200/78 md:text-base">
                查看并维护当前项目下的本地化资源。没有资源时，这里将显示空白编辑状态。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`/studio/projects/${slug}`}
                className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/82 transition hover:bg-white/12"
              >
                返回项目
              </a>
            </div>
          </div>
        </header>

        <LocalizationEditor projectSlug={slug} resources={localizations} />
      </section>
    </main>
  );
}