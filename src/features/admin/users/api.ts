import { apiClient } from "@shared/api/client";
import type { ApiEnvelope, PageInfo, PageQuery } from "@shared/api/contracts";

export interface AdminUser {
  id: number;
  username: string;
  password?: string;
  display_name?: string;
  role: number;
  status: number;
  email?: string;
  github_id?: string;
  discord_id?: string;
  oidc_id?: string;
  wechat_id?: string;
  telegram_id?: string;
  group?: string;
  quota: number;
  used_quota: number;
  request_count: number;
  aff_quota?: number;
  inviter_id?: number;
  remark?: string;
  stripe_customer?: string;
  created_at?: number;
  last_login_at?: number;
}

export interface UserOAuthBinding {
  provider_icon: string;
  provider_id: number;
  provider_name: string;
  provider_slug: string;
  provider_user_id: string;
}

export interface AdminTwoFAStats {
  enabled_rate: string;
  enabled_users: number;
  total_users: number;
}

export interface SubscriptionPlan {
  allow_balance_pay?: boolean;
  allow_wallet_overflow?: boolean;
  created_at?: number;
  currency: string;
  custom_seconds?: number;
  downgrade_group?: string;
  duration_unit: string;
  duration_value: number;
  enabled: boolean;
  id: number;
  max_purchase_per_user?: number;
  price_amount: number;
  quota_reset_custom_seconds?: number;
  quota_reset_period?: string;
  sort_order?: number;
  stripe_price_id?: string;
  subtitle?: string;
  title: string;
  total_amount?: number;
  updated_at?: number;
  upgrade_group?: string;
}

export interface SubscriptionPlanDTO {
  plan: SubscriptionPlan;
}

export interface UserSubscriptionRecord {
  allow_wallet_overflow?: boolean;
  amount_total: number;
  amount_used: number;
  created_at?: number;
  downgrade_group?: string;
  end_time: number;
  id: number;
  last_reset_time?: number;
  next_reset_time?: number;
  plan_id: number;
  prev_user_group?: string;
  source: string;
  start_time: number;
  status: string;
  updated_at?: number;
  upgrade_group?: string;
  user_id: number;
}

export interface UserSubscriptionSummary {
  subscription: UserSubscriptionRecord;
}

export interface UserSearchQuery extends PageQuery {
  group?: string;
  keyword?: string;
  role?: number;
  status?: number;
}

export interface CreateUserRequest {
  display_name?: string;
  password: string;
  role: number;
  username: string;
}

export interface UpdateUserRequest {
  display_name?: string;
  group?: string;
  id: number;
  password?: string;
  remark?: string;
  role: number;
  status: number;
  username: string;
}

export type ManageUserAction = "add_quota" | "delete" | "demote" | "disable" | "enable" | "promote";

export type UserBindingType =
  | "discord"
  | "email"
  | "github"
  | "linuxdo"
  | "oidc"
  | "telegram"
  | "wechat";

export interface ManageUserRequest {
  action: ManageUserAction;
  id: number;
  mode?: "add" | "override" | "subtract";
  value?: number;
}

export function listUsers(query?: PageQuery) {
  return apiClient<ApiEnvelope<PageInfo<AdminUser>>>({
    path: "/api/user/",
    query,
  });
}

export function searchUsers(query: UserSearchQuery) {
  return apiClient<ApiEnvelope<PageInfo<AdminUser>>>({
    path: "/api/user/search",
    query,
  });
}

export function createUser(request: CreateUserRequest) {
  return apiClient<{ message: string; success: boolean }, CreateUserRequest>({
    body: request,
    method: "POST",
    path: "/api/user/",
  });
}

export function updateUser(request: UpdateUserRequest) {
  return apiClient<{ message: string; success: boolean }, UpdateUserRequest>({
    body: request,
    method: "PUT",
    path: "/api/user/",
  });
}

export function deleteUser(id: number) {
  return apiClient<{ message: string; success: boolean }>({
    method: "DELETE",
    path: `/api/user/${id}`,
  });
}

export function manageUser(request: ManageUserRequest) {
  return apiClient<ApiEnvelope<Partial<AdminUser>>, ManageUserRequest>({
    body: request,
    method: "POST",
    path: "/api/user/manage",
  });
}

export function getUserOAuthBindings(id: number) {
  return apiClient<ApiEnvelope<UserOAuthBinding[]>>({
    path: `/api/user/${id}/oauth/bindings`,
  });
}

export function unbindUserOAuth(id: number, providerId: number) {
  return apiClient<{ message: string; success: boolean }>({
    method: "DELETE",
    path: `/api/user/${id}/oauth/bindings/${providerId}`,
  });
}

export function clearUserBinding(id: number, bindingType: UserBindingType) {
  return apiClient<{ message: string; success: boolean }>({
    method: "DELETE",
    path: `/api/user/${id}/bindings/${bindingType}`,
  });
}

export function resetUserPasskey(id: number) {
  return apiClient<{ message: string; success: boolean }>({
    method: "DELETE",
    path: `/api/user/${id}/reset_passkey`,
  });
}

export function getTwoFAStats() {
  return apiClient<ApiEnvelope<AdminTwoFAStats>>({
    path: "/api/user/2fa/stats",
  });
}

export function disableUserTwoFA(id: number) {
  return apiClient<{ message: string; success: boolean }>({
    method: "DELETE",
    path: `/api/user/${id}/2fa`,
  });
}

export function listSubscriptionPlans() {
  return apiClient<ApiEnvelope<SubscriptionPlanDTO[]>>({
    path: "/api/subscription/admin/plans",
  });
}

export function listUserSubscriptions(id: number) {
  return apiClient<ApiEnvelope<UserSubscriptionSummary[]>>({
    path: `/api/subscription/admin/users/${id}/subscriptions`,
  });
}

export function createUserSubscription(id: number, planId: number) {
  return apiClient<ApiEnvelope<{ message?: string } | null>, { plan_id: number }>({
    body: { plan_id: planId },
    method: "POST",
    path: `/api/subscription/admin/users/${id}/subscriptions`,
  });
}

export function bindSubscription(userId: number, planId: number) {
  return apiClient<ApiEnvelope<{ message?: string } | null>, { plan_id: number; user_id: number }>({
    body: { plan_id: planId, user_id: userId },
    method: "POST",
    path: "/api/subscription/admin/bind",
  });
}

export function invalidateUserSubscription(id: number) {
  return apiClient<ApiEnvelope<{ message?: string } | null>>({
    method: "POST",
    path: `/api/subscription/admin/user_subscriptions/${id}/invalidate`,
  });
}

export function deleteUserSubscription(id: number) {
  return apiClient<ApiEnvelope<{ message?: string } | null>>({
    method: "DELETE",
    path: `/api/subscription/admin/user_subscriptions/${id}`,
  });
}
