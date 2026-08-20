"use client";

import { NextPage } from "next";
import { use } from "react";
import { SprintDetail } from "@/components/sprints";

interface Props {
  params: Promise<{ slug: string }>;
}

const SprintDetailPage: NextPage<Props> = ({ params }) => {
  const { slug } = use(params);
  return <SprintDetail sprintId={slug} />;
};

export default SprintDetailPage;
