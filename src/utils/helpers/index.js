export const addressToString = (address) => {
  if (!address) return null;

  let str = `${address.line1}, `;

  if (address.line2) {
    str += `${address.line2}, `;
  }
  if (address.landmark) {
    str += `${address.landmark}, `;
  }

  str += `${address.city}, `;
  str += `${address.state}, `;
  str += `${address.country} - `;
  str += `${address.zipcode}`;

  return str;
};
