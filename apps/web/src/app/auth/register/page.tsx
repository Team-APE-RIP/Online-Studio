import { AuthForm } from "@/src/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">
            Auth / Register
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            注册账号
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/78 md:text-base">
            创建你的 Team-APE-RIP Online Studio 账号，用于后续加入组织、管理项目、
            编辑 HOI4 Focus Tree 与 Localization 资源。
          </p>
        </header>

        <AuthForm mode="register" />
      </section>
    </main>
  );
}