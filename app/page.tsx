"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { Button, Select } from "antd";
import { useRouter } from "next/navigation";
import { LandingMockChat } from "@/components/landing/LandingMockChat";
export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations("landing");
  const appT = useTranslations();
  const [plan2Months, setPlan2Months] = useState<number>(6);
  const [plan3Months, setPlan3Months] = useState<number>(12);
  const [plan4Months, setPlan4Months] = useState<number>(12);

  // Pricing: discount factor by billing duration (used for "current price per month").
  // Default values keep matching the screenshot: base=6 months, advanced=12 months, enterprise=12 months.
  const monthDiscountFactor: Record<number, number> = { 1: 1, 3: 0.95, 6: 0.9, 12: 0.8 };
  const roundToNearest = (value: number, step: number) =>
    Math.round(value / step) * step;
  const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

  const billingMonthOptions = [
    { value: 1, label: t("pricing.month1") },
    { value: 3, label: t("pricing.month3") },
    { value: 6, label: t("pricing.month6") },
    { value: 12, label: t("pricing.month12") },
  ];

  const baseOriginal = 624_000;
  const advancedOriginal = 1_249_000;
  const enterpriseOriginal = 2_499_000;

  const baseCurrent = roundToNearest(
    baseOriginal * monthDiscountFactor[plan2Months],
    1_000
  );
  const advancedCurrent = roundToNearest(
    advancedOriginal * monthDiscountFactor[plan3Months],
    1_000
  );
  const enterpriseCurrent = roundToNearest(
    enterpriseOriginal * monthDiscountFactor[plan4Months],
    1_000
  );

  const scrollToSection = (id: "home" | "features" | "pricing" | "jobs") => {
    const href = `#${id}`;
    const el = document.getElementById(id);
    if (!el) return;

    // Prevent the browser from doing a hard jump for hash navigation.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    window.history.pushState(null, "", href);
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const CheckBullet = ({
    text,
    tone,
  }: {
    text: string;
    tone: "light" | "dark";
  }) => {
    const liColor =
      tone === "dark" ? "var(--pricing-bullet-invert-text)" : "var(--pricing-bullet-text)";
    const circleBg =
      tone === "dark"
        ? "var(--pricing-bullet-invert-circle-bg)"
        : "var(--pricing-bullet-circle-bg)";
    const circleFg =
      tone === "dark"
        ? "var(--pricing-bullet-invert-circle-fg)"
        : "var(--pricing-bullet-circle-fg)";

    return (
      <li className="flex gap-2 text-sm leading-relaxed" style={{ color: liColor }}>
        <span
          className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: circleBg, color: circleFg }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 3.5L5.5 8.5L2.5 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>{text}</span>
      </li>
    );
  };

  type PricingCardItem = {
    key: "basic" | "advanced" | "enterprise";
    name: string;
    original: number;
    current: number;
    months: number;
    onMonthsChange: (value: number) => void;
    cardClassName: string;
    showGlow: boolean;
    features: string[];
    conditionalFeature?: {
      text: string;
      visible: boolean;
    };
  };

  const pricingCards: PricingCardItem[] = [
    {
      key: "basic",
      name: t("pricing.basic.name"),
      original: baseOriginal,
      current: baseCurrent,
      months: plan2Months,
      onMonthsChange: setPlan2Months,
      cardClassName: "pricing-card-base",
      showGlow: true,
      features: [
        t("pricing.basic.bul1"),
        t("pricing.basic.bul2"),
        t("pricing.basic.bul3"),
        t("pricing.basic.bul4"),
        t("pricing.basic.bul5"),
        t("pricing.basic.bul6"),
        t("pricing.basic.bul7"),
        t("pricing.basic.bul8"),
        t("pricing.basic.bul9"),
      ],
    },
    {
      key: "advanced",
      name: t("pricing.advanced.name"),
      original: advancedOriginal,
      current: advancedCurrent,
      months: plan3Months,
      onMonthsChange: setPlan3Months,
      cardClassName: "pricing-card-silver",
      showGlow: false,
      features: [
        t("pricing.advanced.bul1"),
        t("pricing.advanced.bul2"),
        t("pricing.advanced.bul3"),
        t("pricing.advanced.bul4"),
        t("pricing.advanced.bul5"),
        t("pricing.advanced.bul6"),
        t("pricing.advanced.bul7"),
        t("pricing.advanced.bul8"),
        t("pricing.advanced.bul9"),
      ],
    },
    {
      key: "enterprise",
      name: t("pricing.enterprise.name"),
      original: enterpriseOriginal,
      current: enterpriseCurrent,
      months: plan4Months,
      onMonthsChange: setPlan4Months,
      cardClassName: "pricing-card-gold",
      showGlow: true,
      features: [
        t("pricing.enterprise.bul1"),
        t("pricing.enterprise.bul2"),
        t("pricing.enterprise.bul3"),
        t("pricing.enterprise.bul4"),
        t("pricing.enterprise.bul5"),
        t("pricing.enterprise.bul6"),
        t("pricing.enterprise.bul7"),
        t("pricing.enterprise.bul8"),
        t("pricing.enterprise.bul9"),
      ],
      conditionalFeature: {
        text: t("pricing.enterprise.bul10"),
        visible: plan4Months >= 3,
      },
    },
  ];

  const PricingCard = ({ card }: { card: PricingCardItem }) => (
    <div
      className={`rounded-3xl border p-7 relative overflow-hidden flex flex-col ${card.cardClassName}`}
    >
      {card.showGlow && (
        <div
          className={`absolute -top-3 -right-3 w-24 h-24 rounded-full blur-sm pricing-card-glow ${card.key === "enterprise" ? "inset-x-0 -top-6 h-14 w-auto rounded-none blur-[20px]" : ""
            }`}
        />
      )}

      <div className="relative">
        <h3 className="text-lg font-extrabold">{card.name}</h3>

        <div className="mt-2">
          <div
            className="text-xs font-bold line-through"
            style={{ color: "var(--pricing-price-muted-fg)" }}
          >
            {formatVnd(card.original)}
          </div>
          <div className="mt-2 flex items-end gap-2">
            <div
              className="text-4xl font-extrabold"
              style={{ color: "var(--pricing-price-fg)" }}
            >
              {formatVnd(card.current)}
            </div>
            <div
              className="text-sm font-bold mb-1"
              style={{ color: "var(--pricing-price-muted-fg)" }}
            >
              {t("pricing.perMonthLabel")}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 relative">
        <Select<number>
          value={card.months}
          onChange={card.onMonthsChange}
          aria-label={t("pricing.monthSelectAriaLabel")}
          className="w-full pricing-select pricing-select-antd !mb-5"
          style={{ width: "100%" }}
          size="large"
          showSearch={false}
          popupMatchSelectWidth={false}
          suffixIcon={null}
          options={billingMonthOptions}
        />
        <span className="pointer-events-none absolute right-4 inset-y-0 flex items-center pricing-select-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 6.5L8 10L11.5 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {card.features.map((feature) => (
          <CheckBullet key={feature} tone="dark" text={feature} />
        ))}
        {card.conditionalFeature?.visible && (
          <CheckBullet tone="dark" text={card.conditionalFeature.text} />
        )}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="!text-primary uppercase text-lg font-bold tracking-wider"
          >
            {appT("app_title")}
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="primary"
                variant="solid"
                size="large"
                onClick={() => router.push("/sign-in")}
              >
                {t("auth.signIn")}
              </Button>
              {/* <Button
                type="default"
                variant="outlined"
                size="large"
                onClick={() => router.push("/sign-up")}
              >
                {t("auth.signUp")}
              </Button> */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section
          id="home"
          className="scroll-mt-16 relative overflow-hidden py-16"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                  {t("hero.title")}
                </h1>
                <p className="text-foreground/80 text-base md:text-lg">
                  {t("hero.subtitle")}
                </p>
                {/* <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="primary"
                    variant="solid"
                    size="large"
                    onClick={() => scrollToSection("features")}
                  >
                    {t("hero.primaryCta")}
                  </Button>
                  <Button
                    type="default"
                    variant="outlined"
                    size="large"
                    onClick={() => scrollToSection("features")}
                  >
                    {t("hero.secondaryCta")}
                  </Button>
                </div> */}
              </div>

              <LandingMockChat />
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-16 py-16"
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mt-10 grid gap-6 md:grid-cols-3 lg:grid-cols-3">
              {pricingCards.map((card) => (
                <PricingCard key={card.key} card={card} />
              ))}
            </div>

          </div>
        </section>

        <footer className="py-10 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-foreground/70 text-sm">
              © {new Date().getFullYear()} {appT("app_title")}.{" "}
              <span className="hidden sm:inline">
                {t("footer.allRightsReserved")}
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}