var items = [];
/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
  document.addEventListener("click", (e) => {    
    
    function insertSkus(bestseller) {
      browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {        
        browser.cookies
        .getAll({
          name: 'gqauth'
        })
        .then(cookies => {
          console.log("sending add message")
          browser.tabs.sendMessage(tabs[0].id, {
            command: "add",
            auth: cookies[0].value,
            bestseller: bestseller,
            items: items,
          })});
        }, console.error)
      }
      
      if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
        // Ignore when click is not on a button within <div id="popup-content">.
        return;
      }
      
      console.log(e.target.id)
      
      switch (e.target.id) {
        case "insertBestseller":
        browser.tabs.query({active: true, currentWindow: true})
        .then(insertSkus(true))
        .catch(err => { console.error(`Error: ${error}`)});
        break;
        
        case 'insertStandard':
        browser.tabs.query({active: true, currentWindow: true})
        .then(insertSkus(false))
        .catch(err => { console.error(`Error: ${error}`)});
        break;
        
        case 'addItem':
          items.push({
            SKU: document.getElementById('skuInput').value,
            qty: document.getElementById('quantityInput').value,
            maxPrice: document.getElementById('priceUnitMaxInput').value
          });
          loadItemsContainer();
        break;
        
        case 'clearItems':
          items = []
          loadItemsContainer();
          break;
        
        default:
        console.log(`Unexpected button id ${e.target.id}`)
        break;
      }
    });
  }
  
  function loadItemsContainer() {
    let container = document.getElementById('itemsContainer')
    container.replaceChildren([])
    items.forEach(item => {
      const textContainer = document.createElement('p');
      const line = document.createTextNode(item.SKU + " (" + item.qty + ")" + "[<£" + item.maxPrice + "]")
      textContainer.appendChild(line)
      container.appendChild(textContainer)
    });
  }
  
  /**
  * There was an error executing the script.
  * Display the popup's error message, and hide the normal UI.
  */
  function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute insert content script: ${error.message}`);
  }
  
  /**
  * When the popup loads, inject a content script into the active tab,
  * and add a click handler.
  * If we couldn't inject the script, handle the error.
  */
  browser.tabs
  .executeScript({ file: "/content_scripts/modify.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
  