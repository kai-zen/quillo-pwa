"use client";

import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Tasks
      </h1>
      <p className="mt-2 text-sm text-muted">
        Your board will live here.
      </p>
    </div>
  );
};

export default Home;
