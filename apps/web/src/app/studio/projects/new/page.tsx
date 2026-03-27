import { ProjectType } from "@team-ape-rip/shared";

const projectTypes = [
  {
    value: ProjectType.HOI4,
    label: "HOI4 Project",
  },
  {
    value: ProjectType.GENERAL,
    label: "General Project",
  },
];

export default function NewProjectPage() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">
            Create Project
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            新建项目
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/78 md:text-base">
            创建一个新的项目，可作为 HOI4 国策树、本地化、文档与资源管理的基本工作单元。
          </p>
        </header>

        <form
          action={`${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}/projects`}
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
              <span className="text-sm font-medium text-white">项目名称</span>
              <input
                name="name"
                required
                placeholder="例如：APE:RIP Core Overhaul"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Slug</span>
              <input
                name="slug"
                required
                placeholder="例如：ape-rip-core-overhaul"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">项目类型</span>
              <select
                name="type"
                defaultValue={ProjectType.HOI4}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300/30"
              >
                {projectTypes.map((item) => (
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
              <span className="text-sm font-medium text-white">描述</span>
              <textarea
                name="description"
                rows={5}
                placeholder="输入项目目标、资源范围、模组方向等"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
            >
              创建项目
            </button>
            <a
              href="/studio"
              className="rounded-full border border-white/10 bg-white/8 px-6 py-3 text-sm text-white/82 transition hover:bg-white/12"
            >
              返回工作台
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm leading-7 text-sky-100/85">
            当前先使用组织 ID 作为最小可用输入方案。下一步会继续补资源创建页与提交流程优化。
          </div>
        </form>
      </section>
    </main>
  );
}