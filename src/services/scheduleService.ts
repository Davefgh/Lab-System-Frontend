import { apiService } from './api'

export interface ScheduleFormData {
  laboratory_id: string
  teacher_id: string
  subject_id: string
  section: string
  start_time: string
  end_time: string
  status: 'active' | 'inactive' | null
}

export interface ScheduleApiResponse {
  message: string
  data: any
}

export const scheduleService = {
  // CREATE NEW SCHEDULE
  createSchedule: async (scheduleData: ScheduleFormData) => {
    return apiService.post<ScheduleApiResponse>('/schedules', scheduleData)
  },

  // GET ALL SCHEDULES
  getSchedules: async () => {
    return apiService.get<ScheduleApiResponse>('/schedules')
  },

  // UPDATE SCHEDULE
  updateSchedule: async (id: string, scheduleData: Partial<ScheduleFormData>) => {
    return apiService.put<ScheduleApiResponse>(`/schedules/${id}`, scheduleData)
  },

  // DELETE SCHEDULE
  deleteSchedule: async (id: string) => {
    return apiService.delete<ScheduleApiResponse>(`/schedules/${id}`)
  },
}
