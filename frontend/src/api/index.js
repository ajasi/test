import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
});

export default {
  getFactories() {
    return apiClient.get("/factories");
  },
  getFactoryData(name) {
    return apiClient.get(`/factories/${name}`);
  },

  getChocolates(name) {
    return apiClient.get(`/factories/${name}/chocolates`);
  },
  deleteChocolate(factoryName, chocolateName) {
    return apiClient.delete(`/factories/${factoryName}/chocolates/${chocolateName}`);
  },
  editChocolate(factoryName, chocolateName, chocolateData) {
    return apiClient.put(`/factories/${factoryName}/chocolates/${chocolateName}`, chocolateData);
  },

  createChocolate(factoryName, chocolateData) {
    return apiClient.post(`/factories/${factoryName}/chocolates`, chocolateData);
  }
};