export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border p-6 text-center space-y-2">
      <div className="font-semibold">{title}</div>
      {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      {action ? <div className="pt-2 flex justify-center">{action}</div> : null}
    </div>
  );
}
