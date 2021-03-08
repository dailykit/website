import axios from "axios";
const BASE_URL = `https://secure.dailykit.org/auth/realms/consumers/protocol/openid-connect/token`;

export const loginUser = async ({ email, password }) => {
  const params = {
    username: email,
    password,
    grant_type: "password",
    client_id: process.env.REACT_APP_CLIENTID,
    scope: "openid",
  };
  const searchParams = Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    })
    .join("&");

  const response = await axios({
    url: BASE_URL,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: searchParams,
  });
  return response;
};

export const registerUser = async ({ email, password }) => {
  const response = await axios({
    url: process.env.REACT_APP_DATAHUB_URL,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.REACT_APP_DATAHUB_ADMIN_SECRET,
    },
    data: {
      query: `
            mutation registerCustomer($email: String!, $password: String!){
               registerCustomer(email: $email, password: $password) {
               success
               message
               }
            }
         `,
      variables: {
        email,
        password,
      },
    },
  });
  return response.data;
};
