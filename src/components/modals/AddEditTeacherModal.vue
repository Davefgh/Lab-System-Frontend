<script setup lang="ts">
// IMPORTS
import { ref, watch, computed } from "vue";
import { X, Eye, EyeOff } from "lucide-vue-next";
import type { Teacher } from "@/interfaces/interfaces";

// PROPS
const props = defineProps<{
	teacher?: Teacher | null;
	mode: "add" | "edit";
}>();

// EMITS
const emit = defineEmits<{
	close: [];
	save: [teacherData: any];
}>();

// REFS & REACTIVE STATE
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const formData = ref({
	firstname: "",
	lastname: "",
	email: "",
	username: "",
	password: "",
	confirm_password: "",
	user_type: "teacher",
	user_id: "",
});

const errors = ref({
	firstname: "",
	lastname: "",
	email: "",
	username: "",
	password: "",
	confirm_password: "",
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
				username: "", // Cannot populate from Teacher interface
				password: "",
				confirm_password: "",
				user_type: "teacher",
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
		username: "",
		password: "",
		confirm_password: "",
		user_type: "teacher",
		user_id: "",
	};
	errors.value = {
		firstname: "",
		lastname: "",
		email: "",
		username: "",
		password: "",
		confirm_password: "",
	};
	showPassword.value = false;
	showConfirmPassword.value = false;
};

const validateForm = () => {
	let isValid = true;
	errors.value = {
		firstname: "",
		lastname: "",
		email: "",
		username: "",
		password: "",
		confirm_password: "",
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

	if (!formData.value.username.trim()) {
		errors.value.username = "Username is required";
		isValid = false;
	} else if (formData.value.username.length < 8) {
		errors.value.username = "Username must be at least 8 characters";
		isValid = false;
	}

	if (props.mode === "add") {
		if (!formData.value.password) {
			errors.value.password = "Password is required";
			isValid = false;
		} else {
			// Password complexity validation
			const hasUpperCase = /[A-Z]/.test(formData.value.password);
			const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.value.password);
			const hasMinLength = formData.value.password.length >= 8;

			if (!hasMinLength) {
				errors.value.password = "Password must be at least 8 characters";
				isValid = false;
			} else if (!hasUpperCase) {
				errors.value.password = "Password must contain at least one uppercase letter";
				isValid = false;
			} else if (!hasSpecialChar) {
				errors.value.password = "Password must contain at least one special character";
				isValid = false;
			}
		}

		if (formData.value.password !== formData.value.confirm_password) {
			errors.value.confirm_password = "Passwords do not match";
			isValid = false;
		}
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
		class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
		@click.self="handleClose"
	>
		<div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
			<div class="p-8">
				<div class="flex items-center justify-between mb-8">
					<div>
						<h3 class="text-2xl font-bold text-gray-900">
							{{ mode === "add" ? "Add New Teacher" : "Edit Teacher" }}
						</h3>
						<p class="text-gray-500 mt-1">Enter the teacher's details below.</p>
					</div>
					<button
						@click="handleClose"
						class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
					>
						<X :size="24" />
					</button>
				</div>

				<form @submit.prevent="handleSave" class="space-y-6" novalidate>
					<!-- Name Section -->
					<div class="grid grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2"> First Name </label>
							<input
								v-model="formData.firstname"
								type="text"
								class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
								:class="{
									'border-red-300 focus:border-red-500 focus:ring-red-200': errors.firstname,
								}"
								placeholder="Enter first name"
							/>
							<p v-if="errors.firstname" class="mt-1 text-sm text-red-500">
								{{ errors.firstname }}
							</p>
						</div>
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2"> Last Name </label>
							<input
								v-model="formData.lastname"
								type="text"
								class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
								:class="{
									'border-red-300 focus:border-red-500 focus:ring-red-200': errors.lastname,
								}"
								placeholder="Enter last name"
							/>
							<p v-if="errors.lastname" class="mt-1 text-sm text-red-500">{{ errors.lastname }}</p>
						</div>
					</div>

					<!-- Email & Username -->
					<div class="grid grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2"> Email Address </label>
							<input
								v-model="formData.email"
								type="email"
								class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
								:class="{ 'border-red-300 focus:border-red-500 focus:ring-red-200': errors.email }"
								placeholder="teacher@example.com"
								:disabled="mode === 'edit'"
							/>
							<p v-if="errors.email" class="mt-1 text-sm text-red-500">{{ errors.email }}</p>
						</div>
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2"> Username </label>
							<input
								v-model="formData.username"
								type="text"
								class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
								:class="{
									'border-red-300 focus:border-red-500 focus:ring-red-200': errors.username,
								}"
								placeholder="Enter username"
							/>
							<p v-if="errors.username" class="mt-1 text-sm text-red-500">{{ errors.username }}</p>
						</div>
					</div>

					<!-- Password Section (Only for Add) -->
					<div v-if="mode === 'add'" class="grid grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2"> Password </label>
							<div class="relative">
								<input
									v-model="formData.password"
									:type="showPassword ? 'text' : 'password'"
									class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none pr-10"
									:class="{
										'border-red-300 focus:border-red-500 focus:ring-red-200': errors.password,
									}"
									placeholder="Enter password"
								/>
								<button
									type="button"
									@click="showPassword = !showPassword"
									class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<component :is="showPassword ? EyeOff : Eye" :size="18" />
								</button>
							</div>
							<p v-if="errors.password" class="mt-1 text-sm text-red-500">{{ errors.password }}</p>
						</div>
						<div>
							<label class="block text-sm font-semibold text-gray-700 mb-2">
								Confirm Password
							</label>
							<div class="relative">
								<input
									v-model="formData.confirm_password"
									:type="showConfirmPassword ? 'text' : 'password'"
									class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none pr-10"
									:class="{
										'border-red-300 focus:border-red-500 focus:ring-red-200':
											errors.confirm_password,
									}"
									placeholder="Confirm password"
								/>
								<button
									type="button"
									@click="showConfirmPassword = !showConfirmPassword"
									class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<component :is="showConfirmPassword ? EyeOff : Eye" :size="18" />
								</button>
							</div>
							<p v-if="errors.confirm_password" class="mt-1 text-sm text-red-500">
								{{ errors.confirm_password }}
							</p>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-100">
						<button
							type="button"
							class="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 transition-all"
							@click="handleClose"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
							:class="
								mode === 'add'
									? 'bg-blue-600 hover:bg-blue-700'
									: 'bg-indigo-600 hover:bg-indigo-700'
							"
						>
							{{ mode === "add" ? "Create Teacher" : "Save Changes" }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
```
