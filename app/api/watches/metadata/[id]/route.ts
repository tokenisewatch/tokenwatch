import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { metadataFilePath } from "@/lib/watch-storage";
import type { WatchMetadata } from "@/lib/watch-metadata";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePath = metadataFilePath(id);
    const raw = await readFile(filePath, "utf-8");
    const metadata = JSON.parse(raw) as WatchMetadata;
    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";

    return NextResponse.json({
      name: `${metadata.brand} ${metadata.model}`,
      description: metadata.description,
      image: metadata.image.startsWith("http")
        ? metadata.image
        : `${base}${metadata.image}`,
      attributes: [
        { trait_type: "Brand", value: metadata.brand },
        { trait_type: "Model", value: metadata.model },
        { trait_type: "Year", value: metadata.year },
        { trait_type: "Purchase Price (ETH)", value: metadata.purchasePriceEth },
        { trait_type: "Total Shares", value: metadata.totalShares },
      ],
    });
  } catch {
    return NextResponse.json({ error: "Metadata not found" }, { status: 404 });
  }
}
