<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  factory: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="col-12 col-md-6 col-lg-4 ">
    <div class="border border-secondary rounded rounded-4">
      <div class="d-flex flex-column p-4">
        <div class="logo-holder">
          <img src="../assets/Images/milka-logo.png" alt="Factory Logo" class="img-fluid">
        </div>
        <h3>{{ factory.name }}</h3>
        <p>{{ factory.location.city }}, {{ factory.location.country }}</p>
        <div class="rating d-flex align-items-center">
          <strong>{{ factory.averageRating }}/5</strong>
          <img src="../assets/Images/star.svg" alt="star icon" class="ms-1">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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