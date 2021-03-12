const openProductModal = async (productData, cartId) => {
  this.event.stopPropagation();
  console.log(productData, cartId);
  window.cartId = cartId;
  quantity = 1;
  const productModalEl = document.querySelector("#product-modal");
  productModalEl.style.display = "block";
  //for buy now button(mobile)
  // if (document.getElementById("buy-now-btn") && window.screen.width > 769) {
  //   const buynowBtn = document.getElementById("buy-now-btn");
  //   buynowBtn.style.display = "none";
  // }
  const productModalCloseEl = productModalEl.querySelector(".close-btn");
  productModalCloseEl.addEventListener("click", () => {
    selectedModifiers = [];
    productModalEl.style.display = "none";
  });
  //for buy now button(mobile)
  // if (document.getElementById("buy-now-btn") && window.screen.width > 769) {
  //   const buynowBtn = document.getElementById("buy-now-btn");
  //   buynowBtn.style.display = "block";
  // }
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
