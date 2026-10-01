import { WorkspaceWorkbench } from "@/features/workspace/components/workspace-workbench";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceDetailPage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  return <WorkspaceWorkbench workspaceId={workspaceId} />;
}
