const Bg = (function () {
  const indexUrl = chrome.runtime.getURL("html/index.html");
  let browserActionUrl = "";

  const Module = {
    init: function () {
      Module.bindListeners();
    },
    bindListeners: function () {
      chrome.runtime.onInstalled.addListener(Module.onInstall);
      chrome.action.onClicked.addListener(Module.onBrowserActionClicked);
      chrome.runtime.onMessage.addListener(Module.onMessageListener);
    },
    onMessageListener: function (request, _sender, _sendResponse) {
      switch (request.action) {
        case "openPage":
          Utils.openOrFocusAppPage(request.page);
          break;
        case "getTabUrl":
          const url = browserActionUrl;
          browserActionUrl = "";
          _sendResponse({ targetUrl: url });
          break;
      }
      return true;
    },
    onInstall: async function (details) {
      if (details.reason === "install") {
        const browser = await Module.getBrowser();
        const mainfest = chrome.runtime.getManifest();
      }
    },
    onBrowserActionClicked: async function () {
      const activeTab = await Module.getActiveTabUrl();
      browserActionUrl = activeTab?.url || "";
      Module.openExtensionTab();
    },
    async focusOrCreateTab(url) {
      // const contexts = await (chrome.runtime.getContexts ? chrome.runtime.getContexts({ contextTypes: ["TAB"] }) : []);

      // if (contexts && contexts.length > 0) {
      //   const context = contexts[0];
      //   if (await Module.bringTabToFocus(context)) {
      //     return context;
      //   }
      // }

      await chrome.tabs.create({ url });
    },
    async bringTabToFocus(context) {
      try {
        await chrome.windows.update(context.windowId, { focused: true });
        await chrome.tabs.update(context.tabId, { active: true });
        return true;
      } catch (error) {
        return false;
      }
    },
    openExtensionTab() {
      Module.focusOrCreateTab(indexUrl);
    },
    async getBrowser() {
      if (navigator.userAgentData) {
        const brands = await navigator.userAgentData.getHighEntropyValues([
          "brands",
        ]);
        const brandNames = brands.brands.map((brand) => brand.brand);
        if (brandNames.includes("Microsoft Edge")) {
          return "edge";
        } else if (brandNames.includes("Firefox")) {
          return "firefox";
        } else if (brandNames.includes("Google Chrome")) {
          return "chrome";
        }
      } else {
        const userAgent = window.navigator.userAgent;
        if (/Edg/.test(userAgent)) {
          return "edge";
        } else if (/Firefox/.test(userAgent)) {
          return "firefox";
        } else if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) {
          return "chrome";
        }
      }
    },
    async getActiveTabUrl() {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      return tab;
    },
  };

  return {
    init: Module.init,
  };
})();

Bg.init();
