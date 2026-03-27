import { AuthForm } from "@/src/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-6 py-6 md:px-10 lg:px-16">
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-6 py-6 md:px-8">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">
            Auth / Login
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
            登录账号
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/78 md:text-base">
            使用邮箱或用户名登录 Team-APE-RIP Online Studio，进入组织、项目与 HOI4 工作台。
          </p>
        </header>

        <AuthForm mode="login" />
      </section>
    </main>
  );
}