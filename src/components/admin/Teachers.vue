<script setup lang="ts">
// IMPORTS
import { Plus, User } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import SearchFilterBar from "@/components/global/SearchFilterBar.vue";
import AddEditTeacherModal from "@/components/modals/AddEditTeacherModal.vue";
import ToastNotification from "@/components/global/ToastNotification.vue";
import { useTeacherStore } from "@/stores/teachers";
import type { Teacher } from "@/interfaces/interfaces";

import { useScheduleStore } from "@/stores/schedules";

// CONSTANTS
const todaySchedule = [
	{
		id: "1",
		subject: "Automata",
		room: "SCLAB",
		time: "9:00 AM - 10:30 AM",
		color: "primary",
	},
	{
		id: "2",
		subject: "Data Structure",
		room: "Slab 3",
		time: "11:00 AM - 12:30 PM",
		color: "green",
	},
	{
		id: "3",
		subject: "Data Algorithm",
		room: "Slab 2",
		time: "2:00 PM - 3:30 PM",
		color: "yellow",
	},
];

// REFS & REACTIVE STATE
const searchQuery = ref("");
const showModal = ref(false);
const modalMode = ref<"add" | "edit">("add");
const selectedTeacher = ref<Teacher | null>(null);
const isLoading = ref(false);
const isScheduleLoading = ref(false);

// TOAST NOTIFICATION STATE
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");
const showToast = ref(false);

const newSchedule = ref({
	teacherId: "",
	room: "",
	subject: "",
	section: "",
	date: "",
	startTime: "",
	endTime: "",
});

// STORE INITIALIZATION
const teacherStore = useTeacherStore();
const scheduleStore = useScheduleStore();

// COMPUTED PROPERTIES
const teachers = computed(() => teacherStore.teachers);

//  FETCH TEACHERS ON COMPONENT MOUNT
onMounted(() => {
	teacherStore.fetchTeachers();
});

// FILTER TEACHERS BY SEARCH QUERY
const filteredTeachers = computed(() => {
	if (!searchQuery.value) return teachers.value;

	const query = searchQuery.value.toLowerCase();
	return teachers.value.filter(
		(teacher) =>
			teacher.name.toLowerCase().includes(query) ||
			teacher.email.toLowerCase().includes(query) ||
			teacher.subject.toLowerCase().includes(query)
	);
});

// METHODS
// OPEN MODAL FOR ADDING NEW TEACHER
function openAddModal() {
	modalMode.value = "add";
	selectedTeacher.value = null;
	showModal.value = true;
}

// OPEN MODAL FOR EDITING TEACHER
function editTeacher(teacher: Teacher) {
	modalMode.value = "edit";
	selectedTeacher.value = teacher;
	showModal.value = true;
}

// CLOSE MODAL
function closeModal() {
	showModal.value = false;
	selectedTeacher.value = null;
}

// SHOW TOAST NOTIFICATION
function showNotification(message: string, type: "success" | "error") {
	toastMessage.value = message;
	toastType.value = type;
	showToast.value = true;
}

// CLOSE TOAST NOTIFICATION
function closeToast() {
	showToast.value = false;
}

