import { NextRequest, NextResponse } from "next/server";
import { saveWatchMetadata } from "@/lib/watch-storage";
import type { WatchMetadata } from "@/lib/watch-metadata";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WatchMetadata;
    if (
      body.watchId === undefined ||
      !body.brand ||
      !body.model ||
      !body.image
    ) {
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    const savedPath = await saveWatchMetadata({
      ...body,
      registeredAt: body.registeredAt ?? new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, path: savedPath });
  } catch (error) {
    console.error("Metadata save failed:", error);
    return NextResponse.json({ error: "Failed to save metadata" }, { status: 500 });
  }
}
