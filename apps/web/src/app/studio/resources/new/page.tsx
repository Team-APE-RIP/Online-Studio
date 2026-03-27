import { ResourceType } from "@team-ape-rip/shared";

const resourceTypes = [
  { value: ResourceType.HOI4_FOCUS_TREE, label: "HOI4 Focus Tree" },
  { value: ResourceType.HOI4_LOCALIZATION, label: "HOI4 Localization" },
  { value: ResourceType.MARKDOWN, label: "Markdown" },
  { value: ResourceType.DOC, label: "Doc" },
  { value: ResourceType.DIAGRAM, label: "Diagram" },
  { value: ResourceType.HOI4_EVENT, label: "HOI4 Event" },
  { value: ResourceType.HOI4_DECISION, label: "HOI4 Decision" },
];

export default function NewResourcePage() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">
            Create Resource
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            新建资源
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/78 md:text-base">
            创建项目下的资源项，用于登记 Focus Tree、本地化、文档、图表与 HOI4 结构化对象。
          </p>
        </header>

        <form
          action={`${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}/resources`}
          method="post"
          className="glass-panel rounded-[30px] p-6 md:p-8"
        >
          <div className="grid gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">所属组织 ID</span>
              <input
                name="organizationId"
                required
                placeholder="请输入组织 ID"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">所属项目 ID</span>
              <input
                name="projectId"
                required
                placeholder="请输入项目 ID"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">资源标题</span>
              <input
                name="title"
                required
                placeholder="例如：Industrial Revival Tree"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Slug</span>
              <input
                name="slug"
                required
                placeholder="例如：industrial-revival-tree"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">资源类型</span>
              <select
                name="type"
                defaultValue={ResourceType.HOI4_FOCUS_TREE}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
              >
                {resourceTypes.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                    className="bg-slate-900 text-white"
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">摘要</span>
              <textarea
                name="summary"
                rows={5}
                placeholder="输入资源说明、用途、阶段状态等"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
            >
              创建资源
            </button>
            <a
              href="/studio"
              className="rounded-full border border-white/10 bg-white/8 px-6 py-3 text-sm text-white/82 transition hover:bg-white/12"
            >
              返回工作台
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm leading-7 text-emerald-100/85">
            当前为最小可用录入页。完成后即可为项目创建 Focus Tree、本地化与文档等资源记录。
          </div>
        </form>
      </section>
    </main>
  );
}