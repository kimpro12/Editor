export type DatasetStatus =
  | "DRAFT"
  | "UPLOADING"
  | "PREVIEW_READY"
  | "FINALIZING"
  | "DONE"
  | "FAILED";

export type Dataset = {
  id: string;
  name: string;
  asset_type: string;
  status: DatasetStatus;
  updated_at: string;
  token?: string;
  // mock/extras:
  raw_key?: string;
  preview_key?: string;
  export_key?: string;
  manifest_key?: string;
};

export type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  caption?: string;
  ignore_warning?: boolean;
  qc_warnings?: string[];
};

export type DatasetDetail = Dataset & {
  boxes?: Box[];
};
