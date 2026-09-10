import apiClient from "./services.js";

const authServices = {
  loginUser(credentials) {
    return apiClient.post("login", credentials);
  },

  registerUser(payload) {
    return apiClient.post("register", payload);
  },

  logoutUser() {
    return apiClient.post("logout");
  },
};

export default authServices;
