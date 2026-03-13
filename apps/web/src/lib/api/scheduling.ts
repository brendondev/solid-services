import api from './client';

export interface ScheduledOrder {
  id: string;
  number: string;
  scheduledFor: string;
  status: string;
  customer: {
    id: string;
    name: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
  }>;
}

export interface AvailabilityCheck {
  available: boolean;
  conflicts?: Array<{
    id: string;
    number: string;
    scheduledFor: string;
    customer: {
      name: string;
    };
  }>;
}

export interface TimeSlot {
  datetime: string;
  available: boolean;
}

export interface SchedulingStats {
  today: number;
  thisWeek: number;
  upcoming: number;
}

export const schedulingApi = {
  getDaySchedule: async (technicianId: string, date: string): Promise<ScheduledOrder[]> => {
    const response = await api.get(`/scheduling/day/${technicianId}?date=${date}`);
    return response.data;
  },

  getWeekSchedule: async (
    technicianId: string,
    startDate: string
  ): Promise<ScheduledOrder[]> => {
    const response = await api.get(`/scheduling/week/${technicianId}?startDate=${startDate}`);
    return response.data;
  },

  checkAvailability: async (
    technicianId: string,
    datetime: string,
    duration?: number,
    excludeOrderId?: string
  ): Promise<AvailabilityCheck> => {
    const params = new URLSearchParams({
      datetime,
      ...(duration && { duration: duration.toString() }),
      ...(excludeOrderId && { excludeOrderId }),
    });

    const response = await api.get(
      `/scheduling/availability/${technicianId}?${params.toString()}`
    );
    return response.data;
  },

  getAvailableSlots: async (
    technicianId: string,
    startDate: string,
    count?: number
  ): Promise<TimeSlot[]> => {
    const params = new URLSearchParams({
      startDate,
      ...(count && { count: count.toString() }),
    });

    const response = await api.get(
      `/scheduling/available-slots/${technicianId}?${params.toString()}`
    );
    return response.data;
  },

  getStats: async (technicianId?: string): Promise<SchedulingStats> => {
    const params = technicianId ? `?technicianId=${technicianId}` : '';
    const response = await api.get(`/scheduling/stats${params}`);
    return response.data;
  },
};
