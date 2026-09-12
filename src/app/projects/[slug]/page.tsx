import { ProjectDetail } from "@/components/projects";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetail projectId={slug} />;
}
