import { z } from "zod";

export const DatasetStatusSchema = z.enum([
  "DRAFT",
  "UPLOADING",
  "PREVIEW_READY",
  "FINALIZING",
  "DONE",
  "FAILED",
]);

export const BoxSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  caption: z.string().optional(),
  ignore_warning: z.boolean().optional(),
  qc_warnings: z.array(z.string()).optional(),
});

export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  asset_type: z.string(),
  status: DatasetStatusSchema,
  updated_at: z.string(),
  token: z.string().optional(),
  raw_key: z.string().optional(),
  preview_key: z.string().optional(),
  export_key: z.string().optional(),
  manifest_key: z.string().optional(),
  boxes: z.array(BoxSchema).optional(),
});

export const ListDatasetsResponseSchema = z.object({
  items: z.array(DatasetSchema),
});

export const CreateDatasetRequestSchema = z.object({
  name: z.string(),
  asset_type: z.string(),
  token: z.string().optional(),
});

export const PresignUploadRequestSchema = z.object({
  dataset_id: z.string(),
  upload_id: z.string(),
  content_type: z.string(),
});

export const PresignUploadResponseSchema = z.object({
  put_url: z.string(),
  key: z.string(),
});

export const CompleteUploadRequestSchema = z.object({
  dataset_id: z.string(),
  upload_id: z.string(),
  asset_type: z.string(),
});

export const CompleteUploadResponseSchema = z.object({
  preview_key: z.string(),
  boxes: z.array(BoxSchema),
  status: DatasetStatusSchema,
});

export const PresignDownloadRequestSchema = z.object({
  key: z.string(),
});

export const PresignDownloadResponseSchema = z.object({
  get_url: z.string(),
});

export const FinalizeRequestSchema = z.object({
  boxes: z.array(BoxSchema),
  dedupe: z.boolean().default(true),
  export: z.object({
    zip: z.boolean().default(true),
    include_manifest: z.boolean().default(true),
  }),
});

export const FinalizeResponseSchema = z.object({
  export_key: z.string(),
  manifest_key: z.string().optional(),
  status: DatasetStatusSchema,
});

export const HealthResponseSchema = z.object({
  ok: z.boolean(),
});
