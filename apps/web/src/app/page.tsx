import Image from "next/image";
import { getTranslations } from "next-intl/server";

const capabilityKeys = [
  "focusTree",
  "localization",
  "docs",
] as const;

const architectureKeys = [
  "stack",
  "tenant",
  "runtime",
  "realtime",
] as const;

const productHighlights = [
  "plugin",
  "localization",
  "collaboration",
] as const;

export default async function HomePage() {
  const t = await getTranslations("home");
  const c = await getTranslations("common");

  return (
    <main className="min-h-screen overflow-hidden px-4 pb-14 pt-6 md:px-8 lg:px-10">
      <div className="hero-grid absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1260px] flex-col gap-6">
        <header className="glass-panel rounded-[30px] px-5 py-4 md:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/8">
                <Image
                  src="/branding/apeos-logo-large.webp"
                  alt="APEOS"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-cover"
                  priority
                />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Team APE:RIP
                </div>
                <div className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
                  {c("appName")}
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <a
                href="#capabilities"
                className="rounded-full border border-[var(--line-soft)] bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-strong)]"
              >
                {t("nav.capabilities")}
              </a>
              <a
                href="#architecture"
                className="rounded-full border border-[var(--line-soft)] bg-white/5 px-4 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-strong)]"
              >
                {t("nav.architecture")}
              </a>
              <a
                href="/studio"
                className="rounded-full px-5 py-2 text-sm font-semibold"
                style={{
                  background: "var(--button-primary-bg)",
                  color: "var(--button-primary-text)",
                }}
              >
                {c("enterStudio")}
              </a>
            </nav>
          </div>
        </header>

        <section className="glass-panel-strong relative overflow-hidden rounded-[42px] px-6 py-8 md:px-10 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,117,226,0.20),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(116,127,255,0.24),transparent_26%),radial-gradient(circle_at_54%_82%,rgba(89,233,255,0.12),transparent_28%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-stretch">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <div className="inline-flex rounded-full border border-[var(--line-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {t("eyebrow")}
                </div>

                <h1 className="mt-6 max-w-[10ch] text-5xl font-black leading-[0.92] tracking-[-0.08em] text-[var(--text-strong)] md:text-7xl">
                  {t("hero.title")}
                </h1>

                <p className="mt-6 max-w-[48ch] text-base leading-8 text-[var(--text-secondary)] md:text-lg">
                  {t("hero.subtitle")}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="/studio"
                    className="rounded-full px-6 py-3 text-sm font-bold md:text-base"
                    style={{
                      background: "var(--button-primary-bg)",
                      color: "var(--button-primary-text)",
                      boxShadow: "var(--shadow-medium)",
                    }}
                  >
                    {t("hero.primaryCta")}
                  </a>
                  <a
                    href="#architecture"
                    className="rounded-full border border-[var(--line-soft)] px-6 py-3 text-sm font-semibold text-[var(--button-secondary-text)] transition hover:bg-white/10 md:text-base"
                    style={{
                      background: "var(--button-secondary-bg)",
                    }}
                  >
                    {t("hero.secondaryCta")}
                  </a>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {productHighlights.map((key) => (
                  <div
                    key={key}
                    className="rounded-[26px] border border-[var(--line-soft)] bg-white/6 p-5 shadow-[var(--shadow-soft)]"
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {t(`highlight.${key}.tag`)}
                    </div>
                    <div className="mt-3 text-xl font-semibold text-[var(--text-strong)]">
                      {t(`highlight.${key}.title`)}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                      {t(`highlight.${key}.description`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] border border-[var(--line-soft)] bg-white/6 p-6 shadow-[var(--shadow-medium)] backdrop-blur-xl">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t("hero.side.tag")}
                </div>
                <h2 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[var(--text-strong)]">
                  {t("hero.side.title")}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                  {t("hero.side.description")}
                </p>

                <div className="mt-6 space-y-3">
                  <div className="rounded-[22px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="text-sm font-semibold text-[var(--text-strong)]">
                      {t("hero.side.cardOne.title")}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {t("hero.side.cardOne.description")}
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="text-sm font-semibold text-[var(--text-strong)]">
                      {t("hero.side.cardTwo.title")}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {t("hero.side.cardTwo.description")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-[var(--line-soft)] p-6 shadow-[var(--shadow-medium)]">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t("hero.metricsTag")}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {t("metrics.deploy")}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                      Docker
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {t("metrics.theme")}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                      Dual
                    </div>
                  </div>
                  <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/6 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {t("metrics.locale")}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">
                      EN / 中文
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="glass-panel rounded-[34px] p-7">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {t("capabilities.eyebrow")}
            </div>
            <h2 className="mt-3 max-w-[12ch] text-4xl font-bold tracking-[-0.06em] text-[var(--text-strong)]">
              {t("capabilities.title")}
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-8 text-[var(--text-secondary)]">
              {t("capabilities.description")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {capabilityKeys.map((key) => (
              <article
                key={key}
                className="glass-panel rounded-[30px] p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]"
              >
                <div className="inline-flex rounded-full border border-[var(--line-soft)] px-3 py-1 text-xs font-semibold text-[var(--badge-core-text)]">
                  {t(`capabilities.items.${key}.tag`)}
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--text-strong)]">
                  {t(`capabilities.items.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                  {t(`capabilities.items.${key}.description`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="architecture"
          className="glass-panel rounded-[34px] p-7 md:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                {t("architecture.eyebrow")}
              </div>
              <h2 className="mt-3 max-w-[12ch] text-4xl font-bold tracking-[-0.06em] text-[var(--text-strong)]">
                {t("architecture.title")}
              </h2>
              <p className="mt-5 max-w-[44ch] text-sm leading-8 text-[var(--text-secondary)]">
                {t("architecture.description")}
              </p>
            </div>

            <div className="grid gap-4">
              {architectureKeys.map((key, index) => (
                <div
                  key={key}
                  className="rounded-[24px] border border-[var(--line-soft)] bg-white/6 px-5 py-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/6 text-sm font-bold text-[var(--text-strong)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-[var(--text-strong)]">
                        {t(`architecture.items.${key}.title`)}
                      </div>
                      <div className="mt-1 text-sm leading-7 text-[var(--text-secondary)]">
                        {t(`architecture.items.${key}.description`)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}