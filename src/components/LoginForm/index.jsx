import React from "react";
import { Button, Input } from "..";
import { loginUser } from "../../api";

import "./LoginForm.scss";

const LoginForm = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log({ email, password });
      const { data, error } = await loginUser({ email, password });
      if (data?.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.reload();
      } else {
        throw new Error("Email or Password is incorrect!");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="LoginForm">
      <h3 className="LoginForm__heading"> Login </h3>
      <form className="LoginForm__form" onSubmit={handleSubmit}>
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
          type="password"
        />
        <Button className="LoginForm__button" type="submit">
          Login
        </Button>
      </form>
      {error && <small className="LoginForm__error">{error}</small>}
    </div>
  );
};

export default LoginForm;
