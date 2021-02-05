export const fileAgent = async (path) => {
  try {
    const host =
      process.env.NODE_ENV === "development"
        ? "https://test.dailykit.org"
        : window.location.origin;

    const url = `${host}/template/files${path}`;
    const data = await fetch(url);

    return data;
  } catch (error) {
    console.log(error);
  }
};
