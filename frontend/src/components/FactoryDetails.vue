
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import ChocolateCard from "./ChocolateCard.vue";
import EditCreateModal from "./EditCreateModal.vue";
import Comments from "./Comments.vue";
import  API  from '../api/index';

const route = useRoute();

const state = ref({
  factoryData: {
    locationId: {},
    comments: [],
  },
  isLoading: true,
  chocolatesList: [],
  showModal: false,
  selectedChocolate:{},
});

onMounted(async () => {
  getFactory();
});

const getFactory = async () => {
  const factoryName = route.params.name;
  try {
    const response = await API.getFactoryData(factoryName);
    state.value.factoryData = response.data;
    state.value.chocolatesList = response.data.chocolates;
  } catch (error) {
    handleError(error);
  }
  state.value.isLoading = false;
};

const handleError = (error) => {
  console.log("Error occurred:", error);
};

const openModal = () => {
  state.value.showModal = true;
};

const editChocolate = (chocolate) => {
    state.value.selectedChocolate = chocolate;
    state.value.showModal = true;
}

const availableChocolates = computed(() => {
  return state.value.chocolatesList ? state.value.chocolatesList.filter(chocolate => !chocolate.deleted && chocolate.quantity > 0) : [];
});

const unavailableChocolates = computed(() => {
  return state.value.chocolatesList ? state.value.chocolatesList.filter(chocolate => !chocolate.deleted && chocolate.quantity === 0) : [];
});

const closeModal = () => {
  state.value.showModal = false;
  state.value.selectedChocolate = {};
};

</script>
<template>
  <div>
    <div class="pb-5 bg-white rounded shadow mb-5">
      <div class="header d-flex px-3">
        <div class="img-holder  p-3">
            <img :src="state.factoryData?.logo" alt="Factory Logo" class="img-fluid" />
        </div>
        <div class="mt-3 ms-4">
          <h1 class="m-0">{{ state.factoryData.name }}</h1>
          <p class="m-0">{{ state.factoryData.locationId.address }}</p>
          <p class="m-0">{{ state.factoryData.locationId.latitude }} | {{ state.factoryData?.locationId?.longitude }}</p>
          <p class="m-0">{{ state.factoryData.workingHours }}</p>
          <p class="m-0">{{ state.factoryData.status }}</p>
          <div class="rating d-flex align-items-center">
            <strong>{{ state.factoryData.rating }}/5</strong>
            <img src="../assets/Images/star.svg" alt="star icon" class="ms-1" />
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-end mb-5">
      <button type="button" class="btn btn-primary" @click="openModal">Create new chocolate</button>
    </div>

    <!-- Available chocolates list-->
    <div>
      <h5>Available</h5> 
    <ChocolateCard
      v-for="chocolate in availableChocolates"
      :key="chocolate.name"
      @deleted="getFactory"
      @edit="editChocolate"
      :chocolate="chocolate"
      :factory="state.factoryData.name"
    />
    </div> 
    <!-- Unavailable chocolates list -->
    <div class="mt-5">
      <h5>Unavailable</h5>
    <ChocolateCard
      v-for="chocolate in unavailableChocolates"
      :key="chocolate.name"
      @deleted="getFactory"
      @edit="editChocolate"
      :chocolate="chocolate"
      :factory="state.factoryData.name"
    />
    </div> 
    <div class="bg-white shadow rounded p-3 mt-5">
        <h3>Comments</h3>
        <Comments v-for="(comment, index) in state.factoryData?.comments" :key="index" :comment="comment"/>
      </div>

    <EditCreateModal
      :visible="state.showModal"
      :chocolate="state.selectedChocolate"
      :factoryName="state.factoryData.name"
      :isEdit="!(Object.keys(state.selectedChocolate).length === 0)"
      @close="closeModal"
      @update="getFactory"
    />
      
  </div>
</template>

<style>
.img-holder {
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 200px;
  background-color: white;
}
.img-holder img {
  object-fit: contain;
}
.header {
  padding-top: 80px;
}
</style>
