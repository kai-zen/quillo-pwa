"use client";

import { FC } from "react";
import NotesList from "./NotesList";
import { useNotesListView } from "./hooks/useNotesListView";

const NotesView: FC = () => {
  const view = useNotesListView();
  return <NotesList view={view} />;
};

export default NotesView;
