import isEqual from "lodash.isequal";

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

export const combineCartItems = (cartItems) => {
  if (!cartItems || !cartItems.length) {
    return [];
  }

  const cartItemRootIds = cartItems.map((item) => item.id);
  const cartItemsWithoutId = cartItems.map((item) => {
    const updatedItem = item;
    delete updatedItem.id;
    return updatedItem;
  });

  const combinedItems = [];
  cartItemsWithoutId.forEach((item, index) => {
    let found = false;
    for (const combinedItem of combinedItems) {
      const combinedItemIds = combinedItem.ids;
      delete combinedItem.ids;
      if (isEqual(combinedItem, item)) {
        combinedItem.ids = [...combinedItemIds, cartItemRootIds[index]];
        found = true;
        break;
      } else {
        combinedItem.ids = combinedItemIds;
      }
    }
    if (!found) {
      combinedItems.push({
        ...item,
        ids: [cartItemRootIds[index]],
      });
    }
  });

  return combinedItems;
};
