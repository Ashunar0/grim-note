import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import { ApiClientError, ApiSuccess } from "@/types/api";
import { Post } from "@/types/posts";

export type TimelineTab = "recent" | "following";

async function fetchTimeline(tab: TimelineTab) {
  const response = await apiClient.get<ApiSuccess<Post[]>>("/posts", {
    params: tab === "following" ? { tab: "following" } : undefined,
  });

  return response.data;
}

export function useTimelinePosts(tab: TimelineTab, enabled = true) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Post[], ApiClientError>(enabled ? ["timeline", tab] : null, () => fetchTimeline(tab), {
    revalidateOnFocus: false,
  });

  return {
    posts: data ?? [],
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
