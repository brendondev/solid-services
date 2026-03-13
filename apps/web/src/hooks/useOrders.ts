import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';

export const ORDERS_QUERY_KEY = 'orders';

export function useOrders(filter?: string) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, filter],
    queryFn: () => ordersApi.findAll(filter),
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: [ORDERS_QUERY_KEY, id],
    queryFn: () => ordersApi.findOne(id!),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    },
  });
}

export function useCreateOrderFromQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quotationId: string) => ordersApi.createFromQuotation(quotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ordersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY, variables.id] });
    },
  });
}

export function useAddTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, event, description }: { orderId: string; event: string; description?: string }) =>
      ordersApi.addTimelineEvent(orderId, event, description),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY, variables.orderId] });
    },
  });
}

export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, checklistId }: { orderId: string; checklistId: string }) =>
      ordersApi.completeChecklistItem(orderId, checklistId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY, variables.orderId] });
    },
  });
}

export function useUncompleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, checklistId }: { orderId: string; checklistId: string }) =>
      ordersApi.uncompleteChecklistItem(orderId, checklistId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY, variables.orderId] });
    },
  });
}
