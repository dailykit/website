let quantity = 1;
let price = 0;
let cartItem;
let comboComponentSelections = [];
let selectedModifiers = [];
let comboProductDataForCart = {
  productId: null,
  lastComponentId: null,
  productPrice: null,
  productDiscount: null,
};

const resetStore = () => {
  cartItem = undefined;
};

const getCartItemWithModifiers = (
  cartItemInput,
  selectedModifiersInput,
  type
) => {
  console.log({ cartItemInput, selectedModifiersInput, type });
  const combinedModifiers = selectedModifiersInput.reduce(
    (acc, obj) => [...acc, ...obj.data],
    []
  );

  if (type === "combo") {
    const dataArr = cartItemInput?.childs?.data;
    const dataArrLength = dataArr.length;
    console.log("🚀 dataArrLength", dataArrLength);

    if (dataArrLength === 0) {
      cartItemInput.childs.data = combinedModifiers;
      return cartItemInput;
    } else {
      for (let i = 0; i < dataArrLength; i++) {
        const objWithModifiers = {
          ...dataArr[i],
          childs: {
            data: combinedModifiers,
          },
        };
        cartItemInput.childs.data[i] = objWithModifiers;
      }
      return cartItemInput;
    }
  } else {
    const dataArr = cartItemInput?.childs?.data[0]?.childs?.data;
    const dataArrLength = dataArr.length;
    console.log("🚀 dataArrLength", dataArrLength);

    if (dataArrLength === 0) {
      cartItemInput.childs.data[0].childs.data = combinedModifiers;
      return cartItemInput;
    } else {
      for (let i = 0; i < dataArrLength; i++) {
        const objWithModifiers = {
          ...dataArr[i],
          childs: {
            data: combinedModifiers,
          },
        };
        console.log(cartItemInput?.childs?.data[0]?.childs?.data);
        cartItemInput.childs.data[0].childs.data[i] = objWithModifiers;
      }
      return cartItemInput;
    }
  }
  return cartItemInput;
};

// 1. selectedModifiers should satisfy isRequired for all the categories
// 2. limits of multiple

const getModifiersValidator = (modifier) => {
  const checks = {};
  for (let category of modifier.categories) {
    console.log(
      "🚀 ~ file: renderProductOption.js ~ line 79 ~ getModifiersValidator ~ category",
      category
    );
    checks[category.name] = {};
    if (category.type === "multiple") {
      if (category.isRequired) {
        checks[category.name].min = category.limits.min;
      } else {
        checks[category.name].min = 0;
      }
      if (category.limits.max === null) {
        checks[category.name].max = category.options.length;
      } else {
        checks[category.name].max = category.limits.max;
      }
    }
    if (category.type === "single") {
      if (category.isRequired) {
        checks[category.name].min = 1;
        checks[category.name].max = 1;
      } else {
        checks[category.name].min = 0;
        checks[category.name].max = 1;
      }
    }
    checks[category.name].optionIds = category.options.map((op) => op.id);
  }

  console.log("CHECKS: ", checks);

  return (option) => {
    const [category] = Object.entries(checks).find(([, v]) =>
      v.optionIds.includes(option.id)
    );

    console.log("CAT", category);

    const alreadySelectedCount = selectedModifiers.filter((obj) =>
      checks[category].optionIds.includes(obj.data[0].modifierOptionId)
    ).length;
    console.log(
      "🚀 ~ file: renderProductOption.js ~ line 120 ~ return ~ alreadySelectedCount",
      alreadySelectedCount
    );
    if (alreadySelectedCount === checks[category].max) {
      return false;
    } else {
      return true;
    }
  };
};

