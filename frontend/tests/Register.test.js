/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import Register from "../src/views/Register.vue";
import authServices from "../src/services/authServices.js";
import { mountWithPlugins, setField, submitForm } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: {
    loginUser: vi.fn(),
    registerUser: vi.fn(),
    logoutUser: vi.fn(),
  },
}));

async function fillRegister(wrapper, overrides = {}) {
  const values = {
    "First name": "Jane",
    "Last name": "Doe",
    Email: "jane@example.com",
    Username: "jdoe",
    Password: "password123",
    "Confirm password": "password123",
    ...overrides,
  };

  for (const [label, value] of Object.entries(values)) {
    if (value === "") {
      continue;
    }
    await setField(wrapper, label, value);
  }
}

describe("Feature 1 — User Authentication & Session Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("US-1.1 — Registration", () => {
    it("User submits registration with invalid email format", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fillRegister(wrapper, { Email: "notanemail" });
      await submitForm(wrapper);

      expect(wrapper.text()).toContain("Enter a valid email address.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits registration with missing username", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fillRegister(wrapper, { Username: "" });
      await submitForm(wrapper);

      expect(wrapper.text()).toContain("Username is required.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits registration with password too short", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fillRegister(wrapper, { Password: "short7!", "Confirm password": "short7!" });
      await submitForm(wrapper);

      expect(wrapper.text()).toContain("Password must be at least 8 characters.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits registration with mismatched passwords", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fillRegister(wrapper, { Password: "password123", "Confirm password": "password456" });
      await submitForm(wrapper);

      expect(wrapper.text()).toContain("Passwords do not match.");
      expect(authServices.registerUser).not.toHaveBeenCalled();
    });
  });
});
