<script setup>
import { defineProps } from "vue";
import  API  from '../api/index';

const props = defineProps({
  chocolate: {
    type: Object,
    required: true,
  },
  factory: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['deleted', 'edit']);

const deleteChocolate = async (factoryName, chocolateId) => {
  try {
    const response = await API.deleteChocolate(factoryName, chocolateId);
    emit('deleted');
    console.log(response)
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
    <div class="d-flex bg-white shadow rounded my-3">
      <div class="chocolate-img p-3">
        <img :src="chocolate.image" alt="Factory Logo" class="img-fluid" />
      </div>
      <div class="card-body d-flex justify-content-between align-items-center px-3 py-1">
        <div>
          <h5 class="card-title">{{ chocolate.name }}</h5>
          <p class="card-text mb-1">
            {{ chocolate.description }}
          </p>
          <div class="spec d-flex justify-content-between">
            <p>{{ chocolate.type }}</p>
            <p>{{ chocolate.kind }}</p>
            <p>{{ chocolate.weight }}gr</p>
            <p>QTY: {{ chocolate.quantity }}</p>
            <p>{{ chocolate.status }}</p>
            <p>{{ chocolate.price }}RSD</p>
          </div>
        </div>
        <div>
            <button type="button" class="btn btn-primary me-3"
            @click="$emit('edit', chocolate)">
              Edit
            </button>
            <button type="button" class="btn btn-danger" 
            @click="deleteChocolate(factory, chocolate.name)">
              Delete
            </button>
        </div>
      </div>
    </div>
</template>
<style>
.chocolate-img {
  width: 100px;
  height: 100px;
}
.spec {
  border-top: 1px solid gray;
}
.spec p {
  margin-right: 12px;
}
</style>
