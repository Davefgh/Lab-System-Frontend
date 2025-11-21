<script setup lang="ts">
// IMPORTS
import { ref, watch } from "vue";
import { X } from "lucide-vue-next";
import type { Teacher } from "@/interfaces/interfaces";

// PROPS
const props = defineProps<{
	teacher?: Teacher | null;
	mode: "add" | "edit";
}>();

// EMITS
const emit = defineEmits<{
	close: [];
	save: [teacherData: Partial<Teacher>];
}>();

// REFS & REACTIVE STATE
const formData = ref({
	firstname: "",
	lastname: "",
	email: "",
	subject: "",
	user_id: "",
});

const errors = ref({
	firstname: "",
	lastname: "",
	email: "",
	subject: "",
});

// WATCH FOR TEACHER PROP CHANGES (FOR EDIT MODE)
watch(
	() => props.teacher,
	(newTeacher) => {
		if (newTeacher && props.mode === "edit") {
			const nameParts = newTeacher.name.split(" ");
			formData.value = {
				firstname: nameParts[0] || "",
				lastname: nameParts.slice(1).join(" ") || "",
				email: newTeacher.email,
				subject: newTeacher.subject,
				user_id: newTeacher.id,
			};
		}
	},
	{ immediate: true }
);

// METHODS
const handleClose = () => {
	emit("close");
	resetForm();
};

const resetForm = () => {
	formData.value = {
		firstname: "",
		lastname: "",
		email: "",
		subject: "",
		user_id: "",
	};
	errors.value = {
		firstname: "",
		lastname: "",
		email: "",
		subject: "",
	};
};

const validateForm = () => {
	let isValid = true;
	errors.value = {
		firstname: "",
		lastname: "",
		email: "",
		subject: "",
	};

	if (!formData.value.firstname.trim()) {
		errors.value.firstname = "First name is required";
		isValid = false;
	}

	if (!formData.value.lastname.trim()) {
		errors.value.lastname = "Last name is required";
		isValid = false;
	}

	if (!formData.value.email.trim()) {
		errors.value.email = "Email is required";
		isValid = false;
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
		errors.value.email = "Invalid email format";
		isValid = false;
	}

	if (!formData.value.subject.trim()) {
		errors.value.subject = "Subject is required";
		isValid = false;
	}

	return isValid;
};

const handleSave = () => {
	if (validateForm()) {
		emit("save", formData.value);
		handleClose();
	}
};
</script>

<template>
	<div
		class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
		@click.self="handleClose"
	>
		<div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
			<div class="p-6">
				<div class="flex items-center justify-between mb-6">
					<h3 class="text-xl font-semibold text-gray-900">
						{{ mode === "add" ? "Add New Teacher" : "Edit Teacher" }}
					</h3>
					<button @click="handleClose" class="text-gray-400 hover:text-gray-500 transition-colors">
						<X :size="20" />
					</button>
				</div>

				<form @submit.prevent="handleSave" class="space-y-4">
					<!-- First Name -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							First Name <span class="text-red-500">*</span>
						</label>
						<input
							v-model="formData.firstname"
							type="text"
							class="block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors"
							:class="
								errors.firstname
									? 'border-red-300 focus:ring-red-500 focus:border-red-500'
									: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
							"
							placeholder="Enter first name"
						/>
						<p v-if="errors.firstname" class="mt-1 text-sm text-red-600">
							{{ errors.firstname }}
						</p>
					</div>

					<!-- Last Name -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Last Name <span class="text-red-500">*</span>
						</label>
						<input
							v-model="formData.lastname"
							type="text"
							class="block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors"
							:class="
								errors.lastname
									? 'border-red-300 focus:ring-red-500 focus:border-red-500'
									: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
							"
							placeholder="Enter last name"
						/>
						<p v-if="errors.lastname" class="mt-1 text-sm text-red-600">
							{{ errors.lastname }}
						</p>
					</div>

					<!-- Email -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Email <span class="text-red-500">*</span>
						</label>
						<input
							v-model="formData.email"
							type="email"
							class="block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors"
							:class="
								errors.email
									? 'border-red-300 focus:ring-red-500 focus:border-red-500'
									: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
							"
							placeholder="teacher@example.com"
							:disabled="mode === 'edit'"
						/>
						<p v-if="errors.email" class="mt-1 text-sm text-red-600">
							{{ errors.email }}
						</p>
					</div>

					<!-- Subject -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">
							Subject <span class="text-red-500">*</span>
						</label>
						<input
							v-model="formData.subject"
							type="text"
							class="block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 transition-colors"
							:class="
								errors.subject
									? 'border-red-300 focus:ring-red-500 focus:border-red-500'
									: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
							"
							placeholder="e.g., Mathematics, Computer Science"
						/>
						<p v-if="errors.subject" class="mt-1 text-sm text-red-600">
							{{ errors.subject }}
						</p>
					</div>

					<!-- Action Buttons -->
					<div class="flex justify-end space-x-3 pt-4">
						<button
							type="button"
							class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
							@click="handleClose"
						>
							Cancel
						</button>
						<button
							type="submit"
							:class="
								mode === 'add'
									? 'px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors'
									: 'px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors'
							"
						>
							{{ mode === "add" ? "Create" : "Save Changes" }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
```
