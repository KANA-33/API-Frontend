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
