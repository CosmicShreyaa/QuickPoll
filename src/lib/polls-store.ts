import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, type ApiOption, type ApiPoll } from "./api-client";

export type Option = ApiOption;
export type Poll = ApiPoll;

const POLLS_KEY = ["polls"] as const;

// Polls are stored in MongoDB now; short polling keeps the UI feeling live
// without the complexity of a websocket/SSE channel.
const LIVE_REFETCH_MS = 4000;

export function usePolls() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: POLLS_KEY,
    queryFn: api.listPolls,
    refetchInterval: LIVE_REFETCH_MS,
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      api.vote(pollId, optionId),
    onSuccess: (updated) => {
      queryClient.setQueryData<ApiPoll[]>(POLLS_KEY, (old) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: ({ question, options }: { question: string; options: string[] }) =>
      api.createPoll(question, options),
    onSuccess: (created) => {
      queryClient.setQueryData<ApiPoll[]>(POLLS_KEY, (old) =>
        old ? [created, ...old] : [created],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deletePoll(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<ApiPoll[]>(POLLS_KEY, (old) =>
        old ? old.filter((p) => p.id !== id) : old,
      );
    },
  });

  return {
    polls: query.data ?? [],
    isLoading: query.isLoading,
    vote: (pollId: string, optionId: string) => {
      voteMutation.mutate({ pollId, optionId });
    },
    createPoll: (question: string, options: string[]) =>
      createMutation.mutateAsync({ question, options }).then((p) => p.id),
    deletePoll: (id: string) => {
      deleteMutation.mutate(id);
    },
  };
}

export function usePoll(pollId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["poll", pollId],
    queryFn: () => api.getPoll(pollId as string),
    enabled: !!pollId,
    refetchInterval: LIVE_REFETCH_MS,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 404) && failureCount < 3,
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => api.vote(pollId as string, optionId),
    onSuccess: (updated) => {
      queryClient.setQueryData(["poll", pollId], updated);
      queryClient.setQueryData<ApiPoll[]>(POLLS_KEY, (old) =>
        old ? old.map((p) => (p.id === updated.id ? updated : p)) : old,
      );
    },
  });

  return {
    poll: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    vote: (optionId: string) => voteMutation.mutate(optionId),
  };
}
