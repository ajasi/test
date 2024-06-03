<script setup>
import { ref } from 'vue';
import  mockup from '../mockup.js';
import FactoryCard from './FactoryCard.vue';

const data = ref(mockup);

</script>
<template>
    <div class="row gy-4 gx-4">
      <FactoryCard v-for="factory in data" :key="factory.id" :factory="factory" />
    </div>
</template>