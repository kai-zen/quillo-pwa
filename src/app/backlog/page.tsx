"use client";

import { NextPage } from "next";

const BacklogPage: NextPage = () => {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Backlog
      </h1>
      <p className="mt-2 text-sm text-muted">
        Unscheduled tasks will live here.
      </p>
    </div>
  );
};

export default BacklogPage;
