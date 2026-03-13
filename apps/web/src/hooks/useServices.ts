import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/lib/api/services';

export const SERVICES_QUERY_KEY = 'services';

export function useServices(filter?: string) {
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, filter],
    queryFn: () => servicesApi.findAll(filter),
  });
}

export function useService(id: string | null) {
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, id],
    queryFn: () => servicesApi.findOne(id!),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      servicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
    },
  });
}

export function useActiveServices() {
  return useQuery({
    queryKey: [SERVICES_QUERY_KEY, 'active'],
    queryFn: () => servicesApi.findActive(),
  });
}
