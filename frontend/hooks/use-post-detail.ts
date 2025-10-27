import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { ApiClientError, ApiSuccess } from "@/types/api";
import { Post } from "@/types/posts";

async function fetchPost(id: string) {
  const response = await apiClient.get<ApiSuccess<Post>>(`/posts/${id}`);
  return response.data;
}

export function usePostDetail(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Post, ApiClientError>(
    ["post", id],
    () => fetchPost(id),
    { revalidateOnFocus: false },
  );

  return {
    post: data ?? null,
    error,
    isLoading,
    mutate,
  };
}
