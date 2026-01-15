"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function DashboardPage() {
  const user = useCurrentUser();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Signed in as: <b>{user.label}</b>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/datasets">Go to Datasets</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings">Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
