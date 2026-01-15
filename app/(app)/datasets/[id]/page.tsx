"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { useDatasetQuery } from "@/hooks/useDatasetQuery";

export default function DatasetDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const q = useDatasetQuery(id);

  if (q.isLoading) return <LoadingSkeleton title="Loading dataset..." />;
  if (q.error) return <ErrorState title="Failed to load dataset" error={q.error} />;

  const d = q.data!;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{d.name}</h1>
          <div className="text-sm text-muted-foreground">{d.asset_type}</div>
        </div>
        <Badge variant="secondary">{d.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild><Link href={`/datasets/${id}/upload`}>Upload</Link></Button>
          <Button asChild variant="outline"><Link href={`/datasets/${id}/preview`}>Preview / Edit</Link></Button>
          <Button asChild variant="outline"><Link href={`/datasets/${id}/finalize`}>Finalize</Link></Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keys</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div><span className="text-muted-foreground">raw_key:</span> {d.raw_key ?? "-"}</div>
          <div><span className="text-muted-foreground">preview_key:</span> {d.preview_key ?? "-"}</div>
          <div><span className="text-muted-foreground">export_key:</span> {d.export_key ?? "-"}</div>
          <div><span className="text-muted-foreground">manifest_key:</span> {d.manifest_key ?? "-"}</div>
        </CardContent>
      </Card>
    </div>
  );
}
