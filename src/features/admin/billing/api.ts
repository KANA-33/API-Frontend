import { apiClient } from "@shared/api/client";
import type { ApiEnvelope, BillingRecord, PageInfo, PageQuery } from "@shared/api/contracts";

export interface TopUpQuery extends PageQuery {
  keyword?: string;
}

export interface AdminOption {
  key: string;
  value: string;
}

export interface SubscriptionPlan {
  allow_balance_pay?: boolean;
  allow_wallet_overflow?: boolean;
  created_at?: number;
  creem_product_id?: string;
  currency: string;
  custom_seconds?: number;
  downgrade_group?: string;
  duration_unit: "custom" | "day" | "hour" | "month" | "year";
  duration_value: number;
  enabled: boolean;
  id: number;
  max_purchase_per_user?: number;
  price_amount: number;
  quota_reset_custom_seconds?: number;
  quota_reset_period?: "custom" | "daily" | "monthly" | "never" | "weekly";
  sort_order?: number;
  stripe_price_id?: string;
  subtitle?: string;
  title: string;
  total_amount?: number;
  updated_at?: number;
  upgrade_group?: string;
  waffo_pancake_product_id?: string;
}

export interface SubscriptionPlanDTO {
  plan: SubscriptionPlan;
}

export interface UpsertSubscriptionPlanRequest {
  plan: SubscriptionPlan;
}

export interface UpdateOptionRequest {
  key: string;
  value: boolean | number | string;
}

export function listTopUps(query?: TopUpQuery) {
  return apiClient<ApiEnvelope<PageInfo<BillingRecord>>>({
    path: "/api/user/topup",
    query,
  });
}

export function completeTopUp(tradeNo: string) {
  return apiClient<ApiEnvelope<null>, { trade_no: string }>({
    body: { trade_no: tradeNo },
    method: "POST",
    path: "/api/user/topup/complete",
  });
}

export function listSubscriptionPlans() {
  return apiClient<ApiEnvelope<SubscriptionPlanDTO[]>>({
    path: "/api/subscription/admin/plans",
  });
}

export function createSubscriptionPlan(plan: SubscriptionPlan) {
  return apiClient<ApiEnvelope<SubscriptionPlan>, UpsertSubscriptionPlanRequest>({
    body: { plan },
    method: "POST",
    path: "/api/subscription/admin/plans",
  });
}

export function updateSubscriptionPlan(plan: SubscriptionPlan) {
  return apiClient<ApiEnvelope<null>, UpsertSubscriptionPlanRequest>({
    body: { plan },
    method: "PUT",
    path: `/api/subscription/admin/plans/${plan.id}`,
  });
}

export function updateSubscriptionPlanStatus(id: number, enabled: boolean) {
  return apiClient<ApiEnvelope<null>, { enabled: boolean }>({
    body: { enabled },
    method: "PATCH",
    path: `/api/subscription/admin/plans/${id}`,
  });
}

export function listOptions() {
  return apiClient<ApiEnvelope<AdminOption[]>>({
    path: "/api/option/",
  });
}

export function updateOption(request: UpdateOptionRequest) {
  return apiClient<ApiEnvelope<null>, UpdateOptionRequest>({
    body: request,
    method: "PUT",
    path: "/api/option/",
  });
}

export function confirmPaymentCompliance() {
  return apiClient<
    ApiEnvelope<{
      confirmed: boolean;
      confirmed_at: number;
      confirmed_by: number;
      terms_version: string;
    }>,
    { confirmed: boolean }
  >({
    body: { confirmed: true },
    method: "POST",
    path: "/api/option/payment_compliance",
  });
}
