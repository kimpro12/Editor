"use client";

import Link from "next/link";
import { useDatasetsQuery } from "@/hooks/useDatasetsQuery";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";

export default function DatasetsPage() {
  const q = useDatasetsQuery();

  if (q.isLoading) return <LoadingSkeleton title="Loading datasets..." />;
  if (q.error) return <ErrorState title="Failed to load datasets" error={q.error} />;

  const items = q.data?.items ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Datasets</h1>
        <Button asChild>
          <Link href="/datasets/new">New Dataset</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No datasets yet"
          description="Create a dataset to start uploading a sprite sheet."
          action={<Button asChild><Link href="/datasets/new">Create dataset</Link></Button>}
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Asset type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    <Link className="underline underline-offset-4" href={`/datasets/${d.id}`}>{d.name}</Link>
                  </TableCell>
                  <TableCell>{d.asset_type}</TableCell>
                  <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(d.updated_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
