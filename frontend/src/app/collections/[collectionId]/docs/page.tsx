"use client";

import { useParams } from "next/navigation";
import { ApiDocViewer } from "@/features/docs/components/api-doc-viewer";

export default function CollectionDocsPage() {
  const params = useParams();
  const collectionId = params.collectionId as string;

  return <ApiDocViewer collectionId={collectionId} />;
}
