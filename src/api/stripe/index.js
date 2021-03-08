import axios from "axios";

export const createSetupIntent = async (customer) => {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_PAYMENTS_API_URL}/api/setup-intent`,
      {
        customer,
        confirm: true,
      }
    );
    return data.data;
  } catch (error) {
    return error;
  }
};

export const cancelSetupIntent = async (id) => {
  try {
    const { data } = await axios.delete(
      `${process.env.REACT_APP_PAYMENTS_API_URL}/api/setup-intent/${id}`
    );
    return data;
  } catch (error) {
    return error;
  }
};
