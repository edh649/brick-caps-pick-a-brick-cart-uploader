var items = [];
var logList = [];
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
          insertIntoLog("Adding item to insert list");
          let sku = document.getElementById('skuInput').value
          items = items.filter(item => {
            return item.SKU !== sku
          })
          items.push({
            SKU: sku,
            qty: document.getElementById('quantityInput').value,
            maxPrice: document.getElementById('priceUnitMaxInput').value
          });
          loadItemsContainer();
        break;
        
        case 'clearItems':
          items = []
          loadItemsContainer();
          break;
          
        case 'clearLog':
          logList = []
          insertIntoLog("Cleared Log");
          break;
          
        case 'insertScript':
          insertScript()
          break;
          
        case 'loadCsv':
          loadCSV()
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
      const line = document.createTextNode(item.SKU + " (" + item.qty + ")" + "[<£" + item.maxPrice/100 + "]")
      textContainer.appendChild(line)
      container.appendChild(textContainer)
    });
  }
  
  function loadCSV() {
    insertIntoLog("Reading from CSV")
    var reader = new FileReader();
    let text = reader.readAsText(document.getElementById("csvFilePicker").files[0])
    reader.onload = function (e) {
      parseCSV(e.target.result)
    }
  }
  
  function parseCSV(fileString) {
    insertIntoLog("Parsing CSV")
    let buffer = "";
    let objBuffer = [];
    let line = 0;
    for (let index = 0; index < fileString.length; index++) {
      let char = fileString[index]
      
      if (char == ",") {
        objBuffer.push(buffer);
        buffer = "";
      }
      else if (char == "\n") {
        line = line + 1;
        objBuffer.push(buffer);
        buffer = "";
        if (line != 1) {
          items.push({
            SKU: objBuffer[0],
            qty: objBuffer[1],
            maxPrice: objBuffer[2]
          });
        }
        objBuffer = []
      }
      else
      {
        buffer = buffer + fileString[index]
      }
    }
    loadItemsContainer();
    insertIntoLog("Imported CSV")
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
  function insertScript() {
    insertIntoLog("Inserting script into webpage");
    browser.tabs
    .executeScript({ file: "/content_scripts/modify.js" })
    .then(listenForClicks)
    .catch(reportExecuteScriptError);
  }
  insertScript();
  
  
  function handleMessage(request, sender, sendResponse) {
    if (request.command == "log")
    {
      console.log(`A content script sent a message: ${request.message}`);
      insertIntoLog(request.message);
    }
  }
  
  
  function insertIntoLog(message) {
    logList.reverse()
    logList.push(message)
    logList.reverse()
    let container = document.getElementById('log')
    container.replaceChildren([])
    logList.forEach(item => {
      const textContainer = document.createElement('p');
      const line = document.createTextNode(item)
      textContainer.appendChild(line)
      container.appendChild(textContainer)
    });
  }
  
  browser.runtime.onMessage.addListener(handleMessage);