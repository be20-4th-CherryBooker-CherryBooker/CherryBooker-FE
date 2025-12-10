<template>
  <div class="book-card" @click="$emit('select', book)">
    <div class="cover-wrapper" :class="{ spine: book.displayType === 'SPINE' }">
      <img
          :src="resolvedCover"
          :alt="book.title"
          class="book-cover"
          @error="handleImageError"
      />

      <div
          v-if="book.status"
          class="status-pill"
        :class="book.status.toLowerCase()"
      >
        {{ statusLabel }}
      </div>

      <div v-if="book.badgeIssued" class="badge-check">
        ✓
      </div>

      <button
          v-if="book.status === 'READING'"
          class="complete-btn"
          :disabled="completing"
          @click.stop="$emit('complete', book)"
      >
        {{ completing ? "변경 중..." : "완독" }}
      </button>
    </div>

    <div class="book-title">{{ book.title }}</div>
    <div class="book-author">{{ book.author }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
  completing: {
    type: Boolean,
    default: false
  }
});

defineEmits(["select", "complete"]);

const fallbackCover = "/images/default-book.png";
const currentCover = ref(props.book.coverImageUrl || fallbackCover);

const resolvedCover = computed(() => currentCover.value || fallbackCover);

const statusLabel = computed(() => {
  const map = {
    WISH: "읽고 싶은",
    READING: "읽는 중",
    READ: "완독",
  };
  return map[props.book.status] || "읽기";
});

const handleImageError = () => {
  currentCover.value = fallbackCover;
};
</script>

<style scoped>
.book-card {
  width: 180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book-card:hover {
  transform: translateY(-4px);
}

.cover-wrapper {
  position: relative;
  width: 150px;
  height: 210px;
  border-radius: 16px;
  background: #f7f2e9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.cover-wrapper.spine img {
  object-fit: contain;
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-pill {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  border-radius: 12px;
  background: #f49f9f;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.status-pill.read {
  background: #f4959f;
}

.status-pill.reading {
  background: #fdd26a;
  color: #5c4204;
}

.status-pill.wish {
  background: #dadada;
  color: #686868;
}

.badge-check {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #41c891;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.complete-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translate(-50%, 0);
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: rgba(28, 28, 28, 0.92);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.book-card:hover .complete-btn {
  opacity: 1;
  pointer-events: auto;
}

.book-card:hover .status-pill.reading {
  opacity: 0;
}

.book-title {
  font-weight: 600;
  font-size: 14px;
  color: #3d2c28;
  text-align: center;
  line-height: 1.3;
}

.book-author {
  font-size: 12px;
  color: #7b6a65;
  text-align: center;
}

@media (max-width: 768px) {
  .book-card {
    width: 140px;
  }

  .cover-wrapper {
    width: 120px;
    height: 170px;
  }
}
</style>
