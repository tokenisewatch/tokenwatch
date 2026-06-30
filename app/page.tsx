import { Suspense } from "react";
import { HomeContent } from "@/components/HomeContent";

export default function Home() {
  return (
    <Suspense
      fallback={
        <p className="py-12 text-center text-zinc-500">Loading watches...</p>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
