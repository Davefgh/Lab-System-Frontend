import { apiService } from './api'

export interface TeacherFormData {
  firstname: string
  lastname: string
  email: string
  subject: string
  user_id?: string
}

export interface TeacherApiResponse {
  message: string
  data: any
}

export const teacherService = {
  // GET ALL TEACHERS
  getTeachers: async (page = 1, limit = 100) => {
    return apiService.get(`/teachers?page=${page}&limit=${limit}`)
  },

  // GET SINGLE TEACHER BY ID
  getTeacherById: async (id: string) => {
    return apiService.get(`/teachers/${id}`)
  },

  // CREATE NEW TEACHER
  createTeacher: async (teacherData: TeacherFormData) => {
    return apiService.post<TeacherApiResponse>('/teachers', teacherData)
  },

  // UPDATE TEACHER
  updateTeacher: async (id: string, teacherData: Partial<TeacherFormData>) => {
    return apiService.put<TeacherApiResponse>(`/teachers/${id}`, teacherData)
  },

  // DELETE TEACHER
  deleteTeacher: async (id: string) => {
    return apiService.delete<TeacherApiResponse>(`/teachers/${id}`)
  },
}
