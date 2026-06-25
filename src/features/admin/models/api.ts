import { apiClient } from "@shared/api/client";
import type { ApiEnvelope, PageQuery } from "@shared/api/contracts";

export interface BoundChannel {
  name: string;
  type: number;
}

export interface AdminModel {
  bound_channels?: BoundChannel[];
  created_time: number;
  description?: string;
  enable_groups?: string[];
  endpoints?: string;
  icon?: string;
  id: number;
  matched_count?: number;
  matched_models?: string[];
  model_name: string;
  name_rule: number;
  quota_types?: number[];
  status: number;
  sync_official: number;
  tags?: string;
  updated_time: number;
  vendor_id?: number;
}

export interface AdminVendor {
  created_time: number;
  description?: string;
  icon?: string;
  id: number;
  name: string;
  status: number;
  updated_time: number;
}

export interface ModelPage {
  items: AdminModel[];
  page: number;
  page_size: number;
  total: number;
  vendor_counts?: Record<string, number>;
}

export interface VendorPage {
  items: AdminVendor[];
  page: number;
  page_size: number;
  total: number;
}

export interface ModelQuery extends PageQuery {
  keyword?: string;
  vendor?: string;
}

export function listModels(query?: ModelQuery) {
  return apiClient<ApiEnvelope<ModelPage>>({
    path: "/api/models/",
    query,
  });
}

export function searchModels(query: ModelQuery) {
  return apiClient<ApiEnvelope<ModelPage>>({
    path: "/api/models/search",
    query,
  });
}

export function createModel(request: Partial<AdminModel>) {
  return apiClient<ApiEnvelope<AdminModel>, Partial<AdminModel>>({
    body: request,
    method: "POST",
    path: "/api/models/",
  });
}

export function updateModel(request: Partial<AdminModel> & { id: number }) {
  return apiClient<ApiEnvelope<AdminModel>, Partial<AdminModel> & { id: number }>({
    body: request,
    method: "PUT",
    path: "/api/models/",
  });
}

export function updateModelStatus(id: number, status: number) {
  return apiClient<ApiEnvelope<AdminModel>, { id: number; status: number }>({
    body: { id, status },
    method: "PUT",
    path: "/api/models/",
    query: { status_only: true },
  });
}

export function deleteModel(id: number) {
  return apiClient<ApiEnvelope<null>>({
    method: "DELETE",
    path: `/api/models/${id}`,
  });
}

export function listVendors(query?: PageQuery) {
  return apiClient<ApiEnvelope<VendorPage>>({
    path: "/api/vendors/",
    query,
  });
}

export function getMissingModels() {
  return apiClient<ApiEnvelope<string[]>>({
    path: "/api/models/missing",
  });
}
