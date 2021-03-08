import React from "react";
import { Button, Input } from "..";
import { registerUser, loginUser } from "../../api";

import "./SignUpForm.scss";

const SignUpForm = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      setError("");
      console.log({ email, password });
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match!");
      }
      const { data, errors } = await registerUser({
        email,
        password,
      });
      if (data?.registerCustomer?.success) {
        const { data, error } = await loginUser({
          email,
          password,
        });
        if (data?.access_token) {
          localStorage.setItem("token", data.access_token);
          window.location.reload();
        }
      }
      if (errors?.length) {
        throw Error(
          errors[0].message.replace(/username/gi, "email") ||
            "Something went wrong!"
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="SignUpForm">
      <h3 className="SignUpForm__heading"> Sign Up </h3>
      <form className="SignUpForm__form" onSubmit={handleSubmit}>
        <Input
          label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <Input
          label="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          type="password"
        />
        <Input
          label="Confirm Password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
        />
        <Button className="SignUpForm__button" type="submit">
          Sign Up
        </Button>
      </form>
      {error && <small className="SignUpForm__error">{error}</small>}
    </div>
  );
};

export default SignUpForm;
