(() => {
  /**
  * Check and set a global guard variable.
  * If this content script is injected into the same page again,
  * it will do nothing next time.
  */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;
  
  /**
  * Given a URL to a beast image, remove all existing beasts, then
  * create and style an IMG node pointing to
  * that image, then insert the node into the document.
  */
  function insertToCart(auth, items, bestseller) {
    console.log("adding to cart");
    console.log(auth)
    let itemsMapped = items.map(val => {
      return {
        "sku": String(val.SKU),
        "quantity": Number.parseInt(val.qty)
      }
    });
    fetch('https://www.lego.com/api/graphql/AddToElementCart', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": auth,
        "x-locale": "en-GB"
      },
      body: JSON.stringify(
        {
          "operationName": "AddToElementCart",
          "variables": {
              "items": itemsMapped,
              "cartType": bestseller ? 'pab' : 'bap'
          },
          "query": "mutation AddToElementCart($items: [ElementInput!]!, $cartType: CartType) {\n  addToElementCart(input: {items: $items, cartType: $cartType}) {\n    ...BrickCartData\n    ...MinifigureCartData\n    __typename\n  }\n}\n\nfragment BrickCartData on BrickCart {\n  id\n  type\n  taxedPrice {\n    totalGross {\n      formattedAmount\n      formattedValue\n      currencyCode\n      __typename\n    }\n    __typename\n  }\n  totalPrice {\n    formattedAmount\n    formattedValue\n    currencyCode\n    __typename\n  }\n  lineItems {\n    ...LineItemData\n    __typename\n  }\n  subTotal {\n    formattedAmount\n    formattedValue\n    __typename\n  }\n  shippingMethod {\n    price {\n      formattedAmount\n      __typename\n    }\n    shippingRate {\n      formattedAmount\n      __typename\n    }\n    minimumFreeShippingAmount {\n      formattedAmount\n      formattedValue\n      __typename\n    }\n    isFree\n    __typename\n  }\n  __typename\n}\n\nfragment LineItemData on PABCartLineItem {\n  id\n  quantity\n  element {\n    id\n    name\n    __typename\n  }\n  price {\n    centAmount\n    currencyCode\n    __typename\n  }\n  elementVariant {\n    id\n    attributes {\n      designNumber\n      deliveryChannel\n      maxOrderQuantity\n      __typename\n    }\n    __typename\n  }\n  totalPrice {\n    formattedAmount\n    __typename\n  }\n  __typename\n}\n\nfragment MinifigureCartData on MinifigureCart {\n  id\n  taxedPrice {\n    totalGross {\n      formattedAmount\n      formattedValue\n      currencyCode\n      __typename\n    }\n    __typename\n  }\n  totalPrice {\n    formattedAmount\n    formattedValue\n    currencyCode\n    __typename\n  }\n  minifigureData {\n    ...MinifigureDataTupleData\n    __typename\n  }\n  __typename\n}\n\nfragment MinifigureDataTupleData on MinifigureDataTuple {\n  figureId\n  elements {\n    ...MinifigureLineItemData\n    __typename\n  }\n  __typename\n}\n\nfragment MinifigureLineItemData on PABCartLineItem {\n  id\n  elementVariant {\n    id\n    attributes {\n      indexImageURL\n      backImageURL\n      isShort\n      __typename\n    }\n    __typename\n  }\n  metadata {\n    minifigureCategory\n    bamFigureId\n    __typename\n  }\n  __typename\n}"
      })
    }).then(resp => {
      //here we need to read the response, find any over price, and remove them!
      //ideally need some sort of feedback to the sidebar to say what was added and what was removed etc. (and at what price)
      debugger
      console.log(resp.json());
      // location.reload();
    }).catch(err => {
      console.log("Error:", err);
    })
  }
  
  /**
  * Listen for messages from the background script.
  * Call "insertBeast()" or "removeExistingBeasts()".
  */
  browser.runtime.onMessage.addListener((message) => {
    console.log("recieved message")
    console.log(message)
    if (message.command === "add") {
      console.log("recieved add message")
      insertToCart(message.auth, message.items, message.bestseller);
    }
  });
})();
