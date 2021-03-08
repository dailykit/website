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

export const getdrivableDistance = async ({ lat1, lon1, lat2, lon2 }) => {
  const response = await axios.post(
    `${process.env.REACT_APP_DAILYOS_SERVER_URL}/api/distance-matrix`,
    {
      lat1,
      lon1,
      lat2,
      lon2,
      key: process.env.REACT_APP_MAPS_API_KEY,
    }
  );
  return response.data;
};
