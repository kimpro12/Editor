export default function AboutPage() {
  return (
    <div className="max-w-2xl space-y-2">
      <h1 className="text-xl font-semibold">About</h1>
      <p className="text-sm text-muted-foreground">
        Ingestion Frontend (mock backend mode). Built with Next.js App Router, React Query, Zustand, and react-konva.
      </p>
      <p className="text-sm text-muted-foreground">
        Use Settings to point to a real backend later.
      </p>
    </div>
  );
}
