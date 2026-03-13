import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '@/lib/api/quotations';

export const QUOTATIONS_QUERY_KEY = 'quotations';

export function useQuotations(filter?: string) {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, filter],
    queryFn: () => quotationsApi.findAll(filter),
  });
}

export function useQuotation(id: string | null) {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, id],
    queryFn: () => quotationsApi.findOne(id!),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => quotationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      quotationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
    },
  });
}

export function useUpdateQuotationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'sent' | 'approved' | 'rejected' }) =>
      quotationsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY, variables.id] });
    },
  });
}
