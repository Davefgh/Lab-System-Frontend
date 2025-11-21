import { apiService } from './api'

export interface Subject {
  id: string
  subject_code: string
  subject_name: string
  created_at?: string
  updated_at?: string
}

export interface SubjectFormData {
  subject_code: string
  subject_name: string
}

export interface SubjectApiResponse {
  message: string
  data: Subject | Subject[]
}

export const subjectService = {
  // GET ALL SUBJECTS
  getSubjects: async () => {
    return apiService.get<SubjectApiResponse>('/subjects')
  },

  // CREATE NEW SUBJECT
  createSubject: async (subjectData: SubjectFormData) => {
    return apiService.post<SubjectApiResponse>('/subjects', subjectData)
  },

  // UPDATE SUBJECT
  updateSubject: async (id: string, subjectData: Partial<SubjectFormData>) => {
    return apiService.put<SubjectApiResponse>(`/subjects/${id}`, subjectData)
  },

  // DELETE SUBJECT
  deleteSubject: async (id: string) => {
    return apiService.delete<SubjectApiResponse>(`/subjects/${id}`)
  },
}
