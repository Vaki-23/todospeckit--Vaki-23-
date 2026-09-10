<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";
import authServices from "../services/authServices.js";

const router = useRouter();
const user = ref(Utils.getStore("user"));
const loading = ref(false);

async function signOut() {
  loading.value = true;
  try {
    await authServices.logoutUser();
  } catch {
    // Clear the local session even if the API call fails.
  }
  Utils.removeItem("user");
  router.push({ name: "login" });
  loading.value = false;
}
</script>

<template>
  <v-container class="py-10">
    <h1 class="text-h4 mb-4">Welcome{{ user?.fName ? `, ${user.fName}` : "" }}</h1>
    <p class="text-body-1 mb-6">You are signed in. List management arrives in the next feature.</p>
    <v-btn color="primary" variant="elevated" class="oc-cta" :loading="loading" @click="signOut">
      Sign out
    </v-btn>
  </v-container>
</template>
