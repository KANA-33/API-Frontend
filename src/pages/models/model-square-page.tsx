import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Bot,
  Check,
  ChevronRight,
  Grid2X2,
  Layers3,
  List,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useAuthStore } from "@features/auth/store";
import * as modelsApi from "@features/models/api";
import { usePlatformStore } from "@features/platform/store";
import { cn } from "@shared/lib/cn";
import { useAsyncData } from "@shared/lib/use-async-data";
import { PlatformBrandHeader } from "@shared/ui/platform-brand";
import { ErrorBlock, LoadingBlock } from "@shared/ui/state-block";
import { UserAvatarMenu } from "@shared/ui/user-avatar-menu";

type CatalogView = "grid" | "list";
type PriceUnit = "1m" | "1k";
type BillingFilter = "all" | "standard" | "fixed" | "tiered";
type PricePlan = "standard" | "prepaid";

interface ModelSquareItem {
  billingMode: string;
  completionRatio?: number;
  context: string;
  description: string;
  endpoints: string[];
  groups: string[];
  icon?: string;
  modelName: string;
  modelPrice?: number;
  modelRatio?: number;
  provider: string;
  status: "available" | "limited";
  tags: string[];
}

interface ModelSquareData {
  dashboardModels: string[];
  pricing: modelsApi.PricingResponse | null;
  pricingError: string | null;
  userModels: string[];
}

const shellPanelClass =
  "rounded-xl border border-[#d7cec6]/86 bg-[#fffdf8]/86 text-[#181614] shadow-[0_18px_42px_rgb(74_58_42_/_0.06),inset_0_1px_0_rgb(255_255_255_/_0.72)] backdrop-blur-md";

const controlButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d7cec6] px-3 text-sm font-semibold transition-all duration-200 hover:border-[#b9aa9a] hover:bg-[#f3ede6] active:translate-y-px";
const modelPageSize = 8;
const filterOptionLimit = 6;

function getProviderFromName(modelName: string) {
  const lower = modelName.toLowerCase();

  if (lower.includes("deepseek")) {
    return "DeepSeek";
  }
  if (lower.includes("claude")) {
    return "Anthropic";
  }
  if (lower.includes("gemini")) {
    return "Google";
  }
  if (lower.includes("grok")) {
    return "xAI";
  }
  if (lower.includes("qwen")) {
    return "Alibaba";
  }
  if (lower.includes("llama")) {
    return "Meta";
  }
  if (lower.includes("gpt") || lower.includes("o1") || lower.includes("o3") || lower.includes("o4")) {
    return "OpenAI";
  }

  return "Custom";
}

function getModelDescription(item: Partial<ModelSquareItem> & { modelName: string }) {
  if (item.description?.trim()) {
    return item.description.trim();
  }

  const name = item.modelName.toLowerCase();
  if (name.includes("flash") || name.includes("mini") || name.includes("haiku")) {
    return "Fast, cost-conscious model for everyday production traffic and quick response paths.";
  }
  if (name.includes("reason") || name.includes("r1") || name.includes("o1") || name.includes("o3")) {
    return "Reasoning-oriented model for complex analysis, planning, and multi-step tasks.";
  }
  if (name.includes("image") || name.includes("vision")) {
    return "Multimodal model suitable for visual understanding and mixed media workflows.";
  }

  return "General purpose model available through the unified API gateway.";
}

function getContextLabel(modelName: string) {
  const lower = modelName.toLowerCase();

  if (lower.includes("claude") || lower.includes("128k")) {
    return lower.includes("haiku") ? "200K" : "128K";
  }
  if (lower.includes("gemini")) {
    return "1M";
  }
  if (lower.includes("32k")) {
    return "32K";
  }

  return "128K";
}

function getBillingFilter(item: ModelSquareItem): BillingFilter {
  if (item.billingMode === "tiered_expr" || item.billingMode.includes("tier")) {
    return "tiered";
  }
  if ((item.modelPrice ?? 0) > 0) {
    return "fixed";
  }
  return "standard";
}

function makeModelKey(name: string) {
  return name.trim().toLowerCase();
}

function formatRatio(value?: number, unit: PriceUnit = "1m") {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "Pending";
  }

  const scaled = unit === "1k" ? value / 1000 : value;
  return `x${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: unit === "1k" ? 5 : 4,
    minimumFractionDigits: 0,
  }).format(scaled)}`;
}

