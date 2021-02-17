export const getFullPath = (path) => {
  const host =
    process.env.NODE_ENV === "development"
      ? "https://test.dailykit.org"
      : window.location.origin;

  const url = `${host}/template/files${path}`;
  console.log("from Fetch util", path, url);
  return url;
};

export const fileAgent = async (path) => {
  try {
    const url = getFullPath(path);
    const data = await fetch(url);

    return data;
  } catch (error) {
    console.log(error);
  }
};
