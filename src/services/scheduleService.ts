import api from '@/boot/axios'

export interface ScheduleFormData {
  laboratory_id: string
  teacher_id: string
  subject_id: string
  section: string
  start_time: string
  end_time: string
  status?: string
}

export interface ScheduleApiResponse {
  message: string
  data: any
}

export const scheduleService = {
  // CREATE NEW SCHEDULE
  createSchedule: async (scheduleData: ScheduleFormData) => {
    return api.post<ScheduleApiResponse>('/schedules', scheduleData)
  },

  // GET ALL SCHEDULES
  getSchedules: async () => {
    return api.get<ScheduleApiResponse>('/schedules')
  },

  // UPDATE SCHEDULE
  updateSchedule: async (id: string, scheduleData: Partial<ScheduleFormData>) => {
    return api.put<ScheduleApiResponse>(`/schedules/${id}`, scheduleData)
  },

  // DELETE SCHEDULE
  deleteSchedule: async (id: string) => {
    return api.delete<ScheduleApiResponse>(`/schedules/${id}`)
  },
}
