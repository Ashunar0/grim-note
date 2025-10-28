import useSWR from "swr";
import { apiClient } from "@/lib/api-client";
import type { ApiClientError, ApiSuccess } from "@/types/api";
import type { Profile } from "@/types/profile";

async function fetchProfile(userId: number | string) {
  const response = await apiClient.get<ApiSuccess<Profile>>(
    `/users/${userId}`,
  );
  return response.data;
}

export function useProfile(userId: number | string | null, enabled = true) {
  const shouldFetch = enabled && userId !== null && userId !== undefined;
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Profile, ApiClientError>(
    shouldFetch ? ["profile", userId] : null,
    () => fetchProfile(userId as number | string),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    profile: data ?? null,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
