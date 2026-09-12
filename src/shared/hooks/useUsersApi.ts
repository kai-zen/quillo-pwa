"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request, usersModule } from "@/shared/endpoints";
import type { DeleteUserDataBody, UserDataDeleteType } from "@/shared/types";
import { queryKeys } from "./keys";

const DATA_TYPE_QUERY_KEYS: Record<
  UserDataDeleteType,
  readonly string[]
> = {
  daily_tasks: queryKeys.tasks.all,
  daily_notes: queryKeys.notes.all,
  progress_inputs: queryKeys.progressInputs.all,
  daily_reviews: queryKeys.dailyReviews.all,
};

export const useUsersApi = () => {
  const queryClient = useQueryClient();

  const deleteMyDataMutation = useMutation({
    mutationFn: (body: DeleteUserDataBody) =>
      request(usersModule.deleteMyData, { body }),
    onSuccess: (_data, body) => {
      for (const type of body.types) {
        void queryClient.invalidateQueries({
          queryKey: DATA_TYPE_QUERY_KEYS[type],
        });
      }
    },
  });

  return {
    deleteMyData: deleteMyDataMutation.mutateAsync,
    isDeletingData: deleteMyDataMutation.isPending,
  };
};