const addModifier = (modifierOption, fn) => {
  const modifierIndex = selectedModifiers.findIndex(
    (m) => m?.data[0]?.modifierOptionId === modifierOption.id
  );
  console.log("modifierIndex", modifierIndex);
  console.log("selectedModifiers", selectedModifiers);
  if (modifierIndex === -1) {
    if (fn(modifierOption)) {
      selectedModifiers.push(modifierOption.cartItem);
      price += modifierOption.price;
      document.querySelector(
        `#modifier-checkbox-${modifierOption.id}`
      ).checked = true;
      document.getElementById("price").textContent = `$${price}`;
    } else {
      document.querySelector(
        `#modifier-checkbox-${modifierOption.id}`
      ).checked = false;
    }
  } else {
    selectedModifiers.splice(modifierIndex, 1);
    price -= modifierOption.price;
    document.getElementById("price").textContent = `$${price}`;
    document.querySelector(
      `#modifier-checkbox-${modifierOption.id}`
    ).checked = false;
  }
};

const addProduct = async () => {
  console.log(cartItem);

  if (comboProductDataForCart.productId) {
    // Working on combo product
    return addComboProduct();
  }

  const isValid = [quantity, Object.keys(cartItem).length].every(Boolean);
  if (!isValid) return;
  const updatedCartItem = getCartItemWithModifiers(cartItem, selectedModifiers);
  console.log(updatedCartItem);
  const productDetails = {
    cartId: window.cartId,
    cartItem: updatedCartItem,
    quantity,
  };
  console.log("comboComponentSelections", comboComponentSelections);

  const response = await addProductToCart(productDetails);
  if (response.data) {
    console.log(response);
    selectedModifiers = [];
    document.querySelector("#product-modal .close-btn").click();
  }
};

const addCustomizableProduct = async () => {
  const productDetails = {
    cartId: window.cartId,
    cartItem,
    quantity,
  };

  // const isValid = Object.values(productDetails).every(Boolean);

  if (!isValid) return console.log("Missing values!", productDetails);

  const response = await addProductToCart(productDetails);

  if (response.data) {
    console.log(response);
    document.querySelector("#product-modal .close-btn").click();
  }
};

const addComboProduct = async () => {
  const {
    productId,
    productPrice,
    productDiscount,
    lastComponentId,
  } = comboProductDataForCart;
  const updatedCartItem = getCartItemWithModifiers(
    cartItem,
    selectedModifiers,
    "combo"
  );
  comboComponentSelections.push({
    ...updatedCartItem,
    comboProductComponentId: lastComponentId,
  });
  comboComponentSelections = comboComponentSelections.filter(Boolean);

  const preparedCartItem = {
    productId,
    unitPrice: productPrice,
    childs: {
      data: comboComponentSelections,
    },
  };

  console.log(
    "🚀 ~ file: renderProductOption.js ~ line 119 ~ addComboProduct ~ preparedCartItem",
    preparedCartItem
  );

  const productDetails = {
    cartId: window.cartId,
    quantity,
    cartItem: preparedCartItem,
  };

  const isValid = Object.values(productDetails).every(Boolean);

  if (!isValid) return console.log("Missing values!", productDetails);

  const response = await addProductToCart(productDetails);

  if (response.data) {
    console.log(response);
    document.querySelector("#product-modal .close-btn").click();
  }
};

const updateQty = (operation) => {
  let updatedQuantity;

  switch (operation) {
    case "dec": {
      updatedQuantity = quantity === 1 ? quantity : quantity - 1;
      break;
    }
    case "inc": {
      updatedQuantity = quantity + 1;
      break;
    }
    default: {
      updatedQuantity = 1;
    }
  }

  document.querySelector("#quantity").textContent = updatedQuantity;
  quantity = updatedQuantity;
};

const updateQtyWithPrice = (operation, oldPrice) => {
  console.log(price);
  let updatedQuantity;
  let updatedPrice;
  switch (operation) {
    case "dec": {
      updatedQuantity = quantity === 1 ? quantity : quantity - 1;
      break;
    }
    case "inc": {
      updatedQuantity = quantity + 1;
      break;
    }
    default: {
      updatedQuantity = 1;
    }
  }
  updatedPrice = updatedQuantity * price;
  document.querySelector("#quantity").textContent = updatedQuantity;
  document.querySelector("#price").textContent = `$${updatedPrice}`;
  quantity = updatedQuantity;
};

