export default {
  getFactories: async () => {
    const response = await fetch("http://localhost:3000/factories");
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    return await response.json();
  },
};
