import { defineStore } from 'pinia'
import { ref } from 'vue'
import { subjectService, type Subject } from '@/services/subjectService'

export const useSubjectStore = defineStore('subjects', () => {
  // STATE
  const subjects = ref<Subject[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ACTIONS
  // FETCH ALL SUBJECTS
  const fetchSubjects = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subjectService.getSubjects()
      if (Array.isArray(response.data)) {
        subjects.value = response.data
      } else if (response.data && typeof response.data === 'object') {
        // Handle case where data might be wrapped in another property
        subjects.value = [response.data] as Subject[]
      }
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch subjects'
      console.error('Error fetching subjects:', err)
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  // ADD NEW SUBJECT
  const addSubject = async (subjectData: { subject_code: string; subject_name: string }) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subjectService.createSubject(subjectData)
      // Add the new subject to the list
      if (response.data && !Array.isArray(response.data)) {
        subjects.value.push(response.data)
      }
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.message || 'Failed to add subject'
      console.error('Error adding subject:', err)
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  // UPDATE SUBJECT
  const updateSubject = async (id: string, subjectData: Partial<{ subject_code: string; subject_name: string }>) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await subjectService.updateSubject(id, subjectData)
      // Update the subject in the list
      const index = subjects.value.findIndex(s => s.id === id)
      if (index !== -1 && response.data && !Array.isArray(response.data)) {
        subjects.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (err: any) {
      error.value = err.message || 'Failed to update subject'
      console.error('Error updating subject:', err)
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  // DELETE SUBJECT
  const removeSubject = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await subjectService.deleteSubject(id)
      // Remove the subject from the list
      subjects.value = subjects.value.filter(s => s.id !== id)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete subject'
      console.error('Error deleting subject:', err)
      return { success: false, error: err }
    } finally {
      isLoading.value = false
    }
  }

  return {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    addSubject,
    updateSubject,
    removeSubject,
  }
})
