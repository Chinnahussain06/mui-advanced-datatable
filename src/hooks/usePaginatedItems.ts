import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRowsPerPage } from "../backend/LocalStorage";
import { useEffect, useState } from "react";

interface PaginatedItemsProps {
  key: string;
  fetchCb: (
    index: number,
    limit: number,
    key?: any
  ) => Promise<{ data: any; nextKey: string | number | null }>;
  enabled?: boolean;
}

export const usePaginatedItems = ({ key, fetchCb, enabled = true }: PaginatedItemsProps) => {
  const queryClient = useQueryClient();
  const [pageKeys, setPageKeys] = useState<(string | number | null)[]>([null]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: getRowsPerPage(),
  });

  const currentKey = pageKeys[pagination.pageIndex];

  const { data, isLoading, error, refetch, isError, isFetching } = useQuery({
    queryKey: [key, currentKey, pagination.pageIndex, pagination.pageSize],
    queryFn: () => fetchCb(pagination.pageIndex, pagination.pageSize, currentKey),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    enabled: enabled,
  });

  useEffect(() => {
    setPageKeys([null]);
  }, [pagination.pageSize]);

  useEffect(() => {
    if (data?.nextKey) {
      setPageKeys((prevKeys) => {
        // Prevent duplicate keys
        if (prevKeys.includes(data.nextKey)) return prevKeys;
        return [...prevKeys, data.nextKey];
      });
    }
  }, [data?.nextKey]);

  const reset = () => {
    setPageKeys([null]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    queryClient.resetQueries({ queryKey: [key] });
    refetch();
  };

  useEffect(() => {
    setPageKeys([null]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    data: data?.data || [],
    isFetching,
    isLoading,
    isError,
    error,
    currentPageIndex: pagination.pageIndex,
    pagination,
    setPagination,
    hasNextPage: !!data?.nextKey,
    refetch,
    totalItems: -1, // To be loaded dynamically if server reports it
    reset,
  };
};

export default usePaginatedItems;
