import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financialApi } from '@/lib/api/financial';

export const RECEIVABLES_QUERY_KEY = 'receivables';
export const FINANCIAL_DASHBOARD_QUERY_KEY = 'financial-dashboard';

export function useReceivables(filter?: string) {
  return useQuery({
    queryKey: [RECEIVABLES_QUERY_KEY, filter],
    queryFn: () => financialApi.findAllReceivables(filter),
  });
}

export function useReceivable(id: string | null) {
  return useQuery({
    queryKey: [RECEIVABLES_QUERY_KEY, id],
    queryFn: () => financialApi.findOneReceivable(id!),
    enabled: !!id,
  });
}

export function useCreateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => financialApi.createReceivable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIVABLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_DASHBOARD_QUERY_KEY] });
    },
  });
}

export function useUpdateReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financialApi.updateReceivable(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [RECEIVABLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECEIVABLES_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_DASHBOARD_QUERY_KEY] });
    },
  });
}

export function useDeleteReceivable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financialApi.removeReceivable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIVABLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_DASHBOARD_QUERY_KEY] });
    },
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ receivableId, data }: { receivableId: string; data: any }) =>
      financialApi.registerPayment(receivableId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [RECEIVABLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [RECEIVABLES_QUERY_KEY, variables.receivableId] });
      queryClient.invalidateQueries({ queryKey: [FINANCIAL_DASHBOARD_QUERY_KEY] });
    },
  });
}

export function useFinancialDashboard() {
  return useQuery({
    queryKey: [FINANCIAL_DASHBOARD_QUERY_KEY],
    queryFn: () => financialApi.getDashboard(),
  });
}
