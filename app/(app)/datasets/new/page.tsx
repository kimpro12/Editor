"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDatasetMutation } from "@/hooks/useCreateDatasetMutation";

const DraftKey = "dataset_new_draft";

const Schema = z.object({
  name: z.string().min(2, "Name too short"),
  asset_type: z.string().min(2, "Asset type required"),
  token: z.string().optional()
});

const AssetTypes = [
  "sprite_sheet_character_fullbody_side",
  "sprite_sheet_item_icon",
  "sprite_sheet_environment_tile",
] as const;

export default function NewDatasetPage() {
  const router = useRouter();
  const m = useCreateDatasetMutation();

  const initial = useMemo(() => {
    if (typeof window === "undefined") return { name: "", asset_type: AssetTypes[0], token: "" };
    try {
      const raw = localStorage.getItem(DraftKey);
      if (!raw) return { name: "", asset_type: AssetTypes[0], token: "" };
      const parsed = JSON.parse(raw);
      return {
        name: typeof parsed?.name === "string" ? parsed.name : "",
        asset_type: typeof parsed?.asset_type === "string" ? parsed.asset_type : AssetTypes[0],
        token: typeof parsed?.token === "string" ? parsed.token : ""
      };
    } catch {
      return { name: "", asset_type: AssetTypes[0], token: "" };
    }
  }, []);

  const [name, setName] = useState(initial.name);
  const [assetType, setAssetType] = useState(initial.asset_type);
  const [token, setToken] = useState(initial.token);
  const [errors, setErrors] = useState<{ name?: string; asset_type?: string }>({});

  function persistDraft(next: { name: string; asset_type: string; token: string }) {
    try {
      localStorage.setItem(DraftKey, JSON.stringify(next));
    } catch {}
  }

  async function onSubmit() {
    const draft = { name, asset_type: assetType, token };
    persistDraft(draft);

    const parsed = Schema.safeParse(draft);
    if (!parsed.success) {
      const nextErr: any = {};
      for (const issue of parsed.error.issues) nextErr[issue.path[0]] = issue.message;
      setErrors(nextErr);
      return;
    }

    try {
      const created = await m.mutateAsync(parsed.data);
      localStorage.removeItem(DraftKey);
      toast.success("Dataset created");
      router.push(`/datasets/${created.id}/upload`);
    } catch (e: any) {
      toast.error(e?.message ?? "Create failed");
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">New Dataset</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dataset name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                persistDraft({ name: e.target.value, asset_type: assetType, token });
              }}
              placeholder="e.g. NPC sprites v1"
            />
            {errors.name ? <p className="text-sm text-red-500">{errors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Asset type</Label>
            <select
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={assetType}
              onChange={(e) => {
                setAssetType(e.target.value);
                persistDraft({ name, asset_type: e.target.value, token });
              }}
            >
              {AssetTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.asset_type ? <p className="text-sm text-red-500">{errors.asset_type}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Token (optional)</Label>
            <Input
              id="token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                persistDraft({ name, asset_type: assetType, token: e.target.value });
              }}
              placeholder="project token"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={m.isPending}>
              {m.isPending ? "Creating..." : "Create dataset"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
