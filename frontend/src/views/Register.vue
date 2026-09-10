<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils.js";
import authServices from "../services/authServices.js";
import { emailRules } from "../config/validation.js";

const router = useRouter();
const form = ref(null);
const loading = ref(false);
const error = ref("");
const fName = ref("");
const lName = ref("");
const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");

const required = (message) => (v) => !!v?.trim() || message;

const usernameRules = [required("Username is required.")];
const passwordRules = [
  (v) => !!v || "Password is required.",
  (v) => (v && v.length >= 8) || "Password must be at least 8 characters.",
];
const confirmPasswordRules = computed(() => [
  (v) => !!v || "Confirm password is required.",
  (v) => v === password.value || "Passwords do not match.",
]);

async function submit() {
  error.value = "";
  const { valid } = await form.value.validate();
  if (!valid) {
    return;
  }

  loading.value = true;
  try {
    const res = await authServices.registerUser({
      fName: fName.value.trim(),
      lName: lName.value.trim(),
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
    });
    Utils.setStore("user", res.data);
    window.dispatchEvent(new CustomEvent("user-logged-in"));
    router.push({ name: "home" });
  } catch (err) {
    error.value = err.response?.data?.message || "Unable to create account.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="pa-6" elevation="2">
          <v-card-title class="text-h5 px-0">Create account</v-card-title>
          <v-card-text class="px-0">
            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
            <v-form ref="form" @submit.prevent="submit">
              <v-text-field v-model="fName" label="First name" :rules="[required('First name is required.')]" class="mb-2" />
              <v-text-field v-model="lName" label="Last name" :rules="[required('Last name is required.')]" class="mb-2" />
              <v-text-field v-model="email" label="Email" type="email" :rules="emailRules" class="mb-2" />
              <v-text-field v-model="username" label="Username" :rules="usernameRules" class="mb-2" />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="passwordRules"
                autocomplete="new-password"
                class="mb-2"
              />
              <v-text-field
                v-model="confirmPassword"
                label="Confirm password"
                type="password"
                :rules="confirmPasswordRules"
                autocomplete="new-password"
                class="mb-4"
              />
              <v-btn
                type="submit"
                color="primary"
                variant="elevated"
                class="oc-cta"
                block
                :loading="loading"
              >
                Create account
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="px-0">
            <router-link :to="{ name: 'login' }">Already have an account? Sign in</router-link>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
