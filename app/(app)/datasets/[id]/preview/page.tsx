"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useDatasetQuery } from "@/hooks/useDatasetQuery";
import { usePresignDownloadMutation } from "@/hooks/usePresignDownloadMutation";
import { Box } from "@/types/ingestion";
import { useEditorStore } from "@/lib/editor/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const StageCanvas = dynamic(() => import("@/components/editor/StageCanvas").then(m => m.StageCanvas), { ssr: false });

function storageKeyBoxes(datasetId: string) {
  return `editor_boxes_${datasetId}`;
}

export default function PreviewPage() {
  const params = useParams<{ id: string }>();
  const datasetId = params.id;
  
  const router = useRouter();

  const datasetQ = useDatasetQuery(datasetId);
  const presignM = usePresignDownloadMutation();
  const { boxes, setBoxes, selectedId, select, addBox, updateBox, deleteSelected, duplicateSelected, nudgeSelected, undo, redo, setSelectedCaption, toggleIgnoreWarning } = useEditorStore();

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // We must NOT persist an initial empty [] to localStorage on refresh.
  // Otherwise the saved editor state is wiped before datasetQ finishes loading.
  const bootRef = useRef<{ datasetId: string | null; ready: boolean; source: "local" | "dataset" | null }>({
    datasetId: null,
    ready: false,
    source: null,
  });
  const [isBootstrapped, setIsBootstrapped] = useState(false);


  // Keyboard shortcuts for editor (avoid hijacking when typing in inputs)
  useEffect(() => {
    function isEditable(el: EventTarget | null) {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isEditable(e.target)) return;

      const mod = e.ctrlKey || e.metaKey;

      // Undo/redo
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      // Duplicate
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }

      // Nudge
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudgeSelected(-step, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nudgeSelected(step, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nudgeSelected(0, -step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        nudgeSelected(0, step);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, deleteSelected, duplicateSelected, nudgeSelected]);

  // 1) On datasetId change, try to restore from localStorage immediately.
  useEffect(() => {
    if (!datasetId) return;
    bootRef.current = { datasetId, ready: false, source: null };
    setIsBootstrapped(false);

    // Clear view state for the new dataset (but do NOT persist yet)
    setBoxes([]);
    setImageUrl(null);

    try {
      const raw = localStorage.getItem(storageKeyBoxes(datasetId));
      if (raw != null) {
        const parsed = JSON.parse(raw) as unknown;

        // Backward compatible: allow either an array OR { boxes: [...] }
        const asArray = Array.isArray(parsed)
          ? (parsed as Box[])
          : parsed && typeof parsed === "object" && Array.isArray((parsed as any).boxes)
            ? ((parsed as any).boxes as Box[])
            : null;

        if (asArray) {
          setBoxes(asArray);
          bootRef.current = { datasetId, ready: true, source: "local" };
          setIsBootstrapped(true);
          return;
        }

        // If the key exists but is invalid, do NOT overwrite it.
        // We'll fall back to dataset boxes (if any) and only write after the user edits.
      }
    } catch {
      // ignore
    }
  }, [datasetId, setBoxes]);

  // 2) If there was no localStorage restore, fall back to dataset boxes once fetched.
  useEffect(() => {
    if (!datasetId) return;
    if (bootRef.current.datasetId !== datasetId) return;
    if (bootRef.current.ready) return;

    const d = datasetQ.data;
    if (!d) return;

    if (Array.isArray(d.boxes)) setBoxes(d.boxes);
    bootRef.current = { datasetId, ready: true, source: "dataset" };
    setIsBootstrapped(true);
  }, [datasetId, datasetQ.data, setBoxes]);

  // Persist boxes (only after bootstrap to avoid wiping saved state on refresh)
  useEffect(() => {
    if (!datasetId) return;
    if (!isBootstrapped) return;
    try {
      localStorage.setItem(storageKeyBoxes(datasetId), JSON.stringify(boxes));
    } catch {
      // ignore
    }
  }, [boxes, datasetId, isBootstrapped]);

  // Load image URL via presigned download
  useEffect(() => {
    const d = datasetQ.data;
    if (!d) return;
    const key = d.preview_key ?? d.raw_key;
    if (!key) return;

    presignM.mutate(
      { key },
      {
        onSuccess: (res) => setImageUrl(res.get_url),
        onError: (e: any) => toast.error(e?.message ?? "Failed to load image url"),
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetQ.data?.preview_key, datasetQ.data?.raw_key]);

  const selected = useMemo(() => boxes.find((b) => b.id === selectedId) ?? null, [boxes, selectedId]);

  function onNumericChange(field: "x" | "y" | "w" | "h", value: string) {
    if (!selected) return;
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    updateBox(selected.id, { [field]: num } as any);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/datasets/${datasetId}`)}>
              Back to dataset
            </Button>
            <h1 className="text-xl font-semibold">Preview / Edit</h1>
          </div>
          <p className="text-sm text-muted-foreground">Drag boxes, resize, pan (hold Space), zoom (Ctrl+wheel).</p>
        </div>
        <Badge variant="secondary">{datasetQ.data?.status ?? "..."}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-lg border overflow-hidden bg-muted/20">
          <StageCanvas imageUrl={imageUrl} boxes={boxes} selectedId={selectedId} onSelect={select} onChangeBox={updateBox} />
        </div>

        <div className="rounded-lg border p-3 space-y-3">
          <Tabs defaultValue="boxes">
            <TabsList className="w-full">
              <TabsTrigger value="boxes" className="flex-1">Boxes</TabsTrigger>
              <TabsTrigger value="qc" className="flex-1">QC</TabsTrigger>
              <TabsTrigger value="caption" className="flex-1">Caption</TabsTrigger>
            </TabsList>

            <TabsContent value="boxes" className="space-y-3">
              {!selected ? (
                <div className="text-sm text-muted-foreground">Select a box to edit numeric values.</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>X</Label>
                      <Input value={String(selected.x)} onChange={(e) => onNumericChange("x", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Y</Label>
                      <Input value={String(selected.y)} onChange={(e) => onNumericChange("y", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>W</Label>
                      <Input value={String(selected.w)} onChange={(e) => onNumericChange("w", e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>H</Label>
                      <Input value={String(selected.h)} onChange={(e) => onNumericChange("h", e.target.value)} />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Tip: use Transformer handles on canvas for resizing.</div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    addBox();
                  }}
                >
                  Add box
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    deleteSelected();
                  }}
                  disabled={!selectedId}
                >
                  Delete
                </Button>
              </div>

              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">All boxes</div>
                <div className="max-h-48 overflow-auto space-y-1">
                  {boxes.map((b) => (
                    <button
                      key={b.id}
                      className={"w-full text-left text-sm rounded px-2 py-1 hover:bg-muted " + (b.id === selectedId ? "bg-muted" : "")}
                      onClick={() => select(b.id)}
                    >
                      {b.id.slice(0, 8)} — ({Math.round(b.w)}×{Math.round(b.h)})
                    </button>
                  ))}
                  {boxes.length === 0 ? <div className="text-sm text-muted-foreground">No boxes yet.</div> : null}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qc" className="space-y-3">
              {!selected ? (
                <div className="text-sm text-muted-foreground">Select a box to see QC warnings.</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Warnings</div>
                  <div className="space-y-1">
                    {(selected.qc_warnings ?? []).length ? (
                      selected.qc_warnings!.map((w) => (
                        <div key={w} className="text-sm rounded bg-muted px-2 py-1">{w}</div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No warnings.</div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!selected.ignore_warning}
                      onChange={() => toggleIgnoreWarning(selected.id)}
                    />
                    Ignore warning
                  </label>
                </div>
              )}
            </TabsContent>

            <TabsContent value="caption" className="space-y-3">
              {!selected ? (
                <div className="text-sm text-muted-foreground">Select a box to override caption.</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Caption override</div>
                  <Input
                    value={selected.caption ?? ""}
                    onChange={(e) => setSelectedCaption(selected.id, e.target.value)}
                    placeholder="e.g. red hair, sword, side view"
                  />
                  <div className="text-xs text-muted-foreground">
                    This caption will be included in finalize payload.
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
