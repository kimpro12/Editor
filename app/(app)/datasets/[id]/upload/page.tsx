"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDatasetQuery } from "@/hooks/useDatasetQuery";
import { usePresignUploadMutation } from "@/hooks/usePresignUploadMutation";
import { useCompleteUploadMutation } from "@/hooks/useCompleteUploadMutation";

function randomId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function UploadPage() {
  const params = useParams<{ id: string }>();
  const datasetId = params.id;
  const router = useRouter();

  const datasetQ = useDatasetQuery(datasetId);
  const presignM = usePresignUploadMutation();
  const completeM = useCompleteUploadMutation();

  const [file, setFile] = useState<File | null>(null);
  const [pct, setPct] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadId = useMemo(() => randomId(), []);

  function onPick(f: File | null) {
    setFile(f);
    setPct(0);
  }

  async function startUpload() {
    if (!file) return;
    const d = datasetQ.data;
    if (!d) return;

    setIsUploading(true);
    try {
      const presigned = await presignM.mutateAsync({
        dataset_id: datasetId,
        upload_id: uploadId,
        content_type: file.type || "application/octet-stream",
      });

      // PUT via XHR to get progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open("PUT", presigned.put_url, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          const p = Math.round((evt.loaded / evt.total) * 100);
          setPct(p);
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.onabort = () => reject(new Error("Upload canceled"));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed (${xhr.status})`));
        };
        xhr.send(file);
      });

      await completeM.mutateAsync({
        dataset_id: datasetId,
        upload_id: uploadId,
        asset_type: d.asset_type,
      });

      toast.success("Upload complete");
      router.push(`/datasets/${datasetId}/preview`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setIsUploading(false);
      xhrRef.current = null;
    }
  }

  function cancelUpload() {
    xhrRef.current?.abort();
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">Upload sprite sheet</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />

          {file ? (
            <div className="text-sm">
              Selected: <b>{file.name}</b> ({Math.round(file.size / 1024)} KB)
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Pick an image (png recommended).</div>
          )}

          {isUploading ? (
            <div className="space-y-2">
              <Progress value={pct} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{pct}%</span>
                <button className="underline" onClick={cancelUpload}>Cancel</button>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button onClick={startUpload} disabled={!file || isUploading || presignM.isPending || completeM.isPending}>
              {isUploading ? "Uploading..." : "Start upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
