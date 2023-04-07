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
    function insertToCart(beastURL) {
        console.log(browser.cookies.get({
            url: tabs.getCurrent().url,
            name: 'gqauth'
        }))
        // fetch("/api/graphql/AddToElementCart", {
        //     method: "POST",
            
        // })
    }
  
    /**
     * Listen for messages from the background script.
     * Call "insertBeast()" or "removeExistingBeasts()".
     */
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "add") {
        insertToCart(message.beastURL);
      }
    });
  })();
  