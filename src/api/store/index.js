import axios from "axios";

export const getStoreData = async ({ clientId, domain, email, keycloakId }) => {
  const response = await axios.post(
    `${process.env.REACT_APP_DAILYOS_SERVER_URL}/api/store/data`,
    {
      clientId,
      domain,
      email,
      keycloakId,
    }
  );
  return response.data;
};