// SAVE TEACHER (ADD OR EDIT)
async function saveTeacher(teacherData: any) {
	isLoading.value = true;
	try {
		if (modalMode.value === "add") {
			const result = await teacherStore.addTeacher(teacherData);
			if (result.success) {
				showNotification("Teacher added successfully!", "success");
			} else {
				let errorMsg = "Failed to add teacher. Please try again.";
				const err = result.error;
				if (err?.response?.data) {
					const data = err.response.data;
					if (data.message) {
						errorMsg = data.message;
					} else if (data.error) {
						// Handle nested error object (e.g. ZodError)
						if (typeof data.error === "string") {
							errorMsg = data.error;
						} else if (data.error.message) {
							try {
								// Try to parse stringified JSON error array
								const parsed = JSON.parse(data.error.message);
								if (Array.isArray(parsed)) {
									errorMsg = parsed.map((e: any) => e.message).join(", ");
								} else {
									errorMsg = data.error.message;
								}
							} catch {
								errorMsg = data.error.message;
							}
						}
					} else if (data.errors) {
						// Handle validation errors object (e.g., { email: ['Invalid'], password: ['Too short'] })
						const messages = Object.values(data.errors).flat();
						errorMsg = messages.join(", ");
					} else if (typeof data === "string") {
						errorMsg = data;
					} else {
						// Fallback to stringifying data if it's an unknown object
						try {
							errorMsg = JSON.stringify(data);
						} catch (e) {
							errorMsg = err.message || errorMsg;
						}
					}
				} else if (err?.message) {
					errorMsg = err.message;
				}
				showNotification(errorMsg, "error");
			}
		} else if (selectedTeacher.value) {
			const result = await teacherStore.updateTeacher(selectedTeacher.value.id, teacherData);
			if (result.success) {
				showNotification("Teacher updated successfully!", "success");
			} else {
				showNotification("Failed to update teacher. Please try again.", "error");
			}
		}
	} catch (error) {
		console.error("Error saving teacher:", error);
		showNotification("An error occurred. Please try again.", "error");
	} finally {
		isLoading.value = false;
	}
}

// DELETE TEACHER FROM STORE
async function deleteTeacher(teacherId: string) {
	// CONFIRM BEFORE DELETION
	if (confirm("Are you sure you want to delete this teacher?")) {
		isLoading.value = true;
		try {
			const result = await teacherStore.removeTeacher(teacherId);
			if (result.success) {
				showNotification("Teacher deleted successfully!", "success");
			} else {
				showNotification("Failed to delete teacher. Please try again.", "error");
			}
		} catch (error) {
			console.error("Error deleting teacher:", error);
			showNotification("An error occurred. Please try again.", "error");
		} finally {
			isLoading.value = false;
		}
	}
}

// ADD NEW SCHEDULE FOR TEACHER
async function addSchedule() {
	// VALIDATE ALL REQUIRED FIELDS
	if (
		newSchedule.value.teacherId &&
		newSchedule.value.room &&
		newSchedule.value.subject &&
		newSchedule.value.section &&
		newSchedule.value.date &&
		newSchedule.value.startTime &&
		newSchedule.value.endTime
	) {
		isScheduleLoading.value = true;
		try {
			// Format dates as ISO strings (combining date and time)
			// Assuming backend expects ISO string or similar
			const startDateTime = `${newSchedule.value.date}T${newSchedule.value.startTime}:00`;
			const endDateTime = `${newSchedule.value.date}T${newSchedule.value.endTime}:00`;

			const scheduleData = {
				laboratory_id: newSchedule.value.room,
				teacher_id: newSchedule.value.teacherId,
				subject_id: newSchedule.value.subject, // Assuming subject input is the ID/Code
				section: newSchedule.value.section,
				start_time: startDateTime,
				end_time: endDateTime,
				status: "active",
			};

			console.log("Adding Schedule:", scheduleData);
			const result = await scheduleStore.addSchedule(scheduleData);

			if (result.success) {
				showNotification("Schedule added successfully!", "success");
				// RESET FORM FIELDS
				newSchedule.value = {
					teacherId: "",
					room: "",
					subject: "",
					section: "",
					date: "",
					startTime: "",
					endTime: "",
				};
			} else {
				const errorMsg = result.error?.response?.data?.message || "Failed to add schedule.";
				showNotification(errorMsg, "error");
			}
		} catch (error) {
			console.error("Error adding schedule:", error);
			showNotification("An error occurred while adding schedule.", "error");
		} finally {
			isScheduleLoading.value = false;
		}
	} else {
		showNotification("Please fill in all fields.", "error");
	}
}
</script>

