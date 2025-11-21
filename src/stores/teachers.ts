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
    // CREATE TEACHER OBJECT FOR LOCAL ARRAY
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      name: `${teacherData.firstname} ${teacherData.lastname}`.trim(),
      email: teacherData.email,
      subject: teacherData.subject,
      assignedRooms: 0,
      upcomingSchedules: 0,
    }
    
    try {
      console.log('Sending teacher data to API:', teacherData)
      const response = await teacherService.createTeacher(teacherData)
      console.log('API Response:', response)
      
      // UPDATE ID FROM API RESPONSE IF AVAILABLE
      if (response.data?.id) {
        newTeacher.id = response.data.id.toString()
      }
    }
    catch (error: any) {
      console.warn('API call failed, but teacher will be added locally:', error)
    }
    
    // ADD TEACHER TO LOCAL ARRAY (REGARDLESS OF API SUCCESS)
    teachers.value.push(newTeacher)
    console.log('Teacher added to local array:', newTeacher)
    
    return { success: true }
  }

  // UPDATE TEACHER DATA
  const updateTeacher = async (id: string, updates: Partial<TeacherFormData>) => {
    try {
      await teacherService.updateTeacher(id, updates)
    }
    catch (error) {
      console.warn('API call failed, but teacher will be updated locally:', error)
    }
    
    // UPDATE TEACHER IN LOCAL ARRAY (REGARDLESS OF API SUCCESS)
    const index = teachers.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const teacher = teachers.value[index]
      if (updates.firstname || updates.lastname) {
        teacher.name = `${updates.firstname || teacher.name.split(' ')[0]} ${updates.lastname || teacher.name.split(' ').slice(1).join(' ')}`.trim()
      }
      if (updates.email) teacher.email = updates.email
      if (updates.subject) teacher.subject = updates.subject
      
      console.log('Teacher updated in local array:', teacher)
    }
    
    return { success: true }
  }

  // REMOVE TEACHER BY ID
  const removeTeacher = async (id: string) => {
    try {
      await teacherService.deleteTeacher(id)
    }
    catch (error) {
      console.warn('API call failed, but teacher will be removed locally:', error)
    }
    
    // REMOVE TEACHER FROM LOCAL ARRAY (REGARDLESS OF API SUCCESS)
    const index = teachers.value.findIndex(t => t.id === id)
    if (index !== -1) {
      teachers.value.splice(index, 1)
      console.log('Teacher removed from local array')
    }
    
    return { success: true }
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
      console.log('Fetching teachers...')
      const teacherRes = await api.get('/teachers')
      const userRes = await api.get('/users')

      console.log('Teacher Response:', teacherRes.data)
      console.log('User Response:', userRes.data)

      const teacherList: any[] = teacherRes.data?.data || []
      const userList: any[] = userRes.data?.data || []

      console.log('Teacher List:', teacherList)
      console.log('User List:', userList)

      const userMap = new Map(userList.map(u => [u.id, u.email?.trim() ?? 'No email']))

      teachers.value = teacherList.map(t => {
        const mappedTeacher = {
          id: t.id?.toString() || '',
          name: `${t.firstname ?? ''} ${t.lastname ?? ''}`.trim() || 'No name',
          email: userMap.get(t.user_id) ?? 'No email',
          subject: t.subject ?? 'No subject',
          assignedRooms: t.assignedRooms ?? 'No rooms assigned',
          upcomingSchedules: t.upcomingSchedules ?? 0,
          avatar: t.avatar || undefined,
        }
        console.log('Mapped teacher:', mappedTeacher)
        return mappedTeacher
      })

      console.log('Final teachers array:', teachers.value)
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
