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
      resp.json().then(response => {
        let opLineItemIds = getOverpricedLineItemIds(items, response)
        removeLineItemIdsFromCart(auth, opLineItemIds, bestseller)
      })
      location.reload();
    }).catch(err => {
      console.log("Error:", err);
    })
  }
  
  function getOverpricedLineItemIds(items, response)
  {
    debugger
    let lineItems = response.data.addToElementCart.lineItems
    
    let toRemove = []
    
    items.forEach(item => {
      
      let relevantLineItem = lineItems.find(lineItem => {
        return String(item.SKU) === String(lineItem.elementVariant.id)
      })
      if (!relevantLineItem) {
        alert("Line item " + item.SKU + "not found in line item list?!")
      }
      else if (Number.parseInt(relevantLineItem.price.centAmount) > Number.parseInt(item.maxPrice)) {
        console.log("adding " + item.SKU + " to remove list with line item id " + relevantLineItem.id)
        toRemove.push(relevantLineItem.id)
      }
    })
  }
  
  function removeLineItemIdsFromCart(auth, lineItemIds, bestseller)
  {
    console.log("removing from cart");
    console.log(auth)
    fetch('https://www.lego.com/api/graphql/RemoveFromElementCart', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": auth,
        "x-locale": "en-GB"
      },
      body: JSON.stringify(
        {
          "operationName": "RemoveFromElementCart",
          "variables": {
              "lineItemIds": lineItemIds,
              "cartType": bestseller ? 'pab' : 'bap'
          },
          "query": "mutation RemoveFromElementCart($lineItemIds: [String!]!, $cartType: CartType) {\n  removeFromElementCart(input: {lineItemIds: $lineItemIds, cartType: $cartType}) {\n    ...BrickCartData\n    ...MinifigureCartData\n    __typename\n  }\n}\n\nfragment BrickCartData on BrickCart {\n  id\n  type\n  taxedPrice {\n    totalGross {\n      formattedAmount\n      formattedValue\n      currencyCode\n      __typename\n    }\n    __typename\n  }\n  totalPrice {\n    formattedAmount\n    formattedValue\n    currencyCode\n    __typename\n  }\n  lineItems {\n    ...LineItemData\n    __typename\n  }\n  subTotal {\n    formattedAmount\n    formattedValue\n    __typename\n  }\n  shippingMethod {\n    price {\n      formattedAmount\n      __typename\n    }\n    shippingRate {\n      formattedAmount\n      __typename\n    }\n    minimumFreeShippingAmount {\n      formattedAmount\n      formattedValue\n      __typename\n    }\n    isFree\n    __typename\n  }\n  __typename\n}\n\nfragment LineItemData on PABCartLineItem {\n  id\n  quantity\n  element {\n    id\n    name\n    __typename\n  }\n  price {\n    centAmount\n    currencyCode\n    __typename\n  }\n  elementVariant {\n    id\n    attributes {\n      designNumber\n      deliveryChannel\n      maxOrderQuantity\n      __typename\n    }\n    __typename\n  }\n  totalPrice {\n    formattedAmount\n    __typename\n  }\n  __typename\n}\n\nfragment MinifigureCartData on MinifigureCart {\n  id\n  taxedPrice {\n    totalGross {\n      formattedAmount\n      formattedValue\n      currencyCode\n      __typename\n    }\n    __typename\n  }\n  totalPrice {\n    formattedAmount\n    formattedValue\n    currencyCode\n    __typename\n  }\n  minifigureData {\n    ...MinifigureDataTupleData\n    __typename\n  }\n  __typename\n}\n\nfragment MinifigureDataTupleData on MinifigureDataTuple {\n  figureId\n  elements {\n    ...MinifigureLineItemData\n    __typename\n  }\n  __typename\n}\n\nfragment MinifigureLineItemData on PABCartLineItem {\n  id\n  elementVariant {\n    id\n    attributes {\n      indexImageURL\n      backImageURL\n      isShort\n      __typename\n    }\n    __typename\n  }\n  metadata {\n    minifigureCategory\n    bamFigureId\n    __typename\n  }\n  __typename\n}"
      })
    }).then(resp => {
      console.log("removed without error")
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
