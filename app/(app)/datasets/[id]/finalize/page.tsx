"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDatasetQuery } from "@/hooks/useDatasetQuery";
import { useFinalizeDatasetMutation } from "@/hooks/useFinalizeDatasetMutation";
import { usePresignDownloadMutation } from "@/hooks/usePresignDownloadMutation";
import { Box } from "@/types/ingestion";

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  // append helps on Firefox
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

function storageKeyBoxes(datasetId: string) {
  return `editor_boxes_${datasetId}`;
}

export default function FinalizePage() {
  const params = useParams<{ id: string }>();
  const datasetId = params.id;

  const datasetQ = useDatasetQuery(datasetId);
  const finalizeM = useFinalizeDatasetMutation(datasetId);
  const presignM = usePresignDownloadMutation();

  const [dedupe, setDedupe] = useState(true);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);

  const boxes: Box[] = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKeyBoxes(datasetId));
      return raw ? (JSON.parse(raw) as Box[]) : [];
    } catch {
      return [];
    }
  }, [datasetId]);

  async function runFinalize() {
    if (!boxes.length) {
      toast.error("No boxes found. Go to Preview and create boxes first.");
      return;
    }
    try {
      await finalizeM.mutateAsync({
        boxes,
        dedupe,
        export: { zip: true, include_manifest: true },
      });
      toast.success("Finalize requested. Polling status...");
      await datasetQ.refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Finalize failed");
    }
  }

  useEffect(() => {
    const d = datasetQ.data;
    if (!d) return;
    if (d.status !== "DONE") return;

    if (d.export_key) {
      presignM.mutate(
        { key: d.export_key },
        { onSuccess: (r) => setExportUrl(r.get_url), onError: (e: any) => toast.error(e?.message ?? "presign failed") }
      );
    }
    if (d.manifest_key) {
      presignM.mutate(
        { key: d.manifest_key },
        { onSuccess: (r) => setManifestUrl(r.get_url), onError: () => {} }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetQ.data?.status, datasetQ.data?.export_key, datasetQ.data?.manifest_key]);

  const d = datasetQ.data;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Finalize</h1>
          <p className="text-sm text-muted-foreground">
            Export a zip + manifest using the mock BFF backend.
          </p>
        </div>
        <Badge variant="secondary">{d?.status ?? "..."}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={dedupe} onChange={() => setDedupe((v) => !v)} />
            Dedupe (mock)
          </label>

          <div className="text-sm text-muted-foreground">
            Boxes loaded: <b>{boxes.length}</b>{" "}
            {boxes.length ? null : (
              <>
                — go to <Link className="underline" href={`/datasets/${datasetId}/preview`}>Preview</Link> to create boxes.
              </>
            )}
          </div>

          <Button onClick={runFinalize} disabled={finalizeM.isPending}>
            {finalizeM.isPending ? "Finalizing..." : "Finalize"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Download</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {d?.status === "DONE" ? (
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <Button
                  disabled={!exportUrl}
                  onClick={async () => {
                    try {
                      if (!exportUrl) return;
                      await downloadFile(exportUrl, "dataset.zip");
                      toast.success("Download started");
                    } catch (e: any) {
                      toast.error(e?.message ?? "Download failed");
                    }
                  }}
                >
                  Download dataset.zip
                </Button>
                <Button asChild variant="outline" disabled={!manifestUrl}>
                  <a href={manifestUrl ?? "#"} target="_blank" rel="noreferrer">
                    Open manifest.json
                  </a>
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Presigned download URLs are treated as bearer tokens — do not share or store them.
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Not ready yet. Status will become DONE automatically after a short mock delay.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
