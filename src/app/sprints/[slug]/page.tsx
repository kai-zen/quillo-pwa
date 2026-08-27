import { SprintDetail } from "@/components/sprints";

interface Props {
  params: Promise<{ slug: string }>;
}

const SprintDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  return <SprintDetail sprintId={slug} />;
};

export default SprintDetailPage;
