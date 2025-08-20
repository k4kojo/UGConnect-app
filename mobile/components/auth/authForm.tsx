import React from "react";
import SignInForm from "./SignInForm.component";
import SignUpForm from "./SignUpForm.component";

type AuthFormProps = {
  type: "signin" | "signup";
};

const AuthForm = ({ type }: AuthFormProps) => {
  return type === "signin" ? <SignInForm /> : <SignUpForm />;
};

export default AuthForm;
