<script setup>
import { ref, watchEffect } from "vue";
import API from "../api/index";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  chocolate: {
    type: Object,
    required: false,
  },
  factoryName: {
    type: String,
    required: false,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "update"]);

const initialState = ref({
  name: "",
  price: 0,
  type: "",
  kind: "",
  weight: 0,
  description: "",
  image: "",
  status: "Available",
  quantity: 0,
});

const state = ref({
  product: { ...initialState.value },
});

watchEffect(() => {
  if (props.isEdit && props.chocolate) {
    state.value.product = { ...props.chocolate };
  } else {
    state.value.product = { ...initialState.value };
  }
});

const closeModal = () => {
  emit("close");
};

const editChocolates = async () => {
  try {
    await API.editChocolate(props.factoryName, state.value.product.name, state.value.product);
    emit("update");
    emit("close");
  } catch (error) {
    console.log(error);
  }
};

const createChocolates = async () => {
  try {
    await API.createChocolate(props.factoryName, state.value.product);
    emit("update");
    emit("close");
  } catch (error) {
    console.log(error);
  }
};
</script>

<template>
  <div>
    <!-- Modal -->
    <div
      v-if="props.visible"
      class="modal fade show"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-modal="true"
      role="dialog"
      style="display: block"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">
              {{ isEdit ? "Edit Product" : "Create Product" }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEdit ? editChocolates() : createChocolates()">
              <div class="row">
                <div class="col-12 mb-3">
                  <label for="productName" class="form-label">Name</label>
                  <input
                    id="productName"
                    name="name"
                    type="text"
                    class="form-control"
                    v-model="state.product.name"
                    :readonly="isEdit"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productType" class="form-label">Type</label>
                  <input
                    id="productType"
                    name="type"
                    type="text"
                    class="form-control"
                    v-model="state.product.type"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="productPrice" class="form-label">Price</label>
                  <input
                    id="productPrice"
                    name="price"
                    type="number"
                    class="form-control"
                    v-model="state.product.price"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productKind" class="form-label">Kind</label>
                  <input
                    id="productKind"
                    name="kind"
                    type="text"
                    class="form-control"
                    v-model="state.product.kind"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="productWeight" class="form-label">Weight</label>
                  <input
                    id="productWeight"
                    name="weight"
                    type="number"
                    class="form-control"
                    v-model="state.product.weight"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-12 mb-3">
                  <label for="productImage" class="form-label">Image URL</label>
                  <input
                    id="productImage"
                    name="image"
                    type="text"
                    class="form-control"
                    v-model="state.product.image"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="productStatus" class="form-label">Status</label>
                  <select
                    id="productStatus"
                    name="status"
                    class="form-select"
                    v-model="state.product.status"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="productQuantity" class="form-label">Quantity</label>
                  <input
                    id="productQuantity"
                    name="quantity"
                    type="number"
                    class="form-control"
                    v-model="state.product.quantity"
                    :readonly="!isEdit"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-12 mb-3">
                  <label for="productDescription" class="form-label">Description</label>
                  <textarea
                    id="productDescription"
                    name="description"
                    class="form-control"
                    v-model="state.product.description"
                    required
                  ></textarea>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
                <button type="submit" class="btn btn-primary">
                  {{ props.isEdit ? "Save" : "Create" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
