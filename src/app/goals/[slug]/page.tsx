import { GoalDetail } from "@/components/goals";

interface Props {
  params: Promise<{ slug: string }>;
}

const GoalDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  return <GoalDetail goalId={slug} />;
};

export default GoalDetailPage;
