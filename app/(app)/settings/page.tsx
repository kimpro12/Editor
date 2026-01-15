"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getApiBaseOverride, setApiBaseOverride } from "@/lib/api/baseUrl";
import { useHealthQuery } from "@/hooks/useHealthQuery";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function SettingsPage() {
  const user = useCurrentUser();
  const [base, setBase] = useState("");
  const healthQ = useHealthQuery();

  useEffect(() => {
    setBase(getApiBaseOverride() ?? "");
  }, []);

  function save() {
    setApiBaseOverride(base || null);
    toast.success("Saved. Reload pages to use new API base.");
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          Signed in as: <b>{user.label}</b>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingestion API base</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Override base URL (optional)</Label>
            <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="e.g. http://localhost:8000 (leave blank for /api/ingestion)" />
            <div className="text-xs text-muted-foreground">
              Blank = use built-in BFF mocks at <code>/api/ingestion</code>.
            </div>
          </div>
          <Button onClick={save}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Healthcheck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={() => healthQ.refetch()} disabled={healthQ.isFetching}>
            {healthQ.isFetching ? "Checking..." : "Check /v1/health"}
          </Button>
          {healthQ.data ? (
            <div className="text-sm">Response: <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(healthQ.data, null, 2)}</pre></div>
          ) : null}
          {healthQ.error ? <div className="text-sm text-red-500">{String(healthQ.error)}</div> : null}

          <div className="text-xs text-muted-foreground">
            If you later use real R2/S3 presigned URLs in the browser, make sure bucket CORS allows your app origin and methods PUT/GET/HEAD.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
