import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";

const dotGridStyle = {
  backgroundImage:
    "radial-gradient(circle, rgb(239 235 229 / 0.54) 1px, transparent 1px), linear-gradient(90deg, rgb(255 250 243 / 0.04) 1px, transparent 1px), linear-gradient(rgb(255 250 243 / 0.04) 1px, transparent 1px)",
  backgroundSize: "34px 34px, 136px 136px, 136px 136px",
} satisfies CSSProperties;

const landingMetalStyle = {
  background:
    "radial-gradient(circle at 16% 14%, rgb(255 250 243 / 0.2), transparent 24rem), radial-gradient(circle at 82% 24%, rgb(207 194 174 / 0.14), transparent 28rem), repeating-linear-gradient(104deg, rgb(255 250 243 / 0.05) 0, rgb(255 250 243 / 0.05) 1px, transparent 1px, transparent 11px), linear-gradient(135deg, #12100d 0%, #2a2520 44%, #171410 100%)",
} satisfies CSSProperties;

export function LandingPage() {
  return (
    <main className="min-h-[100dvh] overflow-hidden text-[#fffaf3]" style={landingMetalStyle}>
      <header className="grid min-h-20 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-[#efe7dc]/28 bg-[#151310]/42 px-5 py-4 backdrop-blur-xl sm:px-9 lg:px-14">
        <Link
          className="group flex min-w-0 items-center gap-3 justify-self-start text-[#fffaf3]"
          to="/"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] border border-[#fffaf3]/24 bg-[#fffaf3]/10 shadow-[inset_0_1px_0_rgb(255_250_243_/_0.18)] transition-colors group-hover:bg-[#fffaf3]/16">
            <Sparkles className="size-4 text-[#efe2d0]" strokeWidth={2.4} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold uppercase tracking-[0.14em]">
              Test API
            </span>
            <span className="mt-0.5 hidden text-xs font-medium text-[#bfb2a4] sm:block">
              AI model gateway
            </span>
          </span>
        </Link>
        <a
          className="justify-self-center text-sm font-semibold text-[#d7cec3] underline-offset-4 transition-colors hover:text-[#fffaf3] hover:underline sm:text-base"
          href="#pricing"
        >
          Pricing
        </a>
        <Link
          className="justify-self-end whitespace-nowrap rounded-full border border-[#fffaf3]/22 bg-[#fffaf3]/8 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-[#fffaf3] transition-all hover:bg-[#fffaf3]/14 active:translate-y-px sm:px-5"
          to="/login"
        >
          Login
        </Link>
      </header>

      <section
        className="relative mx-auto min-h-[calc(100dvh-5rem)] max-w-[calc(100vw-1.5rem)] border-x border-b border-[#efe7dc]/34 shadow-[0_40px_120px_rgb(0_0_0_/_0.18)] sm:max-w-[calc(100vw-4.5rem)]"
        id="pricing"
        style={dotGridStyle}
      >
        <div className="pointer-events-none absolute inset-5 rounded-[24px] border border-[#efe7dc]/28 shadow-[inset_0_1px_0_rgb(255_250_243_/_0.18)] sm:inset-8" />
        <div className="pointer-events-none absolute inset-x-5 top-5 border-t border-[#fffaf3]/42 sm:inset-x-8 sm:top-8" />
        <div className="pointer-events-none absolute inset-x-5 bottom-5 border-b border-[#fffaf3]/42 sm:inset-x-8 sm:bottom-8" />

        <div className="relative z-10 flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center px-6 py-24 text-center sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <p className="mx-auto mb-7 w-fit border border-[#efe7dc]/24 bg-[#fffaf3]/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d7cec3]">
              Commercial API workspace
            </p>
            <h1 className="text-6xl font-semibold leading-[0.92] tracking-[-0.035em] text-[#fffaf3] text-balance sm:text-7xl lg:text-8xl">
              AI Models
            </h1>
            <p className="mx-auto mt-8 max-w-[58rem] text-lg font-medium leading-8 text-[#d7cec3] text-pretty sm:text-2xl sm:leading-9 lg:text-[28px] lg:leading-10">
              Access a vast selection of models via a standard, unified API protocol.
              <br className="hidden md:block" />
              Power AI applications, manage digital assets, and connect production traffic.
            </p>

            <div className="mt-14 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-5">
              <Link
                className="group inline-flex min-h-14 items-center justify-center gap-4 rounded-[18px] bg-[#fffaf3] px-6 text-base font-bold !text-[#181512] shadow-[0_18px_46px_rgb(0_0_0_/_0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#efe2d0] hover:!text-[#181512] active:translate-y-px sm:min-w-56 sm:px-7 sm:text-lg"
                to="/overview"
              >
                <span>Go to dashboard</span>
                <ArrowRight
                  className="size-5 text-[#181512] transition-transform group-hover:translate-x-1"
                  strokeWidth={2.5}
                />
              </Link>

              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-[18px] border border-[#fffaf3]/38 bg-[#fffaf3]/8 px-6 text-base font-bold text-[#fffaf3] shadow-[inset_0_1px_0_rgb(255_250_243_/_0.16)] transition-all hover:-translate-y-0.5 hover:bg-[#fffaf3]/14 active:translate-y-px sm:min-w-44 sm:px-7"
                to="/login"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
