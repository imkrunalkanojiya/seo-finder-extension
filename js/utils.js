/**
 * Multiple utils functions used across all scripts
 */
const Utils = (function () {

  // const gridFloatBreakpointMax = 768 - 1;

  const toInt = value =>
    value && !Number.isNaN(value) ? Number.parseInt(value) : value;

  const isBool = value => (value ? ["true", "false"].includes(value.toLowerCase()) : false);

  const toBool = value => (value ? value.toLowerCase() === "true" : false);

  const isDef = value => value !== undefined;

  const removeClass = (element, className) =>
    element.classList.remove(className);

  const addClass = (element, className) =>
    element.classList.add(className);

  const hasClass = (element, className) =>
    element.classList.contains(className);

  const toggleClass = (element, className) => hasClass(element, className) ? removeClass(element, className) : addClass(element, className);

  const siblings = (element, matchTest) => {
    // Setup siblings array and get the first sibling
    let siblings = [];
    let sibling = element.parentNode.firstChild;

    // Loop through each sibling and push to the array
    while (sibling) {
      if (
        sibling.nodeType === 1 &&
        (matchTest && sibling.matches(matchTest)) &&
        sibling !== element
      ) {
        siblings.push(sibling);
      }

      sibling = sibling.nextSibling;
    }

    return siblings;
  };

  const queryArray = (el, parent) => {
    parent || (parent = document.body);

    return Array.prototype.slice.call(parent.querySelectorAll(el));
  };

  const isEmpty = obj => Object.keys(obj).length === 0;

  const touch = () => {
    return {
      isSupported: "ontouchstart" in document || navigator.maxTouchPoints,
      isDragging: false
    };
  };

  function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  const getResponseHeader = (obj, val) => {
    return function (key) {
      return obj[key] || val;
    };
  }

  function getAppPageUrl(page) {
    return chrome.runtime.getURL(`html/${page}.html`)
  }

  function openOrFocusAppPage(page) {
    const optionsPageUrl = getAppPageUrl(page)
    chrome.tabs.query({}, tabs => {
      let found = false
      for (let i = 0; i < tabs.length; i += 1) {
        if (optionsPageUrl === tabs[i].url) {
          found = true
          chrome.tabs.update(tabs[i].id, { selected: true }).catch(console.log)
        }
      }
      if (!found) {
        chrome.tabs.create({ url: optionsPageUrl }).catch(console.log)
      }
    })
  }

  // const promiseGenerator = function (generatorFunction, context, args, PromiseConstructor) {
  //   return new (PromiseConstructor || Promise)(function (resolve, reject) {
  //     function handleResult(result) {
  //       try {
  //         processResult(generator.next(result));
  //       } catch (error) {
  //         reject(error);
  //       }
  //     }

  //     function handleError(error) {
  //       try {
  //         processResult(generator.throw(error));
  //       } catch (error) {
  //         reject(error);
  //       }
  //     }

  //     function processResult(result) {
  //       if (result.done) {
  //         resolve(result.value);
  //       } else {
  //         (result.value instanceof PromiseConstructor ? result.value : new PromiseConstructor(function (resolve) {
  //           resolve(result);
  //         })).then(handleResult, handleError);
  //       }
  //     }

  //     var generator = generatorFunction.apply(context, args || []);
  //     processResult(generator.next());
  //   });
  // };

  function parseURI(uriString) {
    try {
      if (typeof uriString === "string") {
        return URI(uriString.trim() || "");
      }
    } catch (error) {
      console.log(uriString, error);
      return URI("");
    }
    return uriString.clone();
  }

  function resolveURL(page, url) {
    return normalizeURI(function (page, url) {
      try {
        if (!page) {
          throw new Error(i18n('FromPageIsNotAvailable'));
        }
        if (!url) {
          return parseURI("");
        }
        if (/^(mailto:)/.test(url)) {
          return parseURI("");
        }
        let resolvedURI = parseURI(url);
        resolvedURI = resolvedURI.absoluteTo(page);
        if (resolvedURI.toString().startsWith("chrome-extension:")) {
          return parseURI("");
        }
        return resolvedURI;
      } catch (error) {
        // console.log(page, url, error.message);
        return parseURI("");
      }
    }(page.toString(), url));
  }

  function normalizeURI(uri) {
    try {
      return parseURI(uri).hash("").normalize();
    } catch (error) {
      console.log("Invalid URL: " + uri);
      return parseURI("invalid-url");
    }
  }

  function parseAndNormalizeUrl(url) {
    return parseUriWithoutLocalhostReplacement(url).toString();
  }
  function parseUriWithoutLocalhostReplacement(url) {
    url = url.replace(/^localhost/g, "http://localhost");
    let parsedUrl = parseURI(url);
    if (!parsedUrl.protocol()) {
      parsedUrl.protocol("http");
      parsedUrl.port("80");
    }
    parsedUrl.hash("");
    parsedUrl.normalize();
    return parsedUrl;
  }

  const getStorage = function (keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(`Ext lastError: ${JSON.stringify(chrome.runtime.lastError)}`)
        } else {
          resolve(result);
        }
      });
    });
  };

  const setStorage = function (data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(`Ext lastError: ${JSON.stringify(chrome.runtime.lastError)}`)
        } else {
          resolve(data);
        }
      });
    });
  };

  const exportJsonToFile = function (jsonData, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  let ConcurrentReq = false;
  const BlockConcurrentReq = function (timeout) {
    if (!timeout) {
      timeout = 10000;
    }
    if (ConcurrentReq) {
      return true;
    }
    ConcurrentReq = true;
    window.setTimeout(function () {
      ConcurrentReq = false;
    }, timeout);
    return false;
  }

  const ResetBlockConcurrentReq = function (timeout) {
    window.setTimeout(function () {
      ConcurrentReq = false;
    }, timeout);
  }

  return {
    addClass,
    debounce,
    hasClass,
    isBool,
    isDef,
    isEmpty,
    queryArray,
    removeClass,
    siblings,
    toBool,
    toInt,
    toggleClass,
    touch,
    getResponseHeader,
    openOrFocusAppPage,
    parseURI,
    normalizeURI,
    resolveURL,
    // promiseGenerator,
    parseAndNormalizeUrl,
    getStorage,
    setStorage,
    exportJsonToFile,
    BlockConcurrentReq,
    ResetBlockConcurrentReq
  }

})();