<script setup>
import { ref, onMounted } from "vue";
import FactoryCard from "./FactoryCard.vue";
import API from "../api/index.js";

const state = ref({
  factoryData: [],
  isLoading: true,
});

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  try {
    state.value.factoryData = await API.getFactories();
  } catch (error) {
    handleError(error);
  }
  state.value.isLoading = false;
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
      >
        <router-link :to="{ name: 'factory', params: { name: factory.name } }">
          <FactoryCard :factory="factory" />
        </router-link>
      </div>
    </div>
  </div>
</template>
