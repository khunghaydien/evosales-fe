"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ConversationSide = "left" | "right";
type ConversationMessage = {
  side: ConversationSide;
  text: string;
  imageUrl?: string;
};

export function LandingMockChat() {
  const t = useTranslations("landing");

  const mockYouLabel = t("mock.you");
  const mockSalesLabel = t("mock.partnerTag");
  const bubble18ImageUrl =
    "https://tomato-geographical-tick-314.mypinata.cloud/ipfs/bafybeiaujuk3fb3u254kqe4hofcoz6po4mhvhapvtwdqqdp4wzgw4aj75q";

  const mockConversation: ConversationMessage[] = useMemo(
    () => [
      { side: "left", text: t("mock.bubble1You") },
      { side: "right", text: t("mock.bubble1Rep") },
      { side: "left", text: t("mock.bubble2You") },
      { side: "right", text: t("mock.bubble2Rep") },
      { side: "left", text: t("mock.bubble3You") },
      { side: "right", text: t("mock.bubble3Rep") },
      { side: "left", text: t("mock.bubble4You") },
      { side: "right", text: t("mock.bubble4Rep") },
      { side: "left", text: t("mock.bubble5You") },
      { side: "right", text: t("mock.bubble5Rep") },
      { side: "left", text: t("mock.bubble6You") },
      { side: "right", text: t("mock.bubble6Rep") },
      { side: "left", text: t("mock.bubble7You") },
      { side: "right", text: t("mock.bubble7Rep") },
      { side: "left", text: t("mock.bubble8You") },
      { side: "right", text: t("mock.bubble8Rep") },
      { side: "left", text: t("mock.bubble9You") },
      { side: "right", text: t("mock.bubble9Rep") },
      { side: "left", text: t("mock.bubble10You") },
      { side: "right", text: t("mock.bubble10Rep") },
      { side: "left", text: t("mock.bubble11You") },
      { side: "right", text: t("mock.bubble11Rep") },
      { side: "left", text: t("mock.bubble12You") },
      { side: "right", text: t("mock.bubble12Rep") },
      { side: "left", text: t("mock.bubble13You") },
      { side: "right", text: t("mock.bubble13Rep") },
      { side: "left", text: t("mock.bubble14You") },
      { side: "right", text: t("mock.bubble14Rep") },
      { side: "left", text: t("mock.bubble15You") },
      { side: "right", text: t("mock.bubble15Rep") },
      { side: "left", text: t("mock.bubble16You") },
      { side: "right", text: t("mock.bubble16Rep") },
      { side: "left", text: t("mock.bubble17You") },
      { side: "right", text: t("mock.bubble17Rep") },
      { side: "left", text: t("mock.bubble18You") },
      { side: "right", text: t("mock.bubble18Rep"), imageUrl: bubble18ImageUrl },
      { side: "left", text: t("mock.bubble19You") },
      { side: "right", text: t("mock.bubble19Rep") },
      { side: "left", text: t("mock.bubble20You") },
      { side: "right", text: t("mock.bubble20Rep") },
    ],
    [bubble18ImageUrl, t]
  );

  const mockConversationKey = useMemo(
    () => mockConversation.map((m) => m.text).join("|"),
    [mockConversation]
  );

  const [mockMessageCount, setMockMessageCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const mockChatScrollRef = useRef<HTMLDivElement | null>(null);
  const mockChatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-append messages: 1-2s per message, then clear and restart.
  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const step = (idx: number) => {
      if (cancelled) return;

      if (idx >= mockConversation.length) {
        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setMockMessageCount(0);
          step(0);
        }, 900);
        return;
      }

      const delay = 1000 + Math.floor(Math.random() * 1000); // 1-2s
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setMockMessageCount(idx + 1);
        step(idx + 1);
      }, delay);
    };

    // Reset + start after first paint (avoid setState synchronously in effect).
    const startTimeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setMockMessageCount(0);
      step(0);
    }, 0);

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      window.clearTimeout(startTimeoutId);
    };
  }, [mockConversationKey, mockConversation.length]);

  // Detect whether user is currently near the bottom.
  useEffect(() => {
    const scrollEl = mockChatScrollRef.current;
    if (!scrollEl) return;

    const onScroll = () => {
      const remaining =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      setIsNearBottom(remaining < 24);
    };

    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  // Keep scrolling inside the chat container when user is near bottom.
  useEffect(() => {
    const scrollEl = mockChatScrollRef.current;
    const bottomEl = mockChatBottomRef.current;
    if (!scrollEl || !bottomEl) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (!isNearBottom) return;

    const raf = window.requestAnimationFrame(() => {
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(raf);
  }, [mockMessageCount, isNearBottom]);

  return (
    <div className="rounded-3xl border border-border bg-background/60 p-6 md:p-8 shadow-xl shadow-primary/10 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/60" />
          <div className="w-3 h-3 rounded-full bg-foreground/20" />
          <div className="w-3 h-3 rounded-full bg-foreground/20" />
        </div>
        <span className="text-xs uppercase font-bold text-foreground/60">
          {mockSalesLabel}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div
          className="h-[61vh] overflow-hidden pr-2"
          ref={mockChatScrollRef}
        >
          <div className="flex flex-col gap-3 pb-2">
            {mockConversation.slice(0, mockMessageCount).map((m, idx) => (
              <div
                key={`${idx}-${m.side}`}
                className={`rounded-2xl border border-border bg-background p-4 max-w-[90%] ${m.side === "left" ? "self-start" : "self-end"
                  }`}
              >
                <div
                  className={`flex items-center justify-between ${m.side === "left" ? "justify-start" : "justify-end"
                    }`}
                >
                  {m.side === "left" ? (
                    <span className="text-sm font-bold">{mockYouLabel}</span>
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {mockSalesLabel}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-foreground/80">{m.text}</p>
                {m.imageUrl ? (
                  <div className="mt-3">
                    <Image
                      src={m.imageUrl}
                      alt="Mock product image"
                      width={360}
                      height={360}
                      unoptimized
                      className="h-auto max-h-[260px] w-full rounded-xl border border-border object-cover"
                    />
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={mockChatBottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

