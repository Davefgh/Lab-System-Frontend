import type { Teacher } from '@/interfaces/interfaces'
// IMPORTS
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '@/boot/axios'
import { teacherService, type TeacherFormData } from '@/services/teacherService'

// TEACHER STORE DEFINITION
export const useTeacherStore = defineStore('teachers', () => {
  // REFS & REACTIVE STATE
  // LIST OF ALL TEACHERS
  const teachers = ref<Teacher[]>([

  ])

  // METHODS
  // GET TEACHER BY ID
  const getTeacherById = (id: string) => {
    return teachers.value.find(teacher => teacher.id === id)
  }

  // ADD NEW TEACHER
  const addTeacher = async (teacherData: TeacherFormData) => {
    try {
      await teacherService.createTeacher(teacherData)
      // REFRESH TEACHER LIST AFTER ADDING
      await fetchTeachers()
      return { success: true }
    }
    catch (error) {
      console.error('Error adding teacher:', error)
      return { success: false, error }
    }
  }

  // UPDATE TEACHER DATA
  const updateTeacher = async (id: string, updates: Partial<TeacherFormData>) => {
    try {
      await teacherService.updateTeacher(id, updates)
      // REFRESH TEACHER LIST AFTER UPDATING
      await fetchTeachers()
      return { success: true }
    }
    catch (error) {
      console.error('Error updating teacher:', error)
      return { success: false, error }
    }
  }

  // REMOVE TEACHER BY ID
  const removeTeacher = async (id: string) => {
    try {
      await teacherService.deleteTeacher(id)
      // REFRESH TEACHER LIST AFTER DELETION
      await fetchTeachers()
      return { success: true }
    }
    catch (error) {
      console.error('Error removing teacher:', error)
      return { success: false, error }
    }
  }

  // GET TEACHERS BY ROOM
  const getTeachersByRoom = (room: string) => {
    // NOTE: assignedRooms is a number (count), not an array
    // This method needs to be updated based on actual room assignment data structure
    console.warn('getTeachersByRoom: assignedRooms is a count, not an array of room names')
    return []
  }

  // GET TEACHERS BY SUBJECT
  const getTeachersBySubject = (subject: string) => {
    return teachers.value.filter(teacher => teacher.subject === subject)
  }

  // ASSIGN ROOM TO TEACHER
  const assignRoomToTeacher = (teacherId: string, room: string) => {
    // NOTE: assignedRooms is a number (count), not an array
    // This method needs API integration for actual room assignment
    console.warn('assignRoomToTeacher: Needs API implementation')
    const teacher = getTeacherById(teacherId)
    if (teacher) {
      teacher.assignedRooms += 1
    }
  }

  // UNASSIGN ROOM FROM TEACHER
  const unassignRoomFromTeacher = (teacherId: string, room: string) => {
    // NOTE: assignedRooms is a number (count), not an array
    // This method needs API integration for actual room unassignment
    console.warn('unassignRoomFromTeacher: Needs API implementation')
    const teacher = getTeacherById(teacherId)
    if (teacher && teacher.assignedRooms > 0) {
      teacher.assignedRooms -= 1
    }
  }

  // SEARCH TEACHERS BY NAME, EMAIL, OR SUBJECT
  const searchTeachers = (query: string) => {
    const searchTerm = query.toLowerCase()
    return teachers.value.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm)
      || teacher.email.toLowerCase().includes(searchTerm)
      || teacher.subject.toLowerCase().includes(searchTerm),
    )
  }

  // FETCH TEACHERS FROM API
  const fetchTeachers = async () => {
    try {
      const teacherRes = await api.get('/teachers')
      const userRes = await api.get('/users')

      const teacherList: any[] = teacherRes.data?.data || []
      const userList: any[] = userRes.data?.data || []

      const userMap = new Map(userList.map(u => [u.id, u.email?.trim() ?? 'No email']))

      teachers.value = teacherList.map(t => ({
        id: t.id,
        name: `${t.firstname ?? ''} ${t.lastname ?? ''}`.trim() || 'No name',
        email: userMap.get(t.user_id) ?? 'No email',
        subject: t.subject ?? 'No subject',
        assignedRooms: t.assignedRooms ?? 'No rooms assigned',
        upcomingSchedules: t.upcomingSchedules ?? 0,
        avatar: t.avatar || undefined,
      }))
    }
    catch (error) {
      console.error('Error fetching teachers:', error)
    }
  }

  // COMPUTED PROPERTIES
  // TOTAL COUNT OF ALL TEACHERS
  const totalTeachers = computed(() => teachers.value.length)

  // COUNT TEACHERS GROUPED BY SUBJECT
  const teachersBySubject = computed(() => {
    const subjectCounts: Record<string, number> = {}
    teachers.value.forEach((teacher) => {
      subjectCounts[teacher.subject] = (subjectCounts[teacher.subject] || 0) + 1
    })
    return subjectCounts
  })

  // TOTAL COUNT OF ALL UPCOMING SCHEDULES
  const totalUpcomingSchedules = computed(() =>
    teachers.value.reduce((total, teacher) => total + teacher.upcomingSchedules, 0),
  )

  return {
    teachers,
    totalTeachers,
    teachersBySubject,
    totalUpcomingSchedules,
    getTeacherById,
    addTeacher,
    updateTeacher,
    removeTeacher,
    getTeachersByRoom,
    getTeachersBySubject,
    assignRoomToTeacher,
    unassignRoomFromTeacher,
    searchTeachers,
    fetchTeachers,
  }
})
