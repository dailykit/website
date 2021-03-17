const openProductModal = async (productData, cartId) => {
  this.event.stopPropagation();
  console.log(productData, cartId);
  window.cartId = cartId;
  quantity = 1;

  // modal open
  const productModalEl = document.querySelector("#product-modal");
  const productModalContent = productModalEl.children[0];
  productModalEl.style.display = "block";
  document.getElementsByTagName("body")[0].style.overflow = "hidden";
  console.log("productMOdal", productModalContent);
  if (productModalContent.classList.contains("slidesDown")) {
    productModalContent.classList.remove("slidesDown");
    productModalContent.classList.add("slidesUp");
  } else {
    productModalContent.classList.add("slidesUp");
  }
  // modal close
  const productModalCloseEl = productModalEl.querySelector(".close-btn");
  productModalCloseEl.addEventListener("click", () => {
    selectedModifiers = [];
    if (productModalContent.classList.contains("slidesUp")) {
      productModalContent.classList.remove("slidesUp");
      productModalContent.classList.add("slidesDown");
    } else {
      productModalContent.classList.add("slidesDown");
    }
    productModalEl.style.display = "none";
    document.getElementsByTagName("body")[0].style.overflow = "auto";

    // reseting the global variables
    quantity = 1;
    price = 0;
    previousOptionPrice = 0;
    previousModifierPrice = 0;
    cartItem;
    comboComponentSelections = [];
    comboModifiersPrice = [];
    selectedModifiers = [];
    comboProductDataForCart = {
      productId: null,
      lastComponentId: null,
      productPrice: null,
      productDiscount: null,
    };
    comboComponentIndex = null;
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == productModalEl) {
      if (productModalContent.classList.contains("slidesUp")) {
        productModalContent.classList.remove("slidesUp");
        productModalContent.classList.add("slidesDown");
      } else {
        productModalContent.classList.add("slidesDown");
      }
      productModalEl.style.display = "none";
      document.getElementsByTagName("body")[0].style.overflow = "auto";
    }
  };
  const body = productModalEl.querySelector(".modal-body");
  const footer = productModalEl.querySelector(".modal-footer");
  const fragment = document.createDocumentFragment();
  // body.innerHTML = modifierHtml;
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
  while (footer.firstChild) {
    footer.removeChild(footer.firstChild);
  }
  switch (productData.type) {
    case "simple":
      if (productData.assets && productData.assets.images.length) {
        const imageEl = document.createElement("img");
        imageEl.setAttribute("src", productData.assets.images[0]);
        imageEl.setAttribute("class", "product-image");
        fragment.appendChild(imageEl);
      }
      const topEl = document.createElement("div");
      topEl.setAttribute("class", "product-top");
      const nameEl = document.createElement("h3");
      nameEl.setAttribute("class", "product-name");
      nameEl.textContent = productData.name;
      topEl.appendChild(nameEl);
      // const priceEl = document.createElement("h4");
      // priceEl.setAttribute("class", "product-price");
      // priceEl.setAttribute("id", `product-price-${productData.id}`);
      // priceEl.textContent = `$${productData.price}`;
      // topEl.appendChild(priceEl);
      fragment.appendChild(topEl);
      break;
  }
  const { productOpt, footerContent } = await renderProductOption(
    productData.id,
    cartId
  );
  productOpt.forEach(async (p) => {
    fragment.appendChild(p);
  });
  footerContent.forEach(async (f) => {
    await footer.appendChild(f);
  });
  body.appendChild(fragment);
  if (productData.type === "combo") {
    setComboComponentIndex(0);
  } else {
    comboComponentIndex = null;
  }
  console.log("comboComponentIndex", comboComponentIndex);
};
