import { z } from "zod";
import { apiFetch } from "@/lib/api/fetcher";
import {
  ListDatasetsResponseSchema,
  CreateDatasetRequestSchema,
  DatasetSchema,
  PresignUploadRequestSchema,
  PresignUploadResponseSchema,
  CompleteUploadRequestSchema,
  CompleteUploadResponseSchema,
  PresignDownloadRequestSchema,
  PresignDownloadResponseSchema,
  FinalizeRequestSchema,
  FinalizeResponseSchema,
  HealthResponseSchema,
} from "@/lib/api/types";

export async function listDatasets() {
  const data = await apiFetch("/v1/datasets");
  return ListDatasetsResponseSchema.parse(data);
}

export async function createDataset(input: z.infer<typeof CreateDatasetRequestSchema>) {
  const data = await apiFetch("/v1/datasets", { method: "POST", json: CreateDatasetRequestSchema.parse(input) });
  return DatasetSchema.parse(data);
}

export async function getDataset(id: string) {
  const data = await apiFetch(`/v1/datasets/${encodeURIComponent(id)}`);
  return DatasetSchema.parse(data);
}

export async function presignUpload(input: z.infer<typeof PresignUploadRequestSchema>) {
  const data = await apiFetch("/v1/uploads/presign", { method: "POST", json: PresignUploadRequestSchema.parse(input) });
  return PresignUploadResponseSchema.parse(data);
}

export async function completeUpload(input: z.infer<typeof CompleteUploadRequestSchema>) {
  const data = await apiFetch("/v1/uploads/complete", { method: "POST", json: CompleteUploadRequestSchema.parse(input) });
  return CompleteUploadResponseSchema.parse(data);
}

export async function presignDownload(input: z.infer<typeof PresignDownloadRequestSchema>) {
  const data = await apiFetch("/v1/downloads/presign", { method: "POST", json: PresignDownloadRequestSchema.parse(input) });
  return PresignDownloadResponseSchema.parse(data);
}

export async function finalizeDataset(id: string, input: z.infer<typeof FinalizeRequestSchema>) {
  const data = await apiFetch(`/v1/datasets/${encodeURIComponent(id)}/finalize`, {
    method: "POST",
    json: FinalizeRequestSchema.parse(input),
  });
  return FinalizeResponseSchema.parse(data);
}

export async function health() {
  const data = await apiFetch("/v1/health");
  return HealthResponseSchema.parse(data);
}