function formatFixedPrice(value?: number, unit: PriceUnit = "1m") {
  if (!value || value <= 0) {
    return "";
  }

  const scaled = unit === "1k" ? value / 1000 : value;
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(scaled)}`;
}

function getProviderInitial(provider: string) {
  return provider
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalizeModelNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeModelNames(item))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    const maybeRecord = value as Record<string, unknown>;

    if (typeof maybeRecord.id === "string") {
      return [maybeRecord.id];
    }

    if (typeof maybeRecord.model === "string") {
      return [maybeRecord.model];
    }

    if (typeof maybeRecord.model_name === "string") {
      return [maybeRecord.model_name];
    }

    return Object.values(maybeRecord).flatMap((item) => normalizeModelNames(item));
  }

  return [];
}

function toCatalogItems(data: ModelSquareData | null): ModelSquareItem[] {
  if (!data) {
    return [];
  }

  const vendorById = new Map(
    (data.pricing?.vendors ?? []).map((vendor) => [vendor.id, vendor] as const),
  );
  const pricingByName = new Map(
    (data.pricing?.data ?? [])
      .filter((item) => item.model_name?.trim())
      .map((item) => [makeModelKey(item.model_name), item] as const),
  );

  function createCatalogItem(modelName: string, fallbackStatus: ModelSquareItem["status"]) {
    const item = pricingByName.get(makeModelKey(modelName));
    const vendor = item?.vendor_id ? vendorById.get(item.vendor_id) : undefined;
    const provider = vendor?.name || item?.owner_by || getProviderFromName(modelName);
    const tags = (item?.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      billingMode: item?.billing_mode || "standard",
      completionRatio: item?.completion_ratio,
      context: getContextLabel(modelName),
      description: getModelDescription({
        description: item?.description,
        modelName,
      }),
      endpoints: item?.supported_endpoint_types ?? [],
      groups: item?.enable_groups?.length ? item.enable_groups : ["default"],
      icon: item?.icon || vendor?.icon,
      modelName,
      modelPrice: item?.model_price,
      modelRatio: item?.model_ratio,
      provider,
      status: fallbackStatus,
      tags,
    } satisfies ModelSquareItem;
  }

  const callableNames = data.userModels.length
    ? data.userModels
    : data.pricing?.data?.length
      ? data.pricing.data.map((item) => item.model_name)
      : data.dashboardModels;

  const itemsByName = new Map<string, ModelSquareItem>();
  for (const modelName of callableNames) {
    const trimmedName = modelName.trim();
    const key = makeModelKey(trimmedName);
    if (!trimmedName || itemsByName.has(key)) {
      continue;
    }

    itemsByName.set(
      key,
      createCatalogItem(trimmedName, data.userModels.length ? "available" : "limited"),
    );
  }

  return [...itemsByName.values()].sort((left, right) =>
    left.modelName.localeCompare(right.modelName),
  );
}

function countBy<T extends string>(items: ModelSquareItem[], getValues: (item: ModelSquareItem) => T[]) {
  const counts = new Map<T, number>();
  for (const item of items) {
    for (const value of getValues(item)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return counts;
}

async function loadModelSquare(): Promise<ModelSquareData> {
  const [pricingResult, userModelsResult, dashboardMapResult] = await Promise.allSettled([
    modelsApi.getPricing(),
    modelsApi.getUserModels(),
    modelsApi.getDashboardModelMap(),
  ]);

  return {
    dashboardModels:
      dashboardMapResult.status === "fulfilled"
        ? [...new Set(normalizeModelNames(dashboardMapResult.value.data))]
        : [],
    pricing: pricingResult.status === "fulfilled" ? pricingResult.value : null,
    pricingError:
      pricingResult.status === "rejected"
        ? pricingResult.reason instanceof Error
          ? pricingResult.reason.message
          : "Pricing data unavailable"
        : null,
    userModels:
      userModelsResult.status === "fulfilled"
        ? [...new Set(normalizeModelNames(userModelsResult.value.data))]
        : [],
  };
}

function ModelIcon({ item }: { item: ModelSquareItem }) {
  if (item.icon) {
    return (
      <img
        alt=""
        className="size-8 object-contain"
        src={item.icon}
      />
    );
  }

  return <span className="text-sm font-black tracking-[-0.04em]">{getProviderInitial(item.provider)}</span>;
}

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-all duration-200",
        active
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#d7cec6] bg-[#fbf8f5] text-[#5f5a55] hover:border-[#b9aa9a] hover:text-[#181614]",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ModelCard({
  item,
  priceUnit,
  view,
}: {
  item: ModelSquareItem;
  priceUnit: PriceUnit;
  view: CatalogView;
}) {
  const fixedPrice = formatFixedPrice(item.modelPrice, priceUnit);

  return (
    <Link
      className={cn(
        "group block overflow-hidden rounded-xl border border-[#d7cec6]/92 bg-[#fffdf8]/92 text-[#181614] shadow-[0_14px_34px_rgb(74_58_42_/_0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1e1a17] hover:shadow-[0_22px_48px_rgb(74_58_42_/_0.08)]",
        view === "list" && "lg:grid lg:grid-cols-[1.2fr_1fr_auto]",
      )}
      to="/models/$modelId"
      params={{ modelId: encodeURIComponent(item.modelName) }}
    >
      <div className="flex min-h-64 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-[#d7cec6] bg-[#f8f4ee] text-[#171411]">
              <ModelIcon item={item} />
            </div>
            <div className="min-w-0">
              <h2 className="max-w-64 text-[25px] font-bold leading-[1.05] tracking-[-0.04em] text-[#14110f]">
                {item.modelName}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-5 text-sm">
                <div>
                  <p className="text-[#77716a]">In:</p>
                  <p className="font-bold">
                    {fixedPrice || formatRatio(item.modelRatio, priceUnit)}
                    <span className="ml-1 font-medium text-[#77716a]">/{priceUnit === "1m" ? "1M" : "1K"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[#77716a]">Out:</p>
                  <p className="font-bold">
                    {fixedPrice || formatRatio(item.completionRatio ?? item.modelRatio, priceUnit)}
                    <span className="ml-1 font-medium text-[#77716a]">/{priceUnit === "1m" ? "1M" : "1K"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <span className="rounded border border-[#d7cec6] bg-[#e9e4df] px-3 py-2 text-xs font-bold text-[#77716a]">
            {item.groups[0] ?? "default"}
          </span>
        </div>

        <p className="mt-6 line-clamp-2 text-[16px] leading-7 text-[#605a54]">{item.description}</p>

        <div className="mt-auto border-t border-[#ddd4ca] pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-[#77716a]">Latency</p>
              <p className="mt-1 text-base font-semibold">{item.status === "available" ? "Live" : "Limited"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#77716a]">Endpoints</p>
              <p className="mt-1 text-base font-semibold">{item.endpoints.length || "Auto"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#77716a]">Status</p>
              <p className="mt-1 flex items-center gap-2 text-base font-semibold">
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    item.status === "available" ? "bg-[#19b37b]" : "bg-[#3b82f6]",
                  )}
                />
                {item.status === "available" ? "Healthy" : "Visible"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[#ddd4ca] bg-[#f8f4ee]/82 px-5 py-3 text-sm font-medium text-[#77716a]">
        <span>Provider: {item.provider}</span>
        <span>Context: {item.context}</span>
      </footer>
    </Link>
  );
}

export function ModelSquarePage() {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const refreshUser = useAuthStore((state) => state.refresh);
  const platformStatus = usePlatformStore((state) => state.status);
  const loadPlatform = usePlatformStore((state) => state.load);
  const { data, error, loading, reload } = useAsyncData(loadModelSquare, []);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [provider, setProvider] = useState("all");
  const [billing, setBilling] = useState<BillingFilter>("all");
  const [pricePlan, setPricePlan] = useState<PricePlan>("standard");
  const [priceUnit, setPriceUnit] = useState<PriceUnit>("1m");
  const [view, setView] = useState<CatalogView>("grid");
  const [visibleCount, setVisibleCount] = useState(modelPageSize);

  useEffect(() => {
    void loadPlatform();
  }, [loadPlatform]);

  useEffect(() => {
    if (authStatus !== "idle" || !localStorage.getItem("commercial_console_user_id")) {
      return;
    }

    void refreshUser();
  }, [authStatus, refreshUser]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const catalogItems = useMemo(() => toCatalogItems(data), [data]);
  const groupCounts = useMemo(() => countBy(catalogItems, (item) => item.groups), [catalogItems]);
  const providerCounts = useMemo(
    () => countBy(catalogItems, (item) => [item.provider]),
    [catalogItems],
  );

  const visibleItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return catalogItems.filter((item) => {
      const matchesSearch =
        !keyword ||
        [item.modelName, item.provider, item.description, ...item.tags, ...item.groups]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      const matchesGroup = group === "all" || item.groups.includes(group);
      const matchesProvider = provider === "all" || item.provider === provider;
      const matchesBilling = billing === "all" || getBillingFilter(item) === billing;

      return matchesSearch && matchesGroup && matchesProvider && matchesBilling;
    });
  }, [billing, catalogItems, group, provider, search]);

  useEffect(() => {
    setVisibleCount(modelPageSize);
  }, [billing, group, provider, search, view]);

  const displayedItems = useMemo(
    () => visibleItems.slice(0, visibleCount),
    [visibleCount, visibleItems],
  );

  const sortedGroups = useMemo(
    () => [...groupCounts.entries()].sort((left, right) => right[1] - left[1]),
    [groupCounts],
  );
  const sortedProviders = useMemo(
    () => [...providerCounts.entries()].sort((left, right) => right[1] - left[1]),
    [providerCounts],
  );

  function resetFilters() {
    setSearch("");
    setGroup("all");
    setProvider("all");
    setBilling("all");
  }

  return (
    <main className="relative min-h-[125dvh] overflow-x-hidden bg-[radial-gradient(circle_at_70%_0%,rgba(225,241,243,0.58),transparent_29rem),radial-gradient(circle_at_14%_18%,rgba(248,229,219,0.36),transparent_28rem),linear-gradient(180deg,#fbfaf8_0%,#f5f2ef_100%)] text-[#181614]">
      <header className="sticky top-0 z-30 border-b border-[#ddd4ca]/80 bg-[#f8f4ee]/78 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full items-center justify-between gap-4 px-5 md:px-8">
          <Link className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#eee8e1]" to="/">
            <PlatformBrandHeader status={platformStatus} />
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <>
                <Link
                  className="hidden h-10 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#2b2621] transition-colors hover:bg-[#eee8e1] sm:inline-flex"
                  to="/overview"
                >
                  Dashboard
                </Link>
                <UserAvatarMenu />
              </>
            ) : (
              <Link
                className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#2b2621] transition-colors hover:bg-[#eee8e1]"
                to="/login"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10 xl:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-[clamp(2.7rem,6vw,4.7rem)] font-bold leading-[0.96] tracking-[-0.06em] text-[#1f1c1a]">
            Model Square
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#756f68]">
            Explore and compare model pricing and capabilities across top providers.
          </p>
          <div className="mt-5 inline-flex rounded-full bg-[#ebe7e2] px-4 py-1.5 text-sm font-bold tracking-[0.03em] text-[#6b625a]">
            {visibleItems.length} of {catalogItems.length} models available
          </div>

          <div className="relative mx-auto mt-9 max-w-2xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2 text-[#5f5a55]" />
            <input
              className="h-16 w-full rounded-none border border-[#d0c7bf] bg-[#fffdf8] pl-14 pr-20 text-xl font-medium text-[#201d1a] shadow-[0_10px_24px_rgb(74_58_42_/_0.05)] outline-none transition-colors placeholder:text-[#756f68] focus:border-[#1f1c1a]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search models, providers, tags..."
              ref={searchInputRef}
              value={search}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 rounded border border-[#d7cec6] bg-[#f3efea] px-2 py-1 text-sm font-semibold text-[#9a9189]">
              ⌘K
            </span>
          </div>
        </div>

        {loading && <div className="mt-12"><LoadingBlock title="Loading model catalog" /></div>}
        {error && (
          <div className="mt-12">
            <ErrorBlock description={error} title="Model catalog unavailable" />
          </div>
        )}

        {!loading && !error && (
          <div className="mt-16 grid items-start gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className={cn(shellPanelClass, "sticky top-24 p-6")}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.08em]">Filters</h2>
                <button
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7a7169] transition-colors hover:text-[#181614]"
                  onClick={resetFilters}
                  type="button"
                >
                  <RefreshCw className="size-4" />
                  Reset
                </button>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="mb-4 text-lg font-bold tracking-[-0.03em]">Group</h3>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={group === "all"} onClick={() => setGroup("all")}>
                      All
                    </FilterChip>
                    {sortedGroups.slice(0, filterOptionLimit).map(([groupName, count]) => (
                      <FilterChip
                        active={group === groupName}
                        key={groupName}
                        onClick={() => setGroup(groupName)}
                      >
                        {groupName}
                        <span className="ml-2 rounded bg-[#e8e2dc] px-1.5 text-xs text-[#7a7169]">
                          x{count}
                        </span>
                      </FilterChip>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold tracking-[-0.03em]">Provider</h3>
                  <div className="grid gap-2.5">
                    <button
                      className="flex items-center gap-3 text-left text-lg font-medium"
                      onClick={() => setProvider("all")}
                      type="button"
                    >
                      <span
                        className={cn(
                          "grid size-5 place-items-center rounded-full border",
                          provider === "all" ? "border-[#111] bg-[#111]" : "border-[#aaa19a]",
                        )}
                      >
                        {provider === "all" && <span className="size-2 rounded-full bg-white" />}
                      </span>
                      <span>All Providers</span>
                      <span className="ml-auto rounded bg-[#e9e4df] px-2 py-0.5 text-sm text-[#7a7169]">
                        {catalogItems.length}
                      </span>
                    </button>
                    {sortedProviders.slice(0, filterOptionLimit).map(([providerName, count]) => (
                      <button
                        className="flex items-center gap-3 text-left text-lg font-medium text-[#6a625b] transition-colors hover:text-[#181614]"
                        key={providerName}
                        onClick={() => setProvider(providerName)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "grid size-5 place-items-center rounded-full border",
                            provider === providerName ? "border-[#111] bg-[#111]" : "border-[#aaa19a]",
                          )}
                        >
                          {provider === providerName && <span className="size-2 rounded-full bg-white" />}
                        </span>
                        <span>{providerName}</span>
                        <span className="ml-auto rounded bg-[#e9e4df] px-2 py-0.5 text-sm text-[#7a7169]">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold tracking-[-0.03em]">Pricing Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ["all", "All Types"],
                      ["standard", "Standard"],
                      ["fixed", "Fixed"],
                      ["tiered", "Tiered"],
                    ].map(([id, label]) => (
                      <FilterChip
                        active={billing === id}
                        key={id}
                        onClick={() => setBilling(id as BillingFilter)}
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </section>
              </div>
            </aside>

            <div className="min-w-0">
              <div className={cn(shellPanelClass, "mb-8 flex flex-wrap items-center justify-between gap-4 p-4")}>
                <p className="text-lg font-medium text-[#756f68]">
                  Showing <strong className="text-[#171411]">{displayedItems.length}</strong> of{" "}
                  <strong className="text-[#171411]">{visibleItems.length}</strong>
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex rounded-lg border border-[#d7cec6] bg-[#f8f4ee] p-1">
                    {(["standard", "prepaid"] as const).map((mode) => (
                      <button
                        className={cn(
                          "h-10 min-w-24 rounded-md px-4 text-sm font-bold transition-colors",
                          pricePlan === mode
                            ? "bg-[#111] text-white"
                            : "text-[#756f68] hover:text-[#181614]",
                        )}
                        key={mode}
                        onClick={() => setPricePlan(mode)}
                        type="button"
                      >
                        {mode === "standard" ? "Standard" : "Prepaid"}
                      </button>
                    ))}
                  </div>

                  <div className="flex rounded-lg border border-[#d7cec6] bg-[#f8f4ee] p-1">
                    {(["1m", "1k"] as const).map((unit) => (
                      <button
                        className={cn(
                          "h-10 min-w-16 rounded-md px-4 text-sm font-bold transition-colors",
                          priceUnit === unit
                            ? "bg-[#111] text-white"
                            : "text-[#756f68] hover:text-[#181614]",
                        )}
                        key={unit}
                        onClick={() => setPriceUnit(unit)}
                        type="button"
                      >
                        / {unit === "1m" ? "1M" : "1K"}
                      </button>
                    ))}
                  </div>

                  <button className={controlButtonClass} onClick={() => void reload()} type="button">
                    <SlidersHorizontal className="size-4" />
                    Refresh
                  </button>

                  <div className="flex overflow-hidden rounded-lg border border-[#d7cec6] bg-[#f8f4ee]">
                    <button
                      aria-label="Grid view"
                      className={cn("grid size-11 place-items-center", view === "grid" && "bg-[#e4ded8]")}
                      onClick={() => setView("grid")}
                      type="button"
                    >
                      <Grid2X2 className="size-5" />
                    </button>
                    <button
                      aria-label="List view"
                      className={cn("grid size-11 place-items-center", view === "list" && "bg-[#e4ded8]")}
                      onClick={() => setView("list")}
                      type="button"
                    >
                      <List className="size-5" />
                    </button>
                  </div>
                </div>
              </div>

              {data?.pricingError && (
                <div className="mb-6 rounded-xl border border-[#ead2be] bg-[#fff7ef] px-5 py-4 text-sm font-medium text-[#775337]">
                  Pricing details are temporarily unavailable. The catalog is using enabled model data.
                </div>
              )}

              {visibleItems.length === 0 ? (
                <div className={cn(shellPanelClass, "grid min-h-72 place-items-center p-10 text-center")}>
                  <div>
                    <Layers3 className="mx-auto size-10 text-[#8a8077]" />
                    <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em]">No models matched</h2>
                    <p className="mt-2 text-[#756f68]">Reset filters or adjust the search query.</p>
                  </div>
                </div>
              ) : (
                <div className={cn("grid gap-8", view === "grid" ? "2xl:grid-cols-2" : "grid-cols-1")}>
                  {displayedItems.map((item) => (
                    <ModelCard item={item} key={item.modelName} priceUnit={priceUnit} view={view} />
                  ))}
                </div>
              )}

              {visibleItems.length > displayedItems.length && (
                <div className="mt-10 flex justify-center">
                  <button
                    className="inline-flex h-12 min-w-56 items-center justify-center rounded-lg bg-[#181614] px-6 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_16px_34px_rgb(74_58_42_/_0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2a2622] active:translate-y-px"
                    onClick={() => setVisibleCount((count) => count + modelPageSize)}
                    type="button"
                  >
                    Load more models
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto mt-14 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-[#ddd4ca] pt-6 text-sm font-medium text-[#756f68]">
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#19b37b]" />
            {platformStatus?.system_name || "Test API"} model catalog operational
          </span>
          <span className="inline-flex items-center gap-2">
            <Bot className="size-4" />
            Unified API protocol
            <ChevronRight className="size-4" />
            <Check className="size-4" />
          </span>
        </div>
      </section>
    </main>
  );
}
