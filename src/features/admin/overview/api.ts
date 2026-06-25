import * as billingApi from "@features/admin/billing/api";
import * as channelsApi from "@features/admin/channels/api";
import * as logsApi from "@features/admin/logs/api";
import * as modelsApi from "@features/admin/models/api";
import * as redemptionsApi from "@features/admin/redemptions/api";
import * as usersApi from "@features/admin/users/api";
import type { UsageSummary } from "@shared/api/contracts";

export interface AdminOverviewMetric {
  key: string;
  label: string;
  status: "ready" | "unavailable";
  value: number | null;
}

export interface AdminOverviewData {
  metrics: AdminOverviewMetric[];
  usage: UsageSummary | null;
}

async function resolveCount(
  key: string,
  label: string,
  load: () => Promise<{ data: { total: number } }>,
) {
  const result = await Promise.resolve(load()).then(
    (response): AdminOverviewMetric => ({
      key,
      label,
      status: "ready",
      value: response.data.total,
    }),
    (): AdminOverviewMetric => ({
      key,
      label,
      status: "unavailable",
      value: null,
    }),
  );

  return result;
}

export async function getAdminOverview(): Promise<AdminOverviewData> {
  const [users, channels, models, redemptions, billing, usage] = await Promise.all([
    resolveCount("users", "Users", () => usersApi.listUsers({ p: 1, page_size: 1 })),
    resolveCount("channels", "Channels", () => channelsApi.listChannels({ p: 1, page_size: 1 })),
    resolveCount("models", "Models", () => modelsApi.listModels({ p: 1, page_size: 1 })),
    resolveCount("redemptions", "Redemptions", () =>
      redemptionsApi.listRedemptions({ p: 1, page_size: 1 }),
    ),
    resolveCount("billing", "Top-ups", () => billingApi.listTopUps({ p: 1, page_size: 1 })),
    logsApi.getUsageStat().then(
      (response) => response.data,
      () => null,
    ),
  ]);

  return {
    metrics: [users, channels, models, redemptions, billing],
    usage,
  };
}