<template>
	<div>
		<div class="flex justify-between items-center mb-6">
			<h2 class="text-2xl font-bold text-gray-800">Teacher Management</h2>
			<div class="flex space-x-2">
				<button
					class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-[#2b6cb0] flex items-center transition-colors"
					@click="openAddModal"
				>
					<Plus class="mr-2 w-4 h-4" />
					Add Teacher
				</button>
			</div>
		</div>

		<div class="bg-white rounded-lg shadow overflow-hidden mb-6">
			<div class="p-4 border-b border-gray-200 flex items-center justify-between">
				<SearchFilterBar v-model="searchQuery" placeholder="Search teachers..." />
				<div class="text-xs text-gray-400">
					Debug: {{ filteredTeachers.length }} teachers, Loading: {{ teacherStore.isLoading }},
					Error: {{ teacherStore.error }}
				</div>
			</div>

			<!-- TEACHERS TABLE -->
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Name
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Email
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Assigned Rooms
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Upcoming Schedules
							</th>
							<th
								scope="col"
								class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						<tr v-for="teacher in filteredTeachers" :key="teacher.id">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="flex items-center">
									<div class="flex-shrink-0 h-10 w-10">
										<div
											class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
										>
											<User :size="20" class="text-gray-400" />
										</div>
									</div>
									<div class="ml-4">
										<div class="text-sm font-medium text-gray-900">
											{{ teacher.name }}
										</div>
										<div class="text-sm text-gray-500">
											{{ teacher.subject }}
										</div>
									</div>
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{{ teacher.email }}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{{ teacher.assignedRooms }}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{{ teacher.upcomingSchedules }} Schedules today
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<button
									class="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
									@click="editTeacher(teacher)"
								>
									Edit
								</button>
								<button
									class="text-red-600 hover:text-red-900 transition-colors"
									@click="deleteTeacher(teacher.id)"
								>
									Delete
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- TEACHER SCHEDULE -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-medium text-gray-800 mb-4">Teacher Schedule</h3>
				<div class="space-y-4">
					<div
						v-for="Schedule in todaySchedule"
						:key="Schedule.id"
						class="border-l-4 pl-4 py-2"
						:class="[
							Schedule.color === 'primary'
								? 'border-[#4299e1]'
								: Schedule.color === 'green'
								? 'border-green-500'
								: 'border-yellow-500',
						]"
					>
						<p class="text-sm font-medium text-gray-800">
							{{ Schedule.subject }} - {{ Schedule.room }}
						</p>
						<p class="text-xs text-gray-500">
							{{ Schedule.time }}
						</p>
					</div>
				</div>
			</div>

			<!-- ADD NEW SCHEDULE -->
			<!-- ADD NEW SCHEDULE -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-medium text-gray-800 mb-4">Add New Schedule</h3>
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
						<select
							v-model="newSchedule.teacherId"
							class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
						>
							<option value="">Select Teacher</option>
							<option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
								{{ teacher.name }}
							</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Room</label>
						<select
							v-model="newSchedule.room"
							class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
						>
							<option value="">Select Room</option>
							<option value="1">Slab 1</option>
							<option value="2">Slab 2</option>
							<option value="3">Slab 3</option>
							<option value="4">Slab 4</option>
							<option value="5">Slab 5</option>
							<option value="6">SCLAB</option>
							<option value="7">Linux</option>
						</select>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
						<input
							v-model="newSchedule.subject"
							type="text"
							placeholder="Enter Subject"
							class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
						<input
							v-model="newSchedule.section"
							type="text"
							placeholder="Enter Section"
							class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
						<input
							v-model="newSchedule.date"
							type="date"
							class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
							<input
								v-model="newSchedule.startTime"
								type="time"
								class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
							<input
								v-model="newSchedule.endTime"
								type="time"
								class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4299e1] focus:border-[#4299e1]"
							/>
						</div>
					</div>
					<button
						class="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-[#2b6cb0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						@click="addSchedule"
						:disabled="isScheduleLoading"
					>
						{{ isScheduleLoading ? "Adding..." : "Add Schedule" }}
					</button>
				</div>
			</div>
		</div>

		<!-- ADD/EDIT TEACHER MODAL -->
		<AddEditTeacherModal
			v-if="showModal"
			:teacher="selectedTeacher"
			:mode="modalMode"
			@close="closeModal"
			@save="saveTeacher"
		/>

		<!-- TOAST NOTIFICATION -->
		<ToastNotification
			v-if="showToast"
			:message="toastMessage"
			:type="toastType"
			@close="closeToast"
		/>
	</div>
</template>
