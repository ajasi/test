<script setup>
import { defineProps } from "vue";

const props = defineProps({
  factory: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="border border-secondary rounded rounded-4">
    <div class="d-flex flex-column p-4">
      <div class="logo-holder">
        <img :src="factory.logo" alt="Factory Logo" class="img-fluid" />
      </div>
      <h3>{{ factory.name }}</h3>
      <p>{{ factory.locationId.address }}</p>
      <div class="rating d-flex align-items-center">
        <strong>{{ factory.rating }}/5</strong>
        <img src="../assets/Images/star.svg" alt="star icon" class="ms-1" />
      </div>
    </div>
  </div>
</template>

<style>
.logo-holder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.rating img {
  width: 20px;
}
</style>
