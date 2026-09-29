import { SprintDetail } from "@/components/sprints";
import { FC } from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

const SprintDetailPage: FC<Props> = async ({ params }) => {
  const { slug } = await params;
  return <SprintDetail sprintId={slug} />;
};

export default SprintDetailPage;
