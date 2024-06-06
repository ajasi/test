<script setup>
import { ref, onMounted } from "vue";
import FactoryCard from "./FactoryCard.vue";
import API from "../api/index.js";

const state = ref({
  factoryData: [],
  isLoading: true,
});

onMounted(() => {
  getAllFactories();
});

const getAllFactories = async () => {
  try {
    const response = await API.getFactories();
    state.value.factoryData = sortFactories(response.data);
  } catch (error) {
    handleError(error);
  } finally {
    state.value.isLoading = false; 
  }
};

const sortFactories = (factories) => {
  return factories.sort((a, b) => {
    if (a.status !== 'Open' && b.status === 'Open') return 1;
    if (a.status === 'Open' && b.status !== 'Open') return -1;
    return 0;
  });
};

const handleError = (error) => {
  console.log("Error occurred:", error);
};

</script>
<template>
  <div>
    <div v-if="state.isLoading">Loading...</div>
    <div v-else-if="!state.isLoading && state.factoryData.length === 0">No factories available</div>
    <div v-else class="row gy-4 gx-4">
      <div
        class="col-12 col-md-6 col-lg-4"
        v-for="factory in state.factoryData"
        :key="factory.name"
        :class="{ 'opacity-50': factory.status !== 'Open' }"
      >
        <router-link :to="{ name: 'factory', params: { name: factory.name } }">
          <FactoryCard :factory="factory" />
        </router-link>
      </div>
    </div>
  </div>
</template>
