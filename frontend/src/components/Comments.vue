<script setup>
const props = defineProps({
  comment: {
    type: Object,
    required: false,
  },
  
});
</script>
<template>
    <div class="comment">
      <h6 class="mt-2">{{ comment.username }}</h6>
      <div class="rating d-flex align-items-center">
            <strong>{{ comment.rating }}/5</strong>
            <img src="../assets/Images/star.svg" alt="star icon" class="ms-1" />
          </div>
      <p class="bg-gray p-3 mt-3 bg-body-secondary">{{ comment.text }}</p>
    </div>
  </template>
<style>
.comment {
    border-top: 1px solid gray;
}
</style>