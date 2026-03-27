export default function NewOrganizationPage() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">
            Create Organization
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            新建组织
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/78 md:text-base">
            创建一个新的 Organization，作为 Team、Project 与 HOI4 资源的顶层工作空间。
          </p>
        </header>

        <form
          action={`${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}/organizations`}
          method="post"
          className="glass-panel rounded-[30px] p-6 md:p-8"
        >
          <div className="grid gap-6">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">组织名称</span>
              <input
                name="name"
                required
                placeholder="例如：Team APE:RIP"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">Slug</span>
              <input
                name="slug"
                required
                placeholder="例如：team-ape-rip"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-white">描述</span>
              <textarea
                name="description"
                rows={5}
                placeholder="输入组织说明、定位、协作范围等"
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-300/30"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
            >
              创建组织
            </button>
            <a
              href="/studio"
              className="rounded-full border border-white/10 bg-white/8 px-6 py-3 text-sm text-white/82 transition hover:bg-white/12"
            >
              返回工作台
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-7 text-amber-100/85">
            当前为 MVP 录入版本。下一步将继续补上提交成功后的跳转、错误提示与 Project / Resource 创建页。
          </div>
        </form>
      </section>
    </main>
  );
}