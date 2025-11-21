<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { CheckCircle, XCircle, X } from "lucide-vue-next";

// PROPS
const props = defineProps<{
	message: string;
	type: "success" | "error";
	duration?: number;
}>();

// EMITS
const emit = defineEmits<{
	close: [];
}>();

// REFS
const show = ref(false);

// LIFECYCLE
onMounted(() => {
	// Trigger animation
	setTimeout(() => {
		show.value = true;
	}, 10);

	// Auto close after duration
	const duration = props.duration || 3000;
	setTimeout(() => {
		handleClose();
	}, duration);
});

// METHODS
const handleClose = () => {
	show.value = false;
	setTimeout(() => {
		emit("close");
	}, 300); // Wait for animation to complete
};
</script>

<template>
	<div
		class="fixed top-4 right-4 z-[100] transition-all duration-300 transform"
		:class="show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
	>
		<div
			class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md"
			:class="
				type === 'success'
					? 'bg-green-50 border border-green-200'
					: 'bg-red-50 border border-red-200'
			"
		>
			<!-- Icon -->
			<div class="flex-shrink-0">
				<CheckCircle v-if="type === 'success'" :size="24" class="text-green-600" />
				<XCircle v-else :size="24" class="text-red-600" />
			</div>

			<!-- Message -->
			<p
				class="flex-1 text-sm font-medium"
				:class="type === 'success' ? 'text-green-800' : 'text-red-800'"
			>
				{{ message }}
			</p>

			<!-- Close Button -->
			<button
				@click="handleClose"
				class="flex-shrink-0 transition-colors"
				:class="
					type === 'success'
						? 'text-green-600 hover:text-green-800'
						: 'text-red-600 hover:text-red-800'
				"
			>
				<X :size="18" />
			</button>
		</div>
	</div>
</template>
