import { apiClient } from "@shared/api/client";
import type { ApiEnvelope } from "@shared/api/contracts";

export interface PricingModel {
  audio_completion_ratio?: number;
  audio_ratio?: number;
  billing_expr?: string;
  billing_mode?: string;
  cache_ratio?: number;
  completion_ratio?: number;
  create_cache_ratio?: number;
  description?: string;
  enable_groups?: string[];
  icon?: string;
  image_ratio?: number;
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  owner_by?: string;
  pricing_version?: string;
  quota_type?: number;
  supported_endpoint_types?: string[];
  tags?: string;
  vendor_id?: number;
}

export interface PricingVendor {
  description?: string;
  icon?: string;
  id: number;
  name: string;
}

export interface PricingResponse {
  auto_groups?: string[];
  data: PricingModel[];
  group_ratio?: Record<string, number>;
  pricing_version?: string;
  success: boolean;
  supported_endpoint?: Record<string, unknown>;
  usable_group?: Record<string, string>;
  vendors?: PricingVendor[];
}

export function getUserModels() {
  return apiClient<ApiEnvelope<string[]>>({
    path: "/api/user/models",
  });
}

export function getDashboardModelMap() {
  return apiClient<ApiEnvelope<Record<string, string[]>>>({
    path: "/api/models",
  });
}

export function getPricing() {
  return apiClient<PricingResponse>({
    path: "/api/pricing",
  });
}