const nextComponent = (componentId, currentIndex) => {
  console.log("Next component called...");
  const updatedCartItem = getCartItemWithModifiers(
    cartItem,
    selectedModifiers,
    "combo"
  );
  console.log("🚀 nextComponent ~ updatedCartItem", updatedCartItem);
  comboComponentSelections[currentIndex] = {
    ...updatedCartItem,
    comboProductComponentId: componentId,
  };
  console.log("🚀 comboComponentSelections", comboComponentSelections);
  selectedModifiers = [];
  setComboComponentIndex(currentIndex + 1);
};

const prevComponent = (currentIndex) => {
  setComboComponentIndex(currentIndex - 1);
};

const setComboComponentIndex = (index) => {
  const elements = Array.from(
    document.getElementsByClassName("combo-component")
  );
  const footerElements = Array.from(
    document.getElementsByClassName("combo-component-bar")
  );

  elements.forEach((el) => {
    if (index == el.getAttribute("data-index")) {
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  });
  footerElements.forEach((el) => {
    if (index == el.getAttribute("data-index")) {
      el.style.display = "flex";
    } else {
      el.style.display = "none";
    }
  });

  resetStore();
};

const getProductOption = (options, metaData) => {
  const optionsWrapperEl = document.createElement("div");
  optionsWrapperEl.setAttribute("class", "add-product-wrapper");
  const productOptionsEl = document.createElement("div");
  productOptionsEl.setAttribute("class", "product-options");
  const optionHeadingEl = document.createElement("p");
  optionHeadingEl.setAttribute("class", "product-options-heading");
  optionHeadingEl.innerHTML = "Available Options :";
  productOptionsEl.appendChild(optionHeadingEl);

  const addOnsEl = document.createElement("div");
  addOnsEl.setAttribute("class", "add-ons-wrapper");
  const addOnsHeaderEl = document.createElement("p");
  addOnsHeaderEl.setAttribute("class", "add-ons-pTag addOnsHeader");
  addOnsHeaderEl.innerHTML = "Available Add-Ons";

  for (let rootOption of options) {
    const option = rootOption?.productOption || rootOption;
    console.log(option);
    let clickedOptionId = metaData?.defaultProductOptionId;
    let checked = "";
    if (
      option?.modifier &&
      Object.keys(option?.modifier).length &&
      option?.modifier?.categories.length &&
      Object.keys(document.getElementsByClassName("addOnsHeader")).length === 0
    ) {
      addOnsEl.appendChild(addOnsHeaderEl);
    }
    const makeAddOns = () => {
      console.log("makeAddOns", rootOption?.productOption);
      if (option?.modifier && option?.modifier?.categories.length) {
        let isModifierValidFunc = getModifiersValidator(option?.modifier);

        for (let category of option?.modifier?.categories) {
          let spanHtml = "";
          const productOptionEl = document.createElement("div");
          productOptionEl.setAttribute("class", "add-ons-options");
          const productOptionHeaderEl = document.createElement("p");
          productOptionHeaderEl.setAttribute("class", "add-ons-pTag");
          if (category?.limits && Object.keys(category?.limits).length) {
            spanHtml = `<span class="addon-validation"> Choose Min:${category?.limits?.min} Max:${category?.limits?.max} </span>`;
          }
          productOptionHeaderEl.innerHTML = `
                          ${category?.name.toUpperCase()}
                          ${spanHtml}
                          `;
          productOptionEl.appendChild(productOptionHeaderEl);
          for (let modifierOption of category?.options) {
            const modifierOptionEl = document.createElement("label");
            modifierOptionEl.setAttribute("id", "labelId");
            const checkboxEl = document.createElement("input");
            checkboxEl.setAttribute("type", "checkbox");
            checkboxEl.setAttribute("name", "checkbox");
            checkboxEl.setAttribute(
              "id",
              `modifier-checkbox-${modifierOption.id}`
            );
            const spanEl = document.createElement("span");
            spanEl.textContent = modifierOption?.name;
            const smallEl = document.createElement("small");
            smallEl.textContent = `$${modifierOption?.price}`;
            spanEl.appendChild(smallEl);
            modifierOptionEl.appendChild(checkboxEl);
            modifierOptionEl.appendChild(spanEl);
            checkboxEl.addEventListener("click", (e) => {
              e.stopPropagation();
              addModifier(modifierOption, isModifierValidFunc);
            });
            productOptionEl.appendChild(modifierOptionEl);
          }

          addOnsEl.appendChild(productOptionEl);
        }
      }
    };
    const optionEl = document.createElement("div");
    optionEl.setAttribute("class", "option");
    optionEl.setAttribute("id", option?.id);
    price = metaData?.price;
    if (option?.id === clickedOptionId) {
      checked = ` <i class="far fa-check-circle"></i>`;
      makeAddOns();
    }
    console.log(option?.label);
    optionEl.innerHTML = `
              <h4 class="opt-left"> ${option?.label || ""} </h4>
                   <p class="opt-right">
                    +$${rootOption?.price?.toFixed(2)}
                     <span class="show checkedIcon" >${checked}</span>
                    </p>
               `;
    optionEl.addEventListener("click", function () {
      clickedOptionId = this.id;
      price += parseFloat(rootOption?.price);
      quantity = 1;
      document.getElementById("quantity").textContent = `${quantity}`;
      document.getElementById(
        `product-price-${metaData.componentId}`
      ).textContent = `$${metaData?.price?.toFixed(2)}`;
      document.getElementById("price").textContent = `$${price}`;
      const allOptionsWithCheckIcon = Array.from(
        document.getElementsByClassName("checkedIcon")
      );
      allOptionsWithCheckIcon.forEach((op) => {
        op.classList.remove("show");
        op.classList.add("hidden");
      });
      const allOptions = Array.from(document.getElementsByClassName("option"));
      allOptions.forEach((op) => {
        op.style.border = "1px solid teal";
      });
      this.style.border = "1px solid rgb(121,132,2)";
      this.lastElementChild.lastElementChild.classList.add("show");
      this.lastElementChild.lastElementChild.innerHTML = ` <i class="far fa-check-circle"></i>`;
      const allAddOns = Array.from(
        document.getElementsByClassName("add-ons-options")
      );
      allAddOns.forEach((op) => op.remove());
      makeAddOns();
      selectedOptionId = option.id;
      if (metaData.type === "simple") {
        cartItem = option?.cartItem;
      } else {
        cartItem = rootOption?.cartItem || rootOption?.comboCartItem;
      }
      console.log(cartItem);
    });
    productOptionsEl.appendChild(optionEl);
  }
  optionsWrapperEl.appendChild(productOptionsEl);
  optionsWrapperEl.appendChild(addOnsEl);

  const addToCartBarEl = document.createElement("div");
  addToCartBarEl.setAttribute("class", "add-to-cart-wrapper");
  console.log("if", metaData?.index);
  if (metaData?.index !== undefined) {
    console.log("if", metaData);
    addToCartBarEl.setAttribute(
      "class",
      "add-to-cart-wrapper combo-component-bar"
    );
  }
  addToCartBarEl.setAttribute("data-index", metaData?.index);
  addToCartBarEl.innerHTML = `
             <div class="add-to-cart-btn">
                    <div class="btn-counter">
                      <button class="counter-btn" onclick="updateQtyWithPrice('dec', ${price})">&#8722;</button>
                      <span class="qty" id="quantity"> ${quantity} </span>
                      <button class="counter-btn" onclick="updateQtyWithPrice('inc',${price})">+</button>
                      <span class="price" id="price">$${metaData?.price}  </span>
                    </div>
                    <div class="add-to-cart" onclick="addProduct()">
                      <span class="add-action" >
                        Add to Cart
                        <i class="fas fa-chevron-right"></i>
                      </span>
                    </div>
                  </div>

              `;
  return {
    optionsWrapperEl,
    addToCartBarEl,
  };
};

const getSimpleProductNode = (component, metaData) => {
  console.log(component);
  const { id, selectedOptions, linkedProduct: product } = component;

  const node = document.createDocumentFragment();
  if (product.assets && product.assets.images.length) {
    const imageEl = document.createElement("img");
    imageEl.setAttribute("src", product.assets.images[0]);
    imageEl.setAttribute("class", "product-image");
    node.appendChild(imageEl);
  }

  const topEl = document.createElement("div");
  topEl.setAttribute("class", "product-top");

  const nameEl = document.createElement("h3");
  nameEl.setAttribute("class", "product-name");
  nameEl.textContent = product.name;
  topEl.appendChild(nameEl);

  const priceEl = document.createElement("h4");
  priceEl.setAttribute("class", "product-price");
  priceEl.setAttribute("id", `product-price-${id}`);
  priceEl.textContent = `$${metaData.price}`;
  topEl.appendChild(priceEl);

  node.appendChild(topEl);
  const { optionsWrapperEl, addToCartBarEl } = getProductOption(
    selectedOptions,
    { ...metaData, componentId: id }
  );

  node.appendChild(optionsWrapperEl);

  return { node, addToCartBarEl };
};

const getCustomizableProductNode = (component, metaData) => {
  const { id, linkedProduct: product } = component;

  const node = document.createDocumentFragment();
  let result = {};
  product.customizableProductComponents.forEach((customizableComponent) => {
    const customizableComponentEl = document.createElement("div");
    customizableComponentEl.setAttribute("class", "customizable-option");

    const customizableComponentBtnEl = document.createElement("button");
    customizableComponentBtnEl.setAttribute("class", "customizable-option-btn");
    customizableComponentBtnEl.textContent =
      customizableComponent.linkedProduct.name;

    const customizableComponentDisplayEl = document.createElement("div");
    customizableComponentDisplayEl.setAttribute(
      "class",
      "customizable-option-display"
    );
    const { node: displayFragment, addToCartBarEl } = getSimpleProductNode(
      customizableComponent,
      metaData
    );
    customizableComponentDisplayEl.appendChild(displayFragment);

    customizableComponentBtnEl.addEventListener("click", function () {
      selectedModifiers = [];
      console.log(metaData);
      price = metaData?.price;
      const allBtns = Array.from(
        document.getElementsByClassName("customizable-option-btn")
      );
      allBtns.forEach((display) => display.classList.remove("active"));
      const allDisplays = Array.from(
        document.getElementsByClassName("customizable-option-display")
      );
      allDisplays.forEach((display) => display.classList.remove("active"));

      this.nextSibling.classList.add("active");
      this.classList.add("active");
    });

    customizableComponentEl.appendChild(customizableComponentBtnEl);
    customizableComponentEl.appendChild(customizableComponentDisplayEl);

    node.appendChild(customizableComponentEl);
    result = { ...result, addToCartBarEl };
  });
  return { node, ...result };
};

const renderProductOption = async (productId, cartId) => {
  // Cleaning
  comboProductDataForCart = {
    productId: null,
    productPrice: null,
    productDiscount: null,
    lastComponentId: null,
  };

  console.log(productId, cartId);
  window.cartId = cartId;
  quantity = 1;
  let product = {};
  let returnResult = {
    productOpt: [],
    footerContent: [],
  };
  let metaData = {};
  const response = await getProductData(productId);
  if (response.data) {
    const res = response.data;
    if (res && res?.products.length) {
      product = res?.products[0];
      metaData = {
        price: product.price,
        defaultProductOptionId: product.defaultProductOptionId,
        discount: product.discount,
        componentId: product.id,
        type: product.type,
      };
    }
  }

  switch (product.type) {
    case "simple": {
      const { optionsWrapperEl, addToCartBarEl } = await getProductOption(
        product?.productOptions,
        metaData
      );
      returnResult = {
        productOpt: [optionsWrapperEl],
        footerContent: [addToCartBarEl],
      };
      break;
    }
    case "customizable": {
      product.customizableProductComponents.forEach((customizableComponent) => {
        const customizableComponentEl = document.createElement("div");
        customizableComponentEl.setAttribute("class", "customizable-option");

        const customizableComponentBtnEl = document.createElement("button");
        customizableComponentBtnEl.setAttribute(
          "class",
          "customizable-option-btn"
        );
        customizableComponentBtnEl.textContent =
          customizableComponent.linkedProduct.name;

        const customizableComponentDisplayEl = document.createElement("div");
        customizableComponentDisplayEl.setAttribute(
          "class",
          "customizable-option-display"
        );

        const { node: displayFragment, addToCartBarEl } = getSimpleProductNode(
          customizableComponent,
          metaData
        );
        customizableComponentDisplayEl.appendChild(displayFragment);

        customizableComponentBtnEl.addEventListener("click", function () {
          selectedModifiers = [];
          console.log(metaData);
          price = metaData?.price;
          document.getElementById("price").textContent = `$${price}`;
          const allBtns = Array.from(
            document.getElementsByClassName("customizable-option-btn")
          );
          allBtns.forEach((display) => display.classList.remove("active"));
          const allDisplays = Array.from(
            document.getElementsByClassName("customizable-option-display")
          );
          allDisplays.forEach((display) => display.classList.remove("active"));

          this.nextSibling.classList.add("active");
          this.classList.add("active");
          customizableComponentId = customizableComponent.id;
        });

        customizableComponentEl.appendChild(customizableComponentBtnEl);
        customizableComponentEl.appendChild(customizableComponentDisplayEl);
        returnResult = {
          ...returnResult,
          productOpt: [...returnResult.productOpt, customizableComponentEl],
          footerContent: [addToCartBarEl],
        };
      });

      break;
    }
    case "combo": {
      const length = product.comboProductComponents.length;

      // Cheap Hacks
      comboProductDataForCart = {
        productId: product.id,
        productPrice: product.price,
        productDiscount: product.discount,
        lastComponentId: product.comboProductComponents[length - 1].id,
      };

      comboComponentSelections = Array.from({ length }).fill(null);

      console.log(comboComponentSelections);

      product.comboProductComponents.forEach((component, index) => {
        const containerEl = document.createElement("div");
        containerEl.setAttribute("class", "combo-component");
        containerEl.setAttribute("data-index", index);

        const headerEl = document.createElement("div");
        headerEl.setAttribute("class", "combo-component-header");
        headerEl.innerHTML = `
                <h4> ${component.label} </h4>
             `;
        if (index !== 0) {
          headerEl.innerHTML =
            `<span class="backIconWrapper" onClick="prevComponent(${index})"><i class="fas fa-arrow-left"></i></span>` +
            headerEl.innerHTML;
        }

        containerEl.appendChild(headerEl);

        const { node: productFragment, addToCartBarEl } =
          component.linkedProduct.type === "simple"
            ? getSimpleProductNode(component, { ...metaData, index })
            : getCustomizableProductNode(component, { ...metaData, index });

        containerEl.appendChild(productFragment);
        console.log("combo", index);
        if (index === length - 1) {
          console.log("if statement", index, length);
          returnResult = {
            ...returnResult,
            footerContent: [...returnResult.footerContent, addToCartBarEl],
          };
        } else {
          console.log("else", index, length);
          const footerBarEl = document.createElement("div");
          footerBarEl.setAttribute("class", "combo-component-bar proceed-bar");
          footerBarEl.setAttribute("data-index", index);
          footerBarEl.innerHTML = `
                         <span class="cta" onclick="nextComponent(${component.id}, ${index})">
                            Proceed to next item &#62;

                         </span>

                     `;
          returnResult = {
            ...returnResult,
            footerContent: [...returnResult.footerContent, footerBarEl],
          };
        }
        returnResult = {
          ...returnResult,
          productOpt: [...returnResult.productOpt, containerEl],
        };
      });

      break;
    }
    default: {
      const errorEl = document.createElement("small");
      errorEl.textContent = "Product type doesn't exist!";
      const errorElFooter = document.createElement("small");
      errorElFooter.textContent = "Try again for another product!";
      errorElFooter.style.color = "#000";
      returnResult = {
        productOpt: [errorEl],
        footerContent: [errorElFooter],
      };
    }
  }
  console.log("");

  return returnResult;
};
