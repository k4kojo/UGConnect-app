type AuthFormType = "signin" | "signup";

interface AuthInputs {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

interface AuthErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

export function validateAuth(form: AuthInputs, type: AuthFormType): AuthErrors {
  const errors: AuthErrors = {};

  if (!form.email || !form.email.includes("@")) {
    errors.email = "Enter a valid email";
  }

  if (!form.password || form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (type === "signup") {
    if (!form.firstName) errors.firstName = "First name is required";

    if (!form.lastName) errors.lastName = "Last name is required";

    if (!form.dateOfBirth) errors.dateOfBirth = "Date of birth is required";

    if (!form.phoneNumber) errors.phoneNumber = "Phone number is required";

    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match";
    }
  }

  return errors;
}
