(function () {
  const $vLayout = $("#vLayout");
  const $mainBody = $(".mainBody");
  const $sidenav_content = $("#sidenav_content");
  const $homeMain = $("#homeMain");
  const $dashboardMain = $("#dashboardMain");
  // const $urlReportMain = $('#urlReportMain');
  const $contentMain = $("#contentMain");
  const $contentMainHeader = $("#contentMainHeader", $contentMain);
  const $auditReportMain = $("#auditReportMain");
  const $homeSidebar = $("#homeSidebar");
  const $dashboardSidebar = $("#dashboardSidebar");
  const $input_url = $("#input_url", $homeMain);
  const $start_btn = $("#start_btn", $homeMain);
  const $loadingModal = $("#loading_modal");
  const $loadingModalStatus = $("#loadingModalStatus");
  const $loading_list = $("#loading_list", $loadingModal);
  // const $loading_progress = $("#loading_progress", $loadingModal);
  const $checks_per_second = $("#checks_per_second", $loadingModal);
  const $urls_to_check = $("#urls_to_check", $loadingModal);
  const $urls_checked = $("#urls_checked", $loadingModal);
  const $failed_responses = $("#failed_responses", $loadingModal);
  const $threshold_explored = $("#threshold_explored", $loadingModal);
  const $duration = $("#duration", $loadingModal);
  const $continue_crawling_btn = $("#continue_crawling_btn", $sidenav_content);
  const $start_new_btn = $("#start_new_btn", $sidenav_content);
  // const $user_name = $('#user_name', $homeSidebar);
  // const $password = $('#password', $homeSidebar);
  const $win = $(window);

  const state = {
    url: "",
    urlTagList: [],
    result: {},
    responseHeaders: {},
    requestMetadata: {},
    statistics: new ReportStatistics(),
    dashboard: {},
    groupedReports: {},
    isDashboard: false,
  };

  const privateState = {
    urls: {},
    urlCompleted: {},
    urlInProcess: {},
    progress: {},
    redirects: {},
    // responses: {},
    redirectsByReqtId: {},
    previousUrlRedirectToByRequestId: {},
    // crawlResults: {},
    crawlReports: [],
    robotsData: {},
    // cloudflareDelay: 0,
    // isCloudFlareDelay: false
  };

  const Module = {
    init: function () {
      Localize.init();
      sideNav();
      feather.replace();
      Module.initProgress();
      Module.showHome();
      // Module.showAuditReport();
      // Module.openAuditReportPage();
      Module.initSettings();
      Module.requestTrackerInit();
      Module.bindListeners();
      const noHashURL = window.location.href.replace(/#.*$/, "");
      window.history.replaceState("", document.title, noHashURL);
    },
    bindListeners: function () {
      // chrome.runtime.onMessage.addListener(Module.onMessageListener);
      $homeMain.on("input", "#input_url", Module.onInputUrlInput);
      $homeMain.on("click", "#start_btn", Module.onStartBtnClick);
      $homeMain.on("keypress", "#input_url", Module.onInputKeypress);
      $sidenav_content.on("click", "#start_new_btn", Module.onStartNewBtnClick);
      $sidenav_content.on(
        "click",
        "#continue_crawling_btn",
        Module.onContinueCrawlingBtnClick
      );
      $loadingModal.on(
        "click",
        "#finish_see_results",
        Module.onFinishSeeResults
      );
      $loadingModal.on(
        "click",
        "#pause_or_continue_crawl",
        Module.onPauseOrContinueCrawl
      );
      $vLayout.on("click", ".refreshBtn", Module.onRefreshBtnClick);
      $vLayout.on("click", ".htmlBtn", Module.onHtmlBtnClick);
      $vLayout.on("click", ".copyBtn", Module.onCopyBtnClick);
      $sidenav_content.on(
        "click",
        "#restoreDefaultSettings",
        Module.onRestoreDefaultSettingsClick
      );
      $sidenav_content.on(
        "change",
        "#thresholdLevel",
        Module.onThresholdLevelChange
      );
      $sidenav_content.on("input", "#urlLimit", Module.onMaxUrlsChange);
      $sidenav_content.on(
        "change",
        "#processInDepthDir",
        Module.onCrawlAboveInitialDirectoryChange
      );
      $sidenav_content.on(
        "change",
        "#processSubDomains",
        Module.onCrawlOtherSubdomainsChange
      );
      // $sidenav_content.on('change keyup paste', '#excludePattern', Module.onExclusionRegexChange);
      $sidenav_content.on(
        "change",
        "#processNoIndexedPages",
        Module.onCrawlNoIndexedPagesChange
      );
      $sidenav_content.on(
        "change",
        "#processIntLinks",
        Module.onCrawlPageInternalLinksChange
      );
      $sidenav_content.on(
        "change",
        "#processExtLinks",
        Module.onCrawlPageExternalLinksChange
      );
      $sidenav_content.on(
        "change",
        "#processPageImages",
        Module.onCrawlPageImagesChange
      );
      $sidenav_content.on(
        "change",
        "#processPageJavascript",
        Module.onCrawlPageJsChange
      );
      $sidenav_content.on(
        "change",
        "#processPageCss",
        Module.onCrawlPageCssChange
      );
      $sidenav_content.on(
        "change",
        "#processRobotFile",
        Module.onCrawlRobotsFilesChange
      );
      $sidenav_content.on(
        "change",
        "#processNotFoundTesting",
        Module.onCrawlNotFoundTestUrlsChange
      );
      $sidenav_content.on("input", "#userAgent", Module.onUserAgentChange);
      $sidenav_content.on(
        "input",
        "#responseTimeout",
        Module.onResponseTimeoutChange
      );
      $sidenav_content.on(
        "input",
        "#urlLimitToProcessPerSec",
        Module.onMaxUrlsToCrawlPerSecondChange
      );
      $sidenav_content.on("click", "#exportToCsv", Module.onExportToCsvClick);
      $sidenav_content.on(
        "click",
        "#exportToJsonFile",
        Module.onExportToJsonFileClick
      );
      $sidenav_content.on(
        "click",
        "#importFromFile",
        Module.onImportFromFileClick
      );
      $sidenav_content.on(
        "change",
        "#importDataFileInput",
        Module.onChangeImportFromFile
      );
      SEO_CHECKER_CONFIG.showAuditReport &&
        $auditReportMain.on("click", "#printBtn", Module.onPrint);
      $win.on("hashchange", Module.onHashChange);
    },
    async initSettings(isDefault) {
      state["urlOptions"] = _.clone(defaultSettings);
      if (isDefault) {
        await Utils.setStorage({ scSettings: state.urlOptions });
      } else {
        const { scSettings } = await Utils.getStorage(["scSettings"]);
        Object.assign(state.urlOptions, scSettings);
      }
      const url = await getTabUrl();
      state.urlOptions.targetUrl = url;
      $input_url.val(url);
      Module.onInputUrlInput();
      $("#thresholdLevel", $sidenav_content).val(
        state.urlOptions.thresholdLevel
      );
      $("#urlLimit", $sidenav_content).val(state.urlOptions.urlLimit);
      $("#processInDepthDir", $sidenav_content).prop(
        "checked",
        state.urlOptions.processInDepthDir
      );
      $("#processSubDomains", $sidenav_content).prop(
        "checked",
        state.urlOptions.processSubDomains
      );
      // $('#excludePattern', $sidenav_content).val(state.urlOptions.excludePattern)
      $("#processNoIndexedPages", $sidenav_content).prop(
        "checked",
        state.urlOptions.processNoIndexedPages
      );
      $("#processIntLinks", $sidenav_content).prop(
        "checked",
        state.urlOptions.processIntLinks
      );
      $("#processExtLinks", $sidenav_content).prop(
        "checked",
        state.urlOptions.processExtLinks
      );
      $("#processPageImages", $sidenav_content).prop(
        "checked",
        state.urlOptions.processPageImages
      );
      $("#processPageJavascript", $sidenav_content).prop(
        "checked",
        state.urlOptions.processPageJavascript
      );
      $("#processPageCss", $sidenav_content).prop(
        "checked",
        state.urlOptions.processPageCss
      );
      $("#processRobotFile", $sidenav_content).prop(
        "checked",
        state.urlOptions.processRobotFile
      );
      $("#processNotFoundTesting", $sidenav_content).prop(
        "checked",
        state.urlOptions.processNotFoundTesting
      );
      $("#userAgent", $sidenav_content).val(state.urlOptions.userAgent);
      $("#responseTimeout", $sidenav_content).val(
        state.urlOptions.responseTimeout
      );
      $("#urlLimitToProcessPerSec", $sidenav_content).val(
        state.urlOptions.urlLimitToProcessPerSec
      );

      SEO_CHECKER_CONFIG.showAuditReport &&
        $(".auditReportFeature").removeClass("d-none");
    },
    isCrawlActivePromise: new Promise((resolve, reject) => resolve("")),
    onThresholdLevelChange() {
      state.urlOptions.thresholdLevel = $(
        "#thresholdLevel",
        $sidenav_content
      ).val();
    },
    onMaxUrlsChange() {
      state.urlOptions.urlLimit = $("#urlLimit", $sidenav_content).val();
    },
    onCrawlAboveInitialDirectoryChange() {
      state.urlOptions.processInDepthDir = $(
        "#processInDepthDir",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlOtherSubdomainsChange() {
      state.urlOptions.processSubDomains = $(
        "#processSubDomains",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlNoIndexedPagesChange() {
      state.urlOptions.processNoIndexedPages = $(
        "#processNoIndexedPages",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlPageInternalLinksChange() {
      state.urlOptions.processIntLinks = $(
        "#processIntLinks",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlPageExternalLinksChange() {
      state.urlOptions.processExtLinks = $(
        "#processExtLinks",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlPageImagesChange() {
      state.urlOptions.processPageImages = $(
        "#processPageImages",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlPageJsChange() {
      state.urlOptions.processPageJavascript = $(
        "#processPageJavascript",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlPageCssChange() {
      state.urlOptions.processPageCss = $(
        "#processPageCss",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlRobotsFilesChange() {
      state.urlOptions.processRobotFile = $(
        "#processRobotFile",
        $sidenav_content
      ).is(":checked");
    },
    onCrawlNotFoundTestUrlsChange() {
      state.urlOptions.processNotFoundTesting = $(
        "#processNotFoundTesting",
        $sidenav_content
      ).is(":checked");
    },
    onUserAgentChange() {
      state.urlOptions.userAgent = $("#userAgent", $sidenav_content).val();
    },
    onResponseTimeoutChange() {
      state.urlOptions.responseTimeout = $(
        "#responseTimeout",
        $sidenav_content
      ).val();
    },
    onMaxUrlsToCrawlPerSecondChange() {
      state.urlOptions.urlLimitToProcessPerSec = $(
        "#urlLimitToProcessPerSec",
        $sidenav_content
      ).val();
    },
    getTimestampForFilename() {
      return new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/T/g, " - ")
        .replace(/:/g, ".");
    },
    renameFirstUc(str) {
      return str && str.charAt(0).toUpperCase() + str.slice(1);
    },
    initProgress() {
      privateState.progress.processedRequestsCount = 0;
      privateState.progress.failedRequestsCount = 0;
      privateState.progress.pendingRequestsCount = 0;
      privateState.progress.initiationTime = 0;
      privateState.progress.isCrawlActive = false;
      privateState.progress.exploredDepth = 0;
      privateState.progress.requestsProcessedPerSecond = 0;
      privateState.progress.pausedTime = 0;
      privateState.progress.recentUrlList = new Array(5).fill("-");
    },
    getReportFilename(res, postFix, ext = "csv") {
      const name = res.reportGenerator.name;
      const cate = Module.renameFirstUc(res.reportGenerator.category);
      return `${Module.getBaseFilename()} - ${cate} - ${name} - ${postFix}.${ext}`;
    },
    getReport(id) {
      return _.find(privateState.crawlReports, {
        id: id,
      });
    },
    save(data, name) {
      const confirmBeforeClosingWindow = state.confirmBeforeClosingWindow;
      state.confirmBeforeClosingWindow = false;
      saveAs(data, name);
      setTimeout(() => {
        state.confirmBeforeClosingWindow = confirmBeforeClosingWindow;
      }, 1050);
    },
    async createZip(blobs, zipName) {
      const zip = new JSZip();
      _.each(blobs, (blob) => zip.file(blob.filename, blob.data));
      const zipAsync = await zip.generateAsync({
        type: "blob",
        platform: "UNIX",
        streamFiles: true,
        compression: "DEFLATE",
      });
      Module.save(zipAsync, zipName);
    },
    getBaseFilename() {
      return "" + state.result.hostName;
    },
    stringToBlob(data) {
      return new Blob([data], {
        type: "text/plain;charset=utf-8;",
      });
    },
    async createCsvBlob(res) {
      const sheetGrid = XLSX.utils.aoa_to_sheet(res.gridData);
      sheetGrid["!cols"] = res.columns;
      const newBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newBook, sheetGrid, res.sheetName);
      const csv = XLSX.utils.sheet_to_csv(sheetGrid);
      return Module.stringToBlob(_.replace(csv, /\n/g, "\r\n"));
    },
    async reportToBlob(
      reportName,
      results,
      headings,
      reportGenerator,
      isExtended = false
    ) {
      const headingNames = _.map(headings, (heading) => heading.name);
      const sortedResults = _.sortBy(results, (e) => e[1]);
      sortedResults.unshift(headingNames);

      let processedResults;
      if (isExtended) {
        processedResults = sortedResults;
      } else if (reportGenerator.category === "explore") {
        processedResults = _.map(sortedResults, (row) => {
          const clonedRow = _.clone(row);
          clonedRow.splice(1, 1);
          return clonedRow;
        });
      } else {
        processedResults = _.map(sortedResults, (row) => {
          const clonedRow = _.clone(row);
          const firstElement = clonedRow[0];
          clonedRow[0] = clonedRow[1];
          clonedRow[1] = firstElement;
          return clonedRow;
        });
      }

      const stringifiedResults = _.map(processedResults, (row) =>
        _.map(row, (element) =>
          Array.isArray(element) ? String(element) : element
        )
      );
      const csvBlob = await Module.createCsvBlob({
        gridData: stringifiedResults,
        columns: [],
        headings: headingNames,
        sheetName: "Sheet",
        filename: reportName,
      });

      return {
        filename: reportName,
        data: csvBlob,
      };
    },
    async exportReports(data) {
      const timestamp = Module.getTimestampForFilename();
      const zipName = `${Module.getBaseFilename()} - ${timestamp}.zip`;
      const reportBlobs = await Promise.all(
        _.map(data, async (item) => {
          const reportName = Module.getReportFilename(item, timestamp);
          const reportGenerator = item.reportGenerator;
          const headings = reportGenerator.headings;
          const results = item.results;
          return Module.reportToBlob(
            reportName,
            results,
            headings,
            reportGenerator
          );
        })
      );
      await Module.createZip(reportBlobs, zipName);
    },
    onExportToCsvClick() {
      // Utils.showLoading();
      try {
        setTimeout(async () => {
          const data = _.reject(
            privateState.crawlReports,
            (report) => report.reportGenerator.hidden
          );
          await Module.exportReports(data);
          // Utils.hideLoading();
        }, 550);
      } catch (e) {
        //SC_LOG(2, 'onExportToCsvClick', e)
      }
    },
    createJsonBlob: async (jsonData, filename) => {
      const jsonString = JSON.stringify(jsonData);
      const jsonBlob = new Blob([jsonString], { type: "application/json" });

      return {
        filename: `${filename}.json`,
        data: jsonBlob,
      };
    },
    async exportJsonFile(jsonData, filename) {
      const timestamp = Module.getTimestampForFilename();
      const zipName = `${Module.getBaseFilename()} - ${timestamp}.zip`;

      const jsonBlob = await Module.createJsonBlob(jsonData, filename);

      await Module.createZip([jsonBlob], zipName);
    },
    onExportToJsonFileClick() {
      // Utils.showLoading();
      try {
        setTimeout(async () => {
          const filename = "data";
          await Module.exportJsonFile(state, filename);
        }, 550);
      } catch (e) {
        //SC_LOG(2, e)
      }
    },
    onImportFromFileClick() {
      $("#importDataFileInput").trigger("click");
    },
    convertToCrawlReports(data) {
      privateState.crawlReports = [];
      Object.keys(data).forEach((categoryKey) => {
        const category = data[categoryKey];
        Object.keys(category.subsections).forEach((subsectionKey) => {
          const subsection = category.subsections[subsectionKey];
          subsection.forEach((item) => {
            let filteredItem = { ...item };
            privateState.crawlReports.push(filteredItem);
          });
        });
      });
    },
    onChangeImportFromFile(event) {
      const fileInput = $("#importDataFileInput")[0];

      if (!fileInput.files || fileInput.files.length === 0) {
        scToast.show(i18n("NoFileSelected"), {
          background: "#d31919",
          color: "#fff",
          duration: 5000,
        });
        return;
      }

      const selectedFile = fileInput.files[0];
      if (!selectedFile) {
        return;
      }

      if (selectedFile.name.endsWith(".zip")) {
        const reader = new FileReader();

        reader.onload = async function (e) {
          try {
            const zip = await JSZip.loadAsync(e.target.result);
            const fileNames = Object.keys(zip.files);

            if (fileNames.length > 0) {
              // Assume the first JSON file in the ZIP
              const jsonFile = fileNames.find((name) => name.endsWith(".json"));

              if (jsonFile) {
                const jsonData = await zip.file(jsonFile).async("string");
                const parsedData = JSON.parse(jsonData);
                for (let key in state) {
                  if (state.hasOwnProperty(key)) {
                    delete state[key];
                  }
                }

                Object.assign(state, parsedData);

                if (state.crawlReports) {
                  privateState.crawlReports = state.crawlReports;
                } else {
                  Module.convertToCrawlReports(state.groupedReports);
                }

                Module.renderDashboard();
                Module.showDashboard();
              } else {
                //SC_LOG(2, 'No JSON file found in the ZIP');
              }
            }
          } catch (error) {
            //SC_LOG(2, 'Error reading ZIP file:', error);
          }
        };

        reader.readAsArrayBuffer(selectedFile);
      } else {
        const reader = new FileReader();

        reader.onload = function (e) {
          try {
            const jsonData = JSON.parse(e.target.result);

            for (let key in state) {
              if (state.hasOwnProperty(key)) {
                delete state[key];
              }
            }

            Object.assign(state, jsonData);
            if (state.crawlReports) {
              privateState.crawlReports = state.crawlReports;
            } else {
              Module.convertToCrawlReports(state.groupedReports);
            }

            Module.renderDashboard();
            Module.showDashboard();
          } catch (error) {
            //SC_LOG(2, 'Error parsing JSON:', error);
          }
        };

        reader.readAsText(selectedFile);
      }
    },
    onPrint() {
      window.print();
    },
    resetConfig: function (config) {
      return new Promise((resolve) => {
        Module.clearData();
        // state["basicAuth"] = config.basicAuth;
        state.userAgentString = config.userAgent || navigator.userAgent;
        resolve();
      });
    },
    requestTrackerInit: function () {
      return new Promise(async (resolve, reject) => {
        try {
          const currentTab = await browser.tabs.getCurrent();
          if (!currentTab || typeof currentTab.id !== "number") {
            throw new Error("tab.id not found");
          }

          Module.setupRequestTracking(currentTab.id);
          await Module.resetConfig({
            // basicAuth: state.basicAuth,
            userAgent: state.userAgentString,
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    saveRedirect(details) {
      const requestId = details.requestId;
      const from = details.from;
      const redirectData = {
        status: privateState.redirects[from]?.status || details.status,
        from: details.from,
        to: details.to,
        requestMethod: details.method,
        requestId: requestId,
        isIntDestination: details.isInternalBrowserRedirect,
        headers: Module.getResponseHeaders(details.from),
      };

      privateState.redirects[from] = redirectData;
      const redirectsList = privateState.redirectsByReqtId[requestId] || [];
      redirectsList.push(redirectData);
      privateState.redirectsByReqtId[requestId] = redirectsList;
    },
    storeResponseHeaders(url, headers) {
      const responseHeaders = {};
      headers.forEach((header) => {
        const name = header.name.toLowerCase();
        const value = header.value || "";
        const existingValue = responseHeaders[name];

        if (existingValue) {
          responseHeaders[name] =
            existingValue + (name === "set-cookie" ? "\n" : ", ") + value;
        } else {
          responseHeaders[name] = value;
        }
      });

      state.responseHeaders[url] = responseHeaders;
    },
    setupRequestTracking: function (tabId) {
      const requestFilter = {
        urls: ["http://*/*", "https://*/*"],
        tabId: tabId,
        types: ["xmlhttprequest"],
      };

      browser.webRequest.onBeforeSendHeaders.addListener((details) => {
        state.requestMetadata[details.url] = {
          requestId: details.requestId,
        };
        return { requestHeaders: details.requestHeaders };
      }, requestFilter);

      browser.webRequest.onBeforeRedirect.addListener((details) => {
        privateState.previousUrlRedirectToByRequestId[details.requestId] =
          details.redirectUrl;
        Module.saveRedirect({
          status: details.statusCode,
          from: details.url,
          to: details.redirectUrl,
          method: details.method,
          requestId: details.requestId,
          isInternalBrowserRedirect:
            "HTTP/1.1 307 Internal Redirect" === details.statusLine,
          headers: [],
        });
      }, requestFilter);

      browser.webRequest.onHeadersReceived.addListener((details) => {
        const responseHeaders = details.responseHeaders || [];
        Module.storeResponseHeaders(details.url, responseHeaders);
        const previousRedirect =
          privateState.previousUrlRedirectToByRequestId[details.requestId];

        if (previousRedirect && previousRedirect !== details.url) {
          Module.saveRedirect({
            status: 307,
            from: previousRedirect,
            to: details.url,
            method: details.method,
            headers: [],
            isIntDestination: false,
            requestId: "HTTP/1.1 307 Internal Redirect" === e.statusLine,
          });
        }

        return { responseHeaders };
      }, requestFilter);
    },
    // getBasicAuthHeaders(url) {
    //   const hasPassword = Boolean(config.basicAuth.password);
    //   const isSameDomain = Module.getHostType(Utils.parseURI(url)) === config.basicAuth.domain;

    //   if (hasPassword && isSameDomain) {
    //     const credentials = `${config.basicAuth.username}:${config.basicAuth.password}`;
    //     return { Authorization: 'Basic ' + btoa(credentials) };
    //   }

    //   return {};
    // },
    getReqOptions(method) {
      return {
        method: method,
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          "X-Requested-With": `SeoChecker/${mainfest.version}; +https://keywordseverywhere.com/`,
          // ...basicAuthHeaders,
        },
        redirect: "follow",
        referrer: "no-referrer",
      };
    },
    doFetch: async function (url, req) {
      try {
        // const basicAuthHeaders = Module.getBasicAuthHeaders(url);
        if (!["GET", "HEAD"].includes(req.method)) {
          throw new Error(i18n("onlyGetPostAllowed"));
        }

        const response = await fetch(url, privateState.reqOptions);
        return {
          status: 1,
          data: response,
        };
      } catch (error) {
        //SC_LOG(2, '[doFetch]', error);
        return {
          status: 2,
          error: error,
        };
      }
    },
    isNotPaused() {
      return !privateState.qStack.paused;
    },
    isProcessRunnig() {
      return !Module.isNotPaused();
    },
    isCrawlStartPath(path) {
      return _.startsWith(path.path(), state.result.startedUrlPath);
    },
    isSameRootDomain(d, s) {
      return !(
        ("www" !== d.subdomain() && "" !== d.subdomain()) ||
        ("www" !== s.subdomain() && "" !== s.subdomain())
      );
    },
    isInternalDomain(sourceUrl, destinationUrl) {
      if (Module.areHostsEqual(destinationUrl, sourceUrl)) return true;

      if (destinationUrl.domain() !== sourceUrl.domain()) return false;

      const processSubDomains = state.options.processSubDomains;
      const sameSubdomain =
        destinationUrl.subdomain() === sourceUrl.subdomain();
      const sameRootDomain = Module.isSameRootDomain(destinationUrl, sourceUrl);

      return processSubDomains || sameSubdomain || sameRootDomain;
    },
    isIntUrl(url) {
      const targetUrl = Utils.normalizeURI(state.options.targetUrl);
      return (
        !(!state.options.processInDepthDir && !Module.isCrawlStartPath(url)) &&
        !!Module.isInternalDomain(targetUrl, url)
      );
    },
    isUrlLimitCrossed() {
      return (
        state.options.urlLimit !== void 0 &&
        state.options.urlLimit > 0 &&
        state.processedUrlsCount >= state.options.urlLimit
      );
    },
    isDefinedPageThresholdCrossed() {
      return (
        state.options.maxPages !== void 0 &&
        state.options.maxPages > 0 &&
        state.numCrawledPages >= state.options.maxPages
      );
    },
    isThresholdLevelCrossed(threshold) {
      return (
        state.options.thresholdLevel > 0 &&
        threshold > state.options.thresholdLevel
      );
    },
    addUrlInProcessed(e) {
      privateState.urlCompleted[e] = true;
    },
    isCompressed(obj) {
      return !_.isEmpty(obj);
    },
    isErrorStatusCode(statusCode) {
      return (statusCode >= 400 && statusCode <= 599) || statusCode <= 0;
    },
    getDefaultErrorInfo() {
      return {
        type: PageType.error,
        success: false,
      };
    },
    createErrorResponse(responseDetails) {
      return Object.assign({}, Module.getDefaultErrorInfo(), responseDetails);
    },
    parseJsErrors(code) {
      try {
        acorn.parse(code, {
          sourceType: "module",
          ecmaVersion: "latest",
        });
        return [];
      } catch (error) {
        const errorMessage = error?.message ?? i18n("UnexpectedError0");
        const line = parseInt(error?.loc?.line ?? 0);
        const column = parseInt(error?.loc?.column ?? 0);
        return [Helper.formatErrorMessage(line, column, errorMessage)];
      }
    },
    parseCSS(css) {
      if (typeof css !== "string") {
        return [];
      }

      try {
        const errors = [];
        const result = csstree.parse(css, {
          filename: "",
          positions: true,
          parseAtrulePrelude: false,
          parseRulePrelude: true,
          parseValue: true,
          parseCustomProperty: true,
          onParseError(error) {
            errors.push(error);
          },
        });

        return errors.map((error) =>
          Helper.formatErrorMessage(
            error.line,
            error.column,
            error.formattedMessage
          )
        );
      } catch (error) {
        //SC_LOG(2, i18n('CssSyntaxError'), error.message);
        return [];
      }
    },
    processRobotsTxtResponse(urlResponse, responseDetails) {
      // const sitemaps = new RobotsParser(urlResponse.url + "", urlResponse.data).getSitemaps();
      const sitemaps = privateState.robotsData.sitemaps;
      const isSitemapInRobotFile = privateState.robotsData.isSitemapInRobotFile;
      //SC_LOG(3, 'processRobotsTxtResponse sitemaps', sitemaps);
      const links = sitemaps.map((url) => ({ url: url }));
      return {
        type: PageType.robots,
        isSitemapInRobotFile,
        sitemaps: sitemaps,
        links: links,
        ...responseDetails,
      };
    },
    processImageResponse(urlResponse, responseDetails) {
      return {
        type: PageType.image,
        imageAnalysis: urlResponse.imageAnalysis,
        ...Helper.extractCacheHeaders(urlResponse),
        ...Helper.parseSecurityHeaders(urlResponse),
        ...responseDetails,
      };
    },
    isMinified(code) {
      const strippedCode = code.replace(/\s/g, "");
      const removedCharactersCount = code.length - strippedCode.length;
      const removedCharactersRatio = code.length
        ? removedCharactersCount / code.length
        : 0;

      return code.length < 100 || removedCharactersRatio < 0.12;
    },
    processJavaScriptResponse(urlResponse, responseDetails) {
      return {
        type: PageType.js,
        errors: _.take(Module.parseJsErrors(urlResponse.data), 5),
        minified: Module.isMinified(urlResponse.data),
        ...Helper.extractCacheHeaders(urlResponse),
        ...Helper.parseSecurityHeaders(urlResponse),
        ...Module.extractSourceMapData(urlResponse),
        ...responseDetails,
      };
    },
    countOccurrences(string, pattern) {
      return ((string || "").match(pattern) || []).length;
    },
    extractSourceMapData(e) {
      return {
        includesSourceMap: _.includes(e.data, "sourceMappingURL=data:"),
      };
    },
    processCssResponse(urlResponse, responseDetails) {
      const topErrors = _.take(Module.parseCSS(urlResponse.data), 5);
      return {
        type: PageType.css,
        errors: topErrors,
        importedCss: Module.countOccurrences(urlResponse.data, /@import/g),
        minified: Module.isMinified(urlResponse.data),
        ...Helper.extractCacheHeaders(urlResponse),
        ...Helper.parseSecurityHeaders(urlResponse),
        ...Module.extractSourceMapData(urlResponse),
        ...responseDetails,
      };
    },
    processXmlResponse(urlResponse, responseDetails) {
      if (urlResponse.url.indexOf("sitemap") > -1) {
        return {
          type: PageType.sitemap,
          ...responseDetails,
        };
      } else {
        return {
          type: PageType.xml,
          ...Helper.parseSecurityHeaders(urlResponse),
          ...responseDetails,
        };
      }
    },
    processLinkResponse(urlResponse, responseDetails) {
      const parsedHtml = Helper.parseHtml(urlResponse.data);
      return {
        type: Constants.fileType.link,
        ...parseTitle(parsedHtml),
        ...Module.parseUrlDetails(urlResponse),
        threshold: responseDetails.threshold,
        status: responseDetails.status,
        contentType: responseDetails.contentType,
        requestMethod: responseDetails.requestMethod,
        success: responseDetails.success,
        internal: responseDetails.internal,
      };
    },
    mergeWithDefaultConfigObj(obj) {
      return Object.assign({}, defaultOptionsPerUrl(), obj);
    },
    getResponse: function (url) {
      return _.get(state.result.responses, url);
    },
    processMetadata(redirectData) {
      const metadata = Module.parseResponseDetails(redirectData);
      const processedMetadata = Object.assign({}, metadata, {
        type: Constants.fileType.redirect,
        isIntDestination: redirectData.isIntDestination,
        destinationTo: redirectData.destinationTo || "unexpected_undefined",
        success: true,
        forwardingTarget: 0,
        links: [],
        finalRedirect: "unset_finalRedirect",
      });
      return Object.assign({}, defaultOptionsPerUrl(), processedMetadata);
    },
    fetchRedirectMetadata(response) {
      const redirectData = _.map(response.redirects, (redirect) => {
        const toUri = Utils.normalizeURI(redirect.to);
        const toUrl = toUri.toString();
        const fromUri = Utils.normalizeURI(redirect.from);
        const fromUrl = fromUri.toString();

        return {
          requestId: response.requestId,
          responseUrl: fromUrl,
          requestUrl: response.url,
          url: fromUrl,
          uri: fromUri,
          destinationTo: toUrl,
          task: response.task,
          requestMethod: response.requestMethod,
          getResponseHeader: Utils.getResponseHeader(redirect.headers, ""),
          internal: Module.isIntUrl(toUri),
          threshold: response.task.threshold,
          isIntDestination: redirect.isIntDestination,
          status: redirect.status,
          data: "",
          headers: redirect.headers,
          redirects: [],
          referringLinks: [],
          processAsPage: false,
        };
      });

      const lastRedirect = _.last(redirectData);
      if (lastRedirect && lastRedirect.destinationTo) {
      }

      return _.map(redirectData, (metadata) =>
        Module.processMetadata(metadata)
      );
    },
    isFailedResult(result) {
      return !result.success && result.tag !== Constants.testType.NotFoundTest;
    },
    addLinkIntoFinalRes(response) {
      if (
        _.startsWith(response.pathSegment, Constants.seoCheckerNotFoundPage)
      ) {
        response.tag = Constants.testType.NotFoundTest;
      }

      // if (!Module.isNotPaused()) {
      //   //SC_LOG(3, "[SEO-CHECKER]: Processed already stopped");
      // }

      if (response.url) {
        if (Module.isFailedResult(response)) {
          //SC_LOG(3, `[SEO-CHECKER] Error: Fail ${response.url} (${response.status})`);
          ++state.failedRequestsCount;
        }

        if (response.type === Constants.fileType.html) {
          ++state.numCrawledPages;
        }

        ++state.processedUrlsCount;
        //SC_LOG(3, "[SEO-CHECKER]: addLinkIntoFinalRes response.url", response.url);
        state.result.responses[response.url] = response;
      } else {
        //SC_LOG(2, i18n('UrlNotDefined'));
      }
    },
    isReqUrlCanBeInProcess(request) {
      const url = request.url;
      if (!request.uri) {
        //SC_LOG(3, i18n('UrlIsEmpty'));
        return false;
      }
      if (!request.uri.host()) {
        //SC_LOG(3, i18n('HostNotFound'), url);
        return false;
      }
      if (privateState.urlInProcess[url] || privateState.urlCompleted[url]) {
        return false;
      }
      if (
        (!_.startsWith(url, "http:") && !_.startsWith(url, "https:")) ||
        (!request.force && Module.isUrlBlocked(url))
      ) {
        return false;
      }

      return true;
    },
    thresholdOneCrawl(task) {
      Module.enqueueLinks({
        task: undefined,
        urls: [task.url],
        requestMethod: task.requestMethod,
        force: true,
        tag: task.tag,
      });
    },
    async getRobotsUrl(u) {
      const robotsUrl = Utils.normalizeURI(u)
        .query("")
        .path("/robots.txt")
        .toString();
      const response = await Module.fetchWithTimeout(robotsUrl, {
        method: Constants.requestMethod.Get,
        timeout: state.urlOptions.responseTimeout,
      });

      if (response.status === 1) {
        const responseData = await response.data.text();
        const parser = await RobotsParser.create(robotsUrl + "", responseData);
        privateState.robotsData["parser"] = parser;
        privateState.robotsData["robotsUrl"] = robotsUrl;
        privateState.robotsData["isSitemapInRobotFile"] =
          parser.isSitemapInRobotFile();
        privateState.robotsData["sitemaps"] = parser.getSitemaps();
      }
    },
    addRobotsToQueue(urlObject) {
      const url = urlObject.protocol() + "://" + urlObject.hostname();

      //SC_LOG(3, '[SEOChecker] addRobotsToQueue', url, state.crawledUrlStack[url]);
      if (Module.isIntUrl(urlObject) && !state.crawledUrlStack[url]) {
        state.crawledUrlStack[url] = 1;
        if (state.options.processRobotFile) {
          Module.enqueueLinks({
            task: undefined,
            urls: [
              privateState.robotsData.robotsUrl,
              ...privateState.robotsData.sitemaps,
            ],
            requestMethod: Constants.requestMethod.Get,
            force: true,
            tag: undefined,
          });
        }

        if (state.options.processNotFoundTesting) {
          const notFoundTestUrl = Utils.parseURI(urlObject)
            .path(Constants.seoCheckerNotFoundPage)
            .query("")
            .toString();
          Module.thresholdOneCrawl({
            url: notFoundTestUrl,
            requestMethod: Constants.requestMethod.Get,
            tag: Constants.testType.NotFoundTest,
          });
        }
      }
    },
    enqueueLink(linkObj) {
      if (!Module.isReqUrlCanBeInProcess(linkObj)) {
        return false;
      }
      privateState.urlInProcess[linkObj.uri.toString()] = true;
      const threshold = linkObj.threshold;
      privateState.qStack.push(linkObj, threshold);

      if (linkObj.tag) {
        state.urlTagList.push({
          url: linkObj.uri.toString(),
          tag: linkObj.tag,
        });
      }

      Module.addRobotsToQueue(linkObj.uri);
      return true;
    },
    enqueueLinks(options) {
      _.each(options.urls, (url) => {
        if (!url) return;
        const uri = Utils.normalizeURI(url);
        Module.enqueueLink({
          uri: uri,
          url: uri.toString(),
          threshold: options.task
            ? options.task.threshold + 1
            : Constants.initDepth,
          requestMethod: options.requestMethod
            ? options.requestMethod
            : Constants.requestMethod.Get,
          force: !!options.force,
          tag: options.tag,
        });
      });
    },
    parseUrlDetails(response) {
      const uri = response.uri;
      return {
        url: response.url,
        protocol: uri.protocol(),
        urlSuffix: uri.suffix(),
        pathSegment: uri.path(),
        urlQuery: uri.query(),
        urlHostname: uri.hostname(),
        urlFilename: uri.filename(),
      };
    },
    parseResponseDetails: function (res) {
      const contentEncoding = res
        .getResponseHeader("content-encoding")
        .toLowerCase()
        .trim();
      return {
        status: res.status,
        contentType: res.getResponseHeader("content-type"),
        requestMethod: res.requestMethod.toString().toUpperCase(),
        responseHeaders: res.headers,
        contentHash: res.data ? Helper.calculateContentHash(res.data) : "",
        compressed: Module.isCompressed(contentEncoding),
        success: !Module.isErrorStatusCode(res.status),
        uncompressedSize: res.data ? res.data.length : res.dataSize,
        threshold: res.threshold,
        internal: res.internal,
        ...Module.parseUrlDetails(res),
        ...Helper.parseSecurityHeaders(res),
      };
    },
    processUrlResponse: function (urlResponse) {
      const responseDetails = Module.parseResponseDetails(urlResponse);

      if (!responseDetails.success) {
        //SC_LOG(3, "[SEO-CHECKER] Error: " + urlResponse.url + " status " + urlResponse.status);
        return Module.createErrorResponse(responseDetails);
      }

      const contentType = responseDetails.contentType;
      const isHtmlContent =
        _.includes(contentType, "text/html") ||
        _.includes(contentType, "xhtml");

      if (urlResponse.uri.path() === "/robots.txt") {
        return Module.mergeWithDefaultConfigObj(
          Module.processRobotsTxtResponse(urlResponse, responseDetails)
        );
      } else if (contentType.includes("image/")) {
        return Module.mergeWithDefaultConfigObj(
          Module.processImageResponse(urlResponse, responseDetails)
        );
      } else if (contentType.includes("javascript")) {
        return Module.mergeWithDefaultConfigObj(
          Module.processJavaScriptResponse(urlResponse, responseDetails)
        );
      } else if (contentType.includes("/css")) {
        return Module.mergeWithDefaultConfigObj(
          Module.processCssResponse(urlResponse, responseDetails)
        );
      } else if (
        contentType.includes("text/xml") ||
        contentType.includes("application/xml") ||
        contentType.includes("application/rss+xml")
      ) {
        return Module.mergeWithDefaultConfigObj(
          Module.processXmlResponse(urlResponse, responseDetails)
        );
      } else if (isHtmlContent) {
        return urlResponse.processAsPage
          ? Module.mergeWithDefaultConfigObj(
              analyzePage(urlResponse, responseDetails)
            )
          : Module.mergeWithDefaultConfigObj(
              Module.processLinkResponse(urlResponse, responseDetails)
            );
      } else {
        //SC_LOG(3, `[SEO-CHECKER] Error: Unknown mime: ${contentType}, URL: ${urlResponse.url}, Status: ${urlResponse.status}`);
        return Module.createErrorResponse(responseDetails);
      }
    },
    enqueuePageOutlinks(entity, task) {
      if (entity.canonicalUrl) {
        Module.enqueueLinks({
          task: task,
          urls: [entity.canonicalUrl],
        });
      }

      if (state.options.processPageJavascript) {
        Module.enqueueLinks({
          task: task,
          urls: Helper.extractUrls(entity.js),
        });
      }

      if (state.options.processPageCss) {
        Module.enqueueLinks({
          task: task,
          urls: Helper.extractUrls(entity.css),
        });
      }

      if (state.options.processPageImages) {
        Module.enqueueLinks({
          task: task,
          urls: Helper.extractUrls(entity.images),
          requestMethod: Constants.requestMethod.Head,
        });
      }

      const allEntityUrls = Helper.extractEntityUrls(entity);
      // let filteredEntityUrls = _.reject(allEntityUrls, url => "/cdn-cgi/l/email-protection" === Utils.normalizeURI(url).path());
      // if (!state.options.processNoIndexedPages) {
      //   filteredEntityUrls = _.reject(filteredEntityUrls, url => !privateState.robotsData.parser.isAllowed(url));
      // }
      const filteredEntityUrls = _.reject(allEntityUrls, (url) => {
        const normalizedPath = Utils.normalizeURI(url).path();
        if (normalizedPath === "/cdn-cgi/l/email-protection") {
          return true;
        }
        if (
          !state.options.processNoIndexedPages &&
          !privateState.robotsData.parser.isAllowed(url)
        ) {
          return true;
        }
        return false;
      });
      const uniqueFilteredUrls = _.uniq(filteredEntityUrls);
      const [internalUrls, externalUrls] = _.partition(
        uniqueFilteredUrls,
        (url) => Module.isIntUrl(Utils.normalizeURI(url))
      );

      if (state.options.processExtLinks) {
        Module.enqueueLinks({
          task: task,
          urls: externalUrls,
        });
      }

      if (state.options.processIntLinks) {
        Module.enqueueLinks({
          task: task,
          urls: internalUrls,
        });
      }
    },
    processTask: function (task, response, onProcess) {
      const responseUrl = Utils.normalizeURI(response.responseUrl);
      const originUrl = responseUrl.toString();
      if (Module.isUrlLimitCrossed()) {
        Module.stop();
        return onProcess();
      }

      if (privateState.urlCompleted[originUrl]) {
        return onProcess();
      }

      Module.addUrlInProcessed(originUrl, task.requestMethod);

      if (privateState.progress.exploredDepth < task.threshold) {
        privateState.progress.exploredDepth = task.threshold;
      }

      const isInternal = Module.isIntUrl(responseUrl);
      const currentResponse = Module.getResponse(originUrl);
      const isHtml =
        !!currentResponse && currentResponse.type === Constants.fileType.html;
      const canCrawl =
        isInternal &&
        !Module.isThresholdLevelCrossed(task.threshold) &&
        !Module.isDefinedPageThresholdCrossed();
      const processAsPage = state.isRecrawl ? isHtml : canCrawl;
      const metadata = Object.assign(
        {
          isIntDestination: false,
        },
        response,
        {
          url: originUrl,
          uri: responseUrl,
          task: task,
          requestMethod: response.requestMethod,
          getResponseHeader: Utils.getResponseHeader(response.headers, ""),
          internal: isInternal,
          processAsPage: processAsPage,
          threshold: task.threshold,
        }
      );

      const entryData = Module.processUrlResponse(metadata);

      let shouldProcessNoIndex = true;
      if (!state.options.processNoIndexedPages) {
        const xRobotsTag = response.headers["x-robots-tag"];
        if (
          !entryData.indexable ||
          (xRobotsTag && xRobotsTag.includes("noindex"))
        ) {
          shouldProcessNoIndex = false;
        }
      }
      if (
        entryData.type === Constants.fileType.html &&
        (!state.isRecrawl || task.threshold === Constants.initDepth) &&
        shouldProcessNoIndex
      ) {
        Module.enqueuePageOutlinks(entryData, task);
      }

      if (entryData.metaRefreshUrl && shouldProcessNoIndex) {
        Module.enqueueLinks({
          task: task,
          urls: [entryData.metaRefreshUrl],
        });
      }
      // if (!entryData.isSitemapInRobotFile && entryData.sitemaps && entryData.sitemaps.length) {
      //   Module.enqueueLinks({
      //     task: undefined,
      //     urls: entryData.sitemaps,
      //     requestMethod: Constants.requestMethod.Get,
      //     force: true,
      //     tag: undefined,
      //   });
      // }
      if (shouldProcessNoIndex) {
        const redirectData = Module.fetchRedirectMetadata(metadata);
        [entryData, ...redirectData].forEach((res) => {
          Module.addLinkIntoFinalRes(res);
        });
      }

      onProcess();
    },
    getResponseHeaders: function (url) {
      return state.responseHeaders[url] || {};
    },
    clearData: function () {
      privateState.redirects = {};
      state.responseHeaders = {};
      state.requestMetadata = {};
      privateState.redirectsByReqtId = {};
      privateState.previousUrlRedirectToByRequestId = {};
    },
    getHostType: function (host) {
      return Module.isIpAddress(host) ? host.hostname() : host.domain();
    },
    isIpAddress: function (host) {
      return host.is("ip");
    },
    isLocalhost: function (host) {
      return "localhost" === host.domain().toLowerCase();
    },
    getHostCategory: function (host) {
      if (Module.isIpAddress(host)) {
        return "ip";
      } else if (Module.isLocalhost(host)) {
        return "localhost";
      } else {
        return "domainName";
      }
    },
    areHostsEqual: function (host1, host2) {
      return (
        !!Module.isIpAddress(host1) && host1.hostname() === host2.hostname()
      );
    },
    generateHostUrls: function (host) {
      const isIp = Module.isIpAddress(host);
      const isLocal = Module.isLocalhost(host);
      const isRegular = !isIp && !isLocal;

      const baseHost = host.clone().protocol("http").path("").query("");

      if (isRegular) {
        baseHost.subdomain("");
      }

      const wwwHost = isRegular ? host.clone().subdomain("www") : undefined;

      return {
        httpRoot: baseHost.toString(),
        httpsRoot: baseHost.clone().protocol("https").toString(),
        httpWww: wwwHost ? wwwHost.toString() : undefined,
        httpsWww: wwwHost
          ? wwwHost.clone().protocol("https").toString()
          : undefined,
      };
    },
    createCrawlResult() {
      return {
        targetUrlResponse: undefined,
        id: 1,
        homeUrlsAreCanonicalized: false,
        targetUrl: "",
        tagetUrlHost: "",
        startedUrlPath: "",
        responseCount: 0,
        // timeTaken: 0,
        robotsUrl: "",
        faviconUrl: "",
        crawledUrlStack: {},
        homeUrls: {
          httpRoot: "",
          httpsRoot: "",
          httpWww: undefined,
          httpsWww: undefined,
        },
        hostName: "",
        initiationTime: 0,
        // endTime: 0,
        // done: false,
        error: undefined,
        responses: {},
        getResponse: Module.getResultResponse,
        getResFollowingTargets: Module.getResFollowingTargets,
      };
    },
    getResultResponse(url) {
      return state.result.responses[url];
    },
    getResFollowingTargets(url) {
      const response = Module.getResultResponse(url);
      if (!response) return;
      const finalRedirect = response.finalRedirect;
      return finalRedirect ? Module.getResultResponse(finalRedirect) : response;
    },
    updateStatus() {
      privateState.progress.recentUrlList = state.recentUrlList;
      privateState.progress.processedRequestsCount = state.processedUrlsCount;
      privateState.progress.failedRequestsCount = state.failedRequestsCount;
      privateState.progress.pendingRequestsCount =
        privateState.qStack.length() + 1;
      privateState.progress.initiationTime = state.result.initiationTime;
      //SC_LOG(1, 'updateStatus before', Date.now() * 0.001, state.result.initiationTime * 0.001, privateState.cloudflareDelay * 0.001);
      const elapsedTimeInSeconds =
        (Date.now() - state.result.initiationTime) * 0.001;
      privateState.progress.requestsProcessedPerSecond =
        state.processedUrlsCount / elapsedTimeInSeconds || 0;
      //SC_LOG(1, 'updateStatus', state.processedUrlsCount, elapsedTimeInSeconds, privateState.progress.requestsProcessedPerSecond)
    },
    updateUrlList(url) {
      state.recentUrlList.unshift(url);
      state.recentUrlList.pop();
      Module.updateStatus();
    },
    controlReqRate(reqFn, reqRate) {
      const rate = reqRate || 0.00001;
      return limit(reqFn).to(1).per(rate);
    },
    stackReqHandler() {
      const urlLimitToProcessPerSec =
        state.options.urlLimitToProcessPerSec || 0;
      const requestRate = urlLimitToProcessPerSec
        ? 1000 / urlLimitToProcessPerSec
        : 1;
      Module["controlReqFn"] = (function (fn, reqRate) {
        return Module.controlReqRate(fn, reqRate);
      })((req) => Module.dispatchReq(req), requestRate);
    },
    setupCrawler(options, existingResult) {
      privateState.urlInProcess = {};
      privateState.urlCompleted = {};
      state.crawledUrlStack = {};
      privateState.progress = [];
      state.urlTagList = [];
      Module.initProgress();
      state.result = Module.createCrawlResult();
      // state.responses = state.result.responses;
      state.failedRequestsCount = 0;
      state.processedUrlsCount = 0;
      state.numCrawledPages = 0;
      state.recentUrlList = new Array(5).fill("-");
      Module.isUrlBlocked = () => false;
      const targetUrl = Utils.normalizeURI(options.targetUrl);
      const faviconUrl = Utils.parseURI(targetUrl)
        .path("/favicon.ico")
        .toString();
      const hostname = targetUrl.hostname();

      state["options"] = options;
      options.hostName = hostname;

      // const excludePatternList = _.compact(_.split(options.excludePattern, "\n"));
      const includePatternList = _.compact(
        _.split(options.includePattern, "\n")
      );

      const createRegex = (pattern) => {
        try {
          const regex = new RegExp(pattern);
          return (url) => regex.test(url);
        } catch (error) {
          //SC_LOG(2, "createRegex", error);
          return () => false;
        }
      };

      // const excludePatternFuncs = _.map(excludePatternList, createRegex);
      const includePatternFuncs = _.map(includePatternList, createRegex);

      Module.isUrlBlocked = (url) => {
        // const isExcluded = _.some(excludePatternFuncs, func => func(url));
        const isIncluded =
          !includePatternFuncs.length ||
          _.some(includePatternFuncs, (func) => func(url));
        return /** isExcluded || **/ !isIncluded;
      };
      if (existingResult) {
        Object.assign(state.result, existingResult);
      } else {
        state.result = Module.createCrawlResult();
      }
      state.result.faviconUrl = faviconUrl;
      state.result.targetUrl = targetUrl.toString();
      state.result.tagetUrlHost = targetUrl.host();
      state.result.hostName = hostname;
      state.result.startedUrlPath = Utils.parseURI(targetUrl)
        .filename("")
        .path();
      state.result.initiationTime = _.now();
      state.result.homeUrls = Module.generateHostUrls(targetUrl);
      // state.responses = state.result.responses;
      state.isRecrawl = !!existingResult;

      Module.stackReqHandler();
      state.crawlComplete = Module.startPriorityQueue();
      Module.updateStatus();
    },
    initiateCrawl() {
      const targetUrl = Utils.parseAndNormalizeUrl(state.urlOptions.targetUrl);
      const parsedUrl = Utils.normalizeURI(targetUrl);

      if (!parsedUrl.hostname()) {
        return i18n("HostnameMissing");
      }

      // const domain = parsedUrl.hostname();
      // state.urlOptions.basicAuth.domain = domain;
      state.urlOptions.targetUrl = targetUrl;

      const urlLimit = 10000;
      // const reg = String(state.urlOptions.excludePattern).split("\n");
      // state.urlOptions.excludePattern = _.map(_.compact(reg), _.trim).join("\n");

      const options = {
        ...state.urlOptions,
        parsedUrl: parsedUrl,
        urlLimit: Math.min(state.urlOptions.urlLimit, urlLimit),
        urlsToProcess: [state.urlOptions.targetUrl],
      };

      return Module.initUrlProccessing(options, null);
    },
    async recrawlUrl(url) {
      const parsedUrl = Utils.normalizeURI(url);
      const options = {
        ...state.urlOptions,
        thresholdLevel: 1,
        urlsToProcess: [url],
        parsedUrl: parsedUrl,
      };
      state.isDashboard = false;
      return await Module.initUrlProccessing(options, state.result);
    },
    async asyncDelay(ms) {
      try {
        await new Promise((resolve) => setTimeout(resolve, ms));
      } catch (error) {
        throw error;
      }
    },
    showFlexEle($ele) {
      $ele.addClass("d-flex").removeClass("d-none");
    },
    hideFlexEle($ele) {
      $ele.addClass("d-none").removeClass("d-flex");
    },
    showHome() {
      $vLayout.removeClass("fixed-header");
      $dashboardSidebar.hide();
      Module.hideFlexEle($mainBody);
      $homeSidebar.show();
      Module.showFlexEle($homeMain);
    },
    showDashboard() {
      $vLayout.removeClass("fixed-header");
      $homeSidebar.hide();
      Module.hideFlexEle($mainBody);
      $dashboardSidebar.show();
      Module.showFlexEle($dashboardMain);
    },
    showContent() {
      Module.hideFlexEle($mainBody);
      Module.showFlexEle($contentMain);
      $vLayout.addClass("fixed-header");
    },
    showAuditReport() {
      $vLayout.removeClass("fixed-header");
      Module.hideFlexEle($mainBody);
      Module.showFlexEle($auditReportMain);
    },
    async process() {
      state.isUrlInProcess = true;
      try {
        const initiationTime = _.now();
        Module.initializeCrawlRequests();
        await state.crawlComplete;
        Module.clearData();
        const targetUrlResponse = state.result.targetUrlResponse;

        if (targetUrlResponse) {
          if (targetUrlResponse.status === -1) {
            state.error = i18n("ConnectionError");
          } else if (targetUrlResponse.status !== 200) {
            state.error = i18n(
              "ErrorFailedWith"
            )` ${targetUrlResponse.status}.`;
          } else if (targetUrlResponse.type !== Constants.fileType.html) {
            state.error = i18n("UrlIsNotHtmlPage");
          } else {
            state.error = "";
            if (state.manuallyStopped) {
              Module.showContinueCrawlBtn();
            } else {
              Module.showStartNewCrawlBtn();
            }
          }
        } else {
          state.error = i18n("UrlSideError");
        }

        await Module.updateCrawlStatusAndGenerateReports();
        const delay = 0;
        const elapsedTime = _.now() - initiationTime;
        await Module.asyncDelay(delay - elapsedTime);
      } catch (error) {
        state.error = error.message;
      }

      state.isUrlInProcess = false;
      return state.error;
    },
    async initUrlProccessing(options, existingResult) {
      if (state.isUrlInProcess) {
        throw new Error(i18n("urlProcessingInProgress"));
      }

      const userAgent = options.userAgent || Constants.uA;
      await Module.resetConfig({
        // basicAuth: options.basicAuth,
        userAgent: userAgent,
      });
      await Module.getRobotsUrl(options.parsedUrl);
      Module.setupCrawler(options, existingResult);
      Module.isCrawlActivePromise = Module.process();
      await Module.initModal();
      return Module.isCrawlActivePromise;
    },
    showContinueCrawlBtn() {
      $start_new_btn.hide();
      $continue_crawling_btn.show();
    },
    showStartNewCrawlBtn() {
      $continue_crawling_btn.hide();
      $start_new_btn.show();
    },
    async initModal() {
      $loadingModalStatus.text(i18n("CheckingPages"));
      privateState.updateStatusTimer = window.setInterval(
        Module.updateModalProgress,
        1000
      );
      await Module.isCrawlActivePromise;
      Module.hideModal();
    },
    initializeCrawlRequests() {
      if (_.isEmpty(state.options.urlsToProcess)) {
        //SC_LOG(3, i18n('urlsNotFound'));
      } else {
        _.each(state.options.urlsToProcess, (url) => {
          Module.thresholdOneCrawl({
            url: url,
            requestMethod: Constants.requestMethod.Get,
          });
        });
      }
    },
    processTestResults: function (reportGenerator, results, initiationTime) {
      const totalTests = results.length;
      const passedTests = Helper.countMatchingElements(results, (e) => e[1]);
      const passRate = totalTests ? passedTests / totalTests : 1;
      const failedTests = totalTests - passedTests;

      if (!reportGenerator.id) throw new Error(i18n("ReportIdMissing"));

      const reportData = {
        reportGenerator: reportGenerator,
        results: results,
        numTested: totalTests,
        numPassed: passedTests,
        numFailed: failedTests,
        allPassed: failedTests === 0,
        percentPassed: passRate,
        formattedPercentPassed: Helper.formatPercentage(passRate).toString(),
        score:
          ReportPriorityWeight[reportGenerator.priority] * passRate * passRate,
        testDuration: _.now() - initiationTime,
        id: reportGenerator.id || "",
      };

      // if(totalTests === 0 && reportGenerator.id === "specify-sitemap-locations"){
      //   reportData[""]
      // }

      return reportData;
    },
    generateDashboardSummary: function (reportGenerators) {
      const response = state.result.responses[state.result.targetUrl];
      const reportData = {
        urls: { heading: i18n("URLs"), data: [] },
        pages: { heading: i18n("Pages"), data: [] },
        assets: { heading: i18n("Assets"), data: [] },
        redirect: { heading: i18n("Redirects"), data: [] },
        others: { heading: i18n("Others"), data: [] },
      };

      if (!response) return reportData;

      function addReport(finalReport, idList) {
        idList.forEach(({ id, cls }) => {
          const report = _.find(reportGenerators, { id: id });
          if (report) {
            finalReport.push({
              name: report.reportGenerator.name,
              reportId: report.id,
              value: report.numTested,
              cls: cls || "success",
            });
          } else {
            //SC_LOG(2, i18n('ReportIdMissing'), id);
          }
        });
      }

      if (response) {
        const urlReportList = [
          {
            id: "crawled-urls",
          },
          {
            id: "internal-urls",
          },
          {
            id: "external-urls",
          },
          {
            id: "status-error",
            cls: "danger",
          },
        ];
        const pageReportList = [
          {
            id: "pages",
          },
          {
            id: "indexable-pages",
          },
          {
            id: "non-indexable-pages",
          },
        ];
        const assetReportList = [
          {
            id: "images",
          },
          {
            id: "css",
          },
          {
            id: "javascript",
          },
        ];
        const redirectReportList = [
          {
            id: "redirects",
            cls: "warning",
          },
          {
            id: "temporary-redirects",
            cls: "warning",
          },
          {
            id: "permanent-redirects",
            cls: "warning",
          },
        ];
        const otherList = [
          {
            id: "status-2xx",
          },
          {
            id: "status-4xx",
            cls: "danger",
          },
          {
            id: "status-5xx",
            cls: "danger",
          },
          {
            id: "status-connection-error",
            cls: "danger",
          },
        ];

        addReport(reportData.urls.data, urlReportList);
        addReport(reportData.pages.data, pageReportList);
        addReport(reportData.assets.data, assetReportList);
        addReport(reportData.redirect.data, redirectReportList);
        addReport(reportData.others.data, otherList);
      }
      return reportData;
    },
    generateStatisticsSummary: function (reportGenerators) {
      const responses = state.result.responses;
      const tempRes = [];
      Object.keys(responses).forEach(
        (key) =>
          responses[key].internal &&
          responses[key].type === "html" &&
          tempRes.push(key)
      );
      // function countMatchingResponses(predicate) {
      //   return Helper.countMatchingElements(responses, predicate);
      // }

      function countFailedReports(priority) {
        return Helper.countMatchingElements(
          reportGenerators,
          (e) => e.reportGenerator.priority === priority && e.numFailed > 0
        );
      }

      countFailedReports(ReportPriority.high);
      countFailedReports(ReportPriority.medium);
      countFailedReports(ReportPriority.low);

      var totalPriorityWeight = _.sum(
        _.map(
          reportGenerators,
          (e) => ReportPriorityWeight[e.reportGenerator.priority]
        )
      );
      const reportScores = _.map(reportGenerators, (e) => e.score);
      const totalReportScore = _.sum(reportScores);
      const averageScore = totalReportScore / totalPriorityWeight;
      const groupedReports = _.groupBy(
        _.filter(
          reportGenerators,
          (e) => e.reportGenerator.category !== "explore"
        ),
        (e) => e.reportGenerator.category
      );
      const categoryScores = {};

      _.each(groupedReports, (reports) => {
        const totalPriorityWeight = _.sum(
          _.map(
            reports,
            (e) => ReportPriorityWeight[e.reportGenerator.priority]
          )
        );
        const averageScore =
          _.sum(_.map(reports, (e) => e.score)) / totalPriorityWeight;
        const firstReport = _.first(reports);
        const category = firstReport
          ? firstReport.reportGenerator.category
          : i18n("UnknownCategory");

        categoryScores[category] = {
          score: Helper.formatPercentage(averageScore).toString(),
        };
      });

      const pagesCount = Helper.countMatchingElements(
        responses,
        Helper.isHtmlAndInternal
      );
      const brokenUrlsCount = Helper.countMatchingElements(
        responses,
        Helper.isBrokenUrl
      );

      return {
        score: Helper.formatPercentage(averageScore),
        maxScore: totalPriorityWeight,
        targetUrl: state.result.targetUrl,
        hostName: state.result.hostName,
        responseCount: state.result.responseCount,
        pagesCount: pagesCount,
        brokenUrlsCount: brokenUrlsCount,
        tagetUrlHost: state.result.tagetUrlHost,
        categoryScores: categoryScores,
      };
    },
    runTester(setting, responseFilterMemoiser, reportGenerator) {
      if (!setting.test) {
        if (!setting.results) return [];
        try {
          return setting.results(reportGenerator);
        } catch (error) {
          //SC_LOG(2, i18n('FilterTestError'), error);
          return [];
        }
      }
      const filteredResponses = responseFilterMemoiser(setting.filter);
      const testFunction = setting.test;
      return _.map(filteredResponses, (response) => {
        try {
          const testResult = testFunction(response, reportGenerator);
          testResult.unshift(response.url);
          return testResult;
        } catch (error) {
          //SC_LOG(2, i18n('FilterTestError'), error);
          return [response.url, false];
        }
      });
    },
    async generateReportsAndDashboard(globalReportSettings) {
      const responses = state.result.responses;
      const reports = [];
      const responseFilterMemoiser = _.memoize(
        function filterResponses(filter) {
          return _.filter(responses, filter);
        },
        function memoizeKey(url) {
          const key = String(url);
          if (!key) throw new Error("Bad function name");
          return key;
        }
      );
      const reportGenerator = new ReportGenerator({
        config: new UrlCheckerSettings(),
        crawl: state.result,
        filterResponsesMemoiser: responseFilterMemoiser,
      });

      function runTests(setting) {
        try {
          const initiationTime = _.now();
          const result = Module.runTester(
            setting,
            responseFilterMemoiser,
            reportGenerator
          );
          //SC_LOG(4, '[generateReportsAndDashboard][runTests] result', result);
          const reportData = Module.processTestResults(
            setting,
            result,
            initiationTime
          );
          reports.push(reportData);
          //SC_LOG(4, "Report generated:", setting.id);
        } catch (error) {
          //SC_LOG(2, "[SEO-CHECKER] Error report generation:", setting.id, error);
        }
      }

      await Promise.all(
        _.map(
          globalReportSettings,
          (setting) =>
            new Promise((resolve, reject) => {
              runTests(setting);
              resolve(setting);
            })
        )
      );

      const dashboard = Module.generateDashboardSummary(reports);

      return {
        reports,
        dashboard,
        statistics: Module.generateStatisticsSummary(reports),
      };
    },
    onRefreshBtnClick() {
      const url = $(this).closest("nav").attr("data-url");
      Module.resetModalState();
      Module.showModal();
      Module.recrawlUrl(url);
    },
    onHtmlBtnClick() {
      const url = $(this).closest("nav").attr("data-url");
      chrome.tabs.create({
        url: "view-source:" + url,
      });
    },
    onCopyBtnClick() {
      const url = $(this).closest("nav").attr("data-url");
      const input = document.createElement("input");
      input.style.position = "fixed";
      input.style.opacity = "0";
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("Copy");
      document.body.removeChild(input);
      scToast.show("URL copied to clipboard");
    },
    getUrlDetailsHtml(url, id) {
      const res = Module.getResponse(url);
      const uri = Utils.normalizeURI(url);

      const pathname = uri.pathname();
      const pathMatch = pathname.match(/(.*\/)([^\/]+\/?$)/);
      let firstSegment = pathMatch ? pathMatch[1] : pathname;
      let secondSegment = pathMatch ? pathMatch[2] : "";
      if (pathname === "/") {
        firstSegment = "";
        secondSegment = pathname;
      }

      if (res) {
        if (id) {
          if (id === "inlinks") {
            $(".resultCount", $contentMainHeader).text(
              res.referringLinks.length
            );
          } else if (id === "outlinks") {
            $(".resultCount", $contentMainHeader).text(res.links.length);
          }
        }
        return [
          `
      <div class="d-flex align-items-center">
        <i data-feather="file" class="me-2" width="16" height="16"></i>
        <span class="text-dark fw-bold crawlTitle">${
          res.title || res.urlFilename
        }</span>
      </div>`,
          `<div class="d-flex align-items-center">
        <i data-feather="lock" class="me-2 text-primary" width="16" height="16"></i>
        <a href="${url}" target="_blank">
          <span class="fw-semibold text-primary opacity-75 tagetUrlHost text-break">${
            res.urlHostname
          }${firstSegment}${secondSegment}${
            res.urlQuery ? `?${res.urlQuery}` : ""
          }</span>
        </a>
      </div>`,
          `<div class="ms-4">
          <nav class="nav flex-row mt-2" data-url='${url}'>
            <span class="pe-2"><a class="text-primary-emphasis" href="#content/inlinks/${URI.encodePathSegment(
              url
            )}">${res.referringLinks.length} ${i18n("links")}</a></span>
            <span class="pe-2"><a class="text-primary-emphasis" href="#content/outlinks/${URI.encodePathSegment(
              url
            )}">${res.links ? res.links.length : 0} ${i18n(
            "outlinks"
          )}</a></span>
            <span class="pe-2"><a class="text-primary-emphasis" href="#content/response-headers/${URI.encodePathSegment(
              url
            )}">${i18n("headers")}</a></span>
            <span class="pe-2 c-p refreshBtn text-primary-emphasis">${i18n(
              "refresh"
            )}</span>
            <span class="pe-2 c-p htmlBtn text-primary-emphasis">${i18n(
              "html"
            )}</span>
            <span class="pe-2 c-p copyBtn text-primary-emphasis">${i18n(
              "copy"
            )}</span>
          </nav>
        </div>`,
        ].join("");
      } else {
        return [
          `
        <div class="d-flex align-items-center">
          <i data-feather="file" class="me-2" width="16" height="16"></i>
          <span class="text-dark fw-bold crawlTitle">Uncrawled</span>
        </div>`,
          `<div class="d-flex align-items-center">
          <i data-feather="lock" class="me-2 text-primary" width="16" height="16"></i>
          <a href="${url}" target="_blank">
            <span class="fw-semibold text-primary opacity-75 tagetUrlHost text-break">${uri.hostname()}${uri.path()}</span>
          </a>
        </div>`,
          `<div class="ms-4">
            <nav class="nav flex-row mt-2" data-url='${url}'>
              <span class="pe-2 c-p text-primary-emphasis refreshBtn">${i18n(
                "refresh"
              )}</span>
              <span class="pe-2 c-p text-primary-emphasis copyBtn">${i18n(
                "copy"
              )}</span>
            </nav>
          </div>`,
        ].join("");
      }
    },
    renderUrlDetails($parentEle) {
      $parentEle.html(Module.getUrlDetailsHtml(state.result.targetUrl));
    },
    renderDashboardSummary() {
      const $dashboardSummary = $("#dashboardSummary").empty();
      const responseCount = state.statistics.responseCount;

      const summaryHtml = Object.keys(state.dashboard)
        .map((key) => {
          const { heading, data } = state.dashboard[key];
          const listItemsHtml = data
            .map((obj) => {
              const progressWidth = ((obj.value / responseCount) * 100).toFixed(
                2
              );
              return `
            <a href="#content/${obj.reportId}" class="list-group-item" data-reportid="${obj.reportId}">
              <p class="d-flex align-items-center justify-content-between mb-1">
                <span class="fw-bold">${obj.name}</span>
                <span>
                  <span class="fw-bold">${obj.value}</span>
                </span>
              </p>
              <div class="progress rounded-pill" style="height:6px">
                <div class="progress-bar bg-${obj.cls}" style="width:${progressWidth}%"></div>
              </div>
            </a>`;
            })
            .join("");

          return `
          <div class="col">
            <h6 class="card-title fw-bold mb-0 text-dark ps-3 mb-4 mt-4 mt-xl-0">${heading}</h6>
            <ul class="list-group list-group-flush">
              ${listItemsHtml}
            </ul>
          </div>`;
        })
        .join("");

      $dashboardSummary.append(summaryHtml);
    },
    renderSubCategories(category, $subCategories) {
      const subsections = state.groupedReports[category].subsections;

      const subCategoriesHtml = Object.keys(subsections)
        .map((subCat) => {
          const subCategoryHeader =
            category !== "security"
              ? `<div class="nav-header mt-2 text-uppercase">${subCat}</div>`
              : "";
          const reportsHtml = subsections[subCat]
            .map((report) => {
              if (report.reportGenerator.subcategory !== "hidden") {
                const status =
                  report.reportGenerator.priority === ReportPriority.info
                    ? `<span class="badge rounded-pill ms-auto text-success">${report.numTested}</span>`
                    : report.allPassed
                    ? '<i class="icon ms-auto text-success" data-feather="check" width="16" height="16" stroke-width="4"></i>'
                    : `<span class="badge rounded-pill ms-auto text-danger">${report.formattedPercentPassed}%</span>`;
                return `
            <div class="nav-item">
              <a href="#content/${report.id}" data-id="${report.id}" class="nav-link rounded-3">
                <span class="title">${report.reportGenerator.name}</span>
                ${status}
              </a>
            </div>`;
              }
            })
            .join("");
          return subCategoryHeader + reportsHtml;
        })
        .join("");

      $subCategories.empty().append(subCategoriesHtml);
    },
    renderSidebar() {
      Object.keys(state.groupedReports).forEach((cat) => {
        const $subCategoies = $(
          `.categoryNavItem[data-category="${cat}"] .subCategories`
        ).html("");
        Module.renderSubCategories(cat, $subCategoies);
      });
    },
    renderCommonReport() {
      $(".tagetUrlHost").text(state.result.tagetUrlHost);
      $(".overallScore").text(state.statistics.score + "%");
      $(".overallSeoScore").text(
        state.statistics.categoryScores.SEO.score + "%"
      );
      $(".overallSpeedScore").text(
        state.statistics.categoryScores.speed.score + "%"
      );
      $(".overallSecurityScore").text(
        state.statistics.categoryScores.security.score + "%"
      );
    },
    renderDashboard() {
      const $gauge = $(".gauge", $dashboardMain);

      $(".crawlTitle", $dashboardMain).text(
        state.result.targetUrlResponse.title
      );

      Module.renderUrlDetails($(".mainUrlCardBody", $dashboardMain));

      $(".urlCrawled").text(state.statistics.responseCount);
      $(".pagesCrawled", $dashboardMain).text(state.statistics.pagesCount);
      $(".brokenUrls", $dashboardMain).text(state.statistics.brokenUrlsCount);

      if ($gauge.length) {
        $gauge
          .circleProgress({
            // max: 100,
            value: state.statistics.score / 100,
            fill: "#4ac5f8",
          })
          .on(
            "circle-animation-progress",
            function (event, progress, stepValue) {
              $(this)
                .find("strong")
                .html(Math.round(100 * stepValue.toFixed(2)) + "<i>%</i>");
              // $(this).find('strong').text(stepValue.toFixed(2).substr(1));
            }
          );
      }

      Module.renderCommonReport();
      Module.renderSidebar();

      Module.renderDashboardSummary();
      feather.replace();
    },
    setupRows(results, columns, category, report) {
      const $resultsCon = $(".resultsCon", $contentMain).empty();
      const $headerTitles = $(".headerTitles", $contentMain).empty();

      let itemsPerLoad = 20;
      let currentIndex = 0;
      let allDataLoaded = false;

      $resultsCon.off("scroll");

      if (category !== "explore" && columns[1]) {
        $headerTitles.html(
          `<div class="p-4" style="width: ${columns[1].width}px"></div>`
        );
      }
      const headerHtml = columns
        .map((h) => {
          if (h.type !== "passed") {
            return `
            <div class="p-2 ${
              h.type === "url" ? "flex-fill headerTitleUrl" : ""
            }" ${h.width ? `style="width: ${h.width}px"` : ""}>
              <span class="text-uppercase fw-bold ${
                h.type === "list" ? "text-end" : ""
              }">${h.name}</span>
            </div>
          `;
          }
          return "";
        })
        .join("");

      $headerTitles.append(headerHtml);

      const headerHeight = $contentMainHeader.outerHeight();
      const availableHeight = $win.height() - headerHeight - 50;
      $resultsCon.css("max-height", availableHeight + "px");

      $win.resize(function () {
        const availableHeight = $win.height() - headerHeight - 80;
        $(".resultsCon").css("max-height", availableHeight + "px");
      });

      const urlW = $(".headerTitleUrl", $headerTitles).width();
      const startTime = Date.now();
      if (report.numFailed > 0 && columns[1] && columns[1].type === "passed") {
        results = results.sort((a, b) => {
          if (a[1] === b[1]) {
            return 0;
          } else if (a[1] === false) {
            return -1;
          } else if (b[1] === false) {
            return 1;
          } else {
            return 0;
          }
        });
      }

      //SC_LOG(4, 'setupRows columns', columns);

      const loadMoreItems = () => {
        const newResults = results.slice(
          currentIndex,
          currentIndex + itemsPerLoad
        );
        const resultsHtml = newResults
          .map((result) => {
            const res =
              category !== "explore" && result.length > 1
                ? result.slice(2)
                : result;
            const colFix = category !== "explore" && result.length > 1 ? 2 : 0;
            const resultContent = `
                ${
                  columns[1] && category !== "explore"
                    ? `
                    <div class="p-4" style="width: ${columns[1].width}px">
                        ${
                          columns[1].type === "passed" && result[1]
                            ? '<i data-feather="check" stroke-width="6" class="text-success"></i>'
                            : '<i data-feather="x" stroke-width="6" class="text-danger"></i>'
                        }
                    </div>
                `
                    : ""
                }
                ${
                  columns[0].type === "url"
                    ? `<div class="p-2 flex-fill" style="width:${urlW}px;">${Module.getUrlDetailsHtml(
                        result[0]
                      )}</div>`
                    : ""
                }
                ${
                  columns[1] && columns[1].type === "url"
                    ? `<div class="p-2 flex-fill" style="width:${urlW}px;">${Module.getUrlDetailsHtml(
                        result[1]
                      )}</div>`
                    : ""
                }
                ${
                  res && (colFix === 2 || columns[0].type !== "url")
                    ? res
                        .map((item, i) => {
                          const heading = columns[i + colFix];
                          if (heading) {
                            switch (heading.type) {
                              case "list":
                                return `<div class="p-2 text-end" ${
                                  heading.width
                                    ? `style="width: ${heading.width}px"`
                                    : ""
                                }>${
                                  item.length &&
                                  columns[1].type === "passed" &&
                                  !result[1]
                                    ? `<a class="d-flex justify-content-end align-items-center" href="#content/${
                                        report.id
                                      }/${URI.encodePathSegment(result[0])}">`
                                    : ""
                                }<span class="fw-bold ${
                                  columns[1]
                                    ? `${
                                        columns[1].type === "passed" &&
                                        result[1]
                                          ? "text-success"
                                          : "text-danger"
                                      }`
                                    : ""
                                }">${item.length || i18n("NoneFound")}</span> ${
                                  item.length &&
                                  columns[1].type === "passed" &&
                                  !result[1]
                                    ? `<span class="errorIcon ms-2"><i data-feather="arrow-right" stroke-width="3" class="text-white"></i></span>`
                                    : ""
                                }${
                                  columns[1].type === "passed" && !result[1]
                                    ? "</a>"
                                    : ""
                                }</div>`;
                              case "bool":
                                return `<div class="p-2" ${
                                  heading.width
                                    ? `style="width: ${heading.width}px"`
                                    : ""
                                }><span class="fw-bold text-success">${
                                  item
                                    ? '<i data-feather="check" stroke-width="6" class="text-success"></i>'
                                    : '<i data-feather="x" stroke-width="6" class="text-danger"></i>'
                                }</span></div>`;
                              case "code":
                                return `<div class="p-2" ${
                                  heading.width
                                    ? `style="width: ${heading.width}px"`
                                    : ""
                                }><span class="text-body-secondary">${
                                  item ? item : i18n("NoneFound")
                                }</span></div>`;
                              case "number":
                                return `<div class="p-2" ${
                                  heading.width
                                    ? `style="width: ${heading.width}px"`
                                    : ""
                                }><span class="fw-bold  ${
                                  columns[1]
                                    ? `${
                                        columns[1].type === "passed" &&
                                        result[1]
                                          ? "text-success"
                                          : "text-danger"
                                      }`
                                    : ""
                                }">${
                                  item ? item : i18n("NoneFound")
                                }</span></div>`;
                              default:
                                return `<div class="p-2" ${
                                  heading.width
                                    ? `style="width: ${heading.width}px"`
                                    : ""
                                }><span class="fw-bold">${
                                  item ? item : i18n("NoneFound")
                                }</span></div>`;
                            }
                          }
                        })
                        .join("")
                    : ""
                }`;

            return `
                <div class="card">
                    <div class="card-body d-flex align-items-center">
                        ${resultContent}
                    </div>
                </div>
            `;
          })
          .join("");

        $resultsCon.append(resultsHtml);
        if (currentIndex > results.length) {
          allDataLoaded = true;
          $resultsCon.off("scroll");
          //SC_LOG(4, 'All data loaded, scroll event unbound');
        }
        currentIndex += itemsPerLoad;
        //SC_LOG(4, 'loadMoreItems', currentIndex, itemsPerLoad);
        feather.replace();
      };

      loadMoreItems();

      $resultsCon.on("scroll", function () {
        if (allDataLoaded) {
          return;
        }
        //SC_LOG(3, '$resultsCon scroll', `$resultsCon.scrollTop(): ${$resultsCon.scrollTop()}, $resultsCon.innerHeight():${$resultsCon.innerHeight()}, $resultsCon[0].scrollHeight: ${$resultsCon[0].scrollHeight}`);
        //SC_LOG(3, '$resultsCon scroll final', `${$resultsCon.scrollTop() + $resultsCon.innerHeight()} >= ${$resultsCon[0].scrollHeight}`);
        if (
          $resultsCon.scrollTop() + $resultsCon.innerHeight() >=
          $resultsCon[0].scrollHeight - 20
        ) {
          loadMoreItems();
        }
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      //SC_LOG(4, "setupRows", "sorting", `Execution time: ${executionTime} ms`);
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    },
    openContentPage({ id, url }) {
      Module.showContent();
      const report = _.find(privateState.crawlReports, { id });
      const { category, name, summary, headings, priority } =
        report.reportGenerator;
      $(`.nav-item .nav-link[data-id]`, $dashboardSidebar).removeClass(
        "active"
      );
      $(`.nav-item .nav-link[data-id="${id}"]`, $dashboardSidebar).addClass(
        "active"
      );
      $contentMainHeader.html(`
      <div class="container-fluid">
        <div class="mt-4">
          <div class="d-flex align-items-center mb-2">
          ${
            report.allPassed
              ? `<span class="icon-xl rounded-circle p-2 me-2 bg-success text-white d-flex align-items-center justify-content-center"><i data-feather="check" stroke-width="6"></i></span>`
              : '<span class="icon-xl rounded-circle p-2 me-2 bg-danger text-white d-flex align-items-center justify-content-center"><i data-feather="x" stroke-width="6"></i></span>'
          }
            <h1 class="fw-bold h2 m-0 contentTitle">${name}</h1>
            <div class="ms-auto fw-bold fs-5">
            ${
              priority === ReportPriority.info
                ? `<span class="text-body-secondary"><span class="resultCount">${report.numTested}</span> results</span>`
                : `<span class="me-3 ${
                    report.allPassed ? "text-success" : ""
                  }">${report.numPassed}/${
                    report.numTested
                  }</span><span  class="${
                    report.allPassed ? "text-success" : "text-danger"
                  }">${report.formattedPercentPassed}%</span>`
            }
            </div>
          </div>
          <div class="contentUrlDetails"></div>
          <div class="contentSummary">${!url && summary ? summary : ""}</div>
        </div>
      </div>
      <div class="container-fluid border-top">
        <div class="d-flex align-items-center ps-5 pe-4 headerTitles">
        </div>
      </div>`);

      if (url) {
        const rId = URI.decode(url);
        const selectedRow = _.find(report.results, (row) => row[0] === rId);
        const subReportData = _.find(selectedRow, _.isArray);

        $(".contentUrlDetails", $contentMain).html(
          `<div class="p-2 flex-fill">${Module.getUrlDetailsHtml(
            rId,
            id
          )}</div>`
        );

        if (!subReportData) {
          //SC_LOG(3, "Url match not found", rId);
          return;
        }
        const columns = headings[_.indexOf(selectedRow, subReportData)].columns;
        Module.setupRows(subReportData, columns, category, report);
      } else {
        Module.setupRows(report.results, headings, category, report);
      }
    },
    renderAuditResults(category, subsections, $listGroup) {
      const resultHtml = Object.keys(subsections)
        .map((subCat) => {
          return subsections[subCat]
            .map((report) => {
              if (report.numTested) {
                const status = report.allPassed
                  ? `<i class="text-success" data-feather="check" stroke-width="4" width="18" height="18"></i>`
                  : `<i class="text-danger" data-feather="x" stroke-width="4" width="18" height="18"></i>`;
                return `<div class="col-6 avoid-page--break">
                    <p class="mb-1 print-pos-rel--zindex">
                      <span class="fw-bold">${
                        report.reportGenerator.name
                      }</span>
                    </p>
                    <div class="progress rounded-pill h-6 print-pos-rel--zindex">
                      <div class="progress-bar bg-primary rounded-pill" style="width:${
                        report.formattedPercentPassed
                      }%"></div>
                    </div>
                    <p class="d-flex align-items-center justify-content-between mb-0 mt-1 small">
                      <span class="text-body-secondary">${
                        report.numPassed
                      } ${i18n("outOf")} ${report.numTested}</span>
                      <span>
                        <span class="fw-bold me-1">${
                          report.formattedPercentPassed
                        }%</span>
                        ${status}
                      </span>
                    </p>
                  </div>`;
              }
            })
            .join("");
        })
        .join("");

      $listGroup.empty().append(resultHtml);
    },
    renderAuditReportSummary(reports, dashboard, statistics) {
      const $urlCheckedListGroup = $(
        "#urlCheckedListGroup",
        $auditReportMain
      ).empty();

      const responseCount = statistics.responseCount;

      const listTobeShown = [
        "crawled-urls",
        "pages",
        "internal-urls",
        "external-urls",
        "images",
        "css",
        "javascript",
      ];

      const urlSummary = Object.keys(dashboard)
        .map((key) => {
          const { data } = dashboard[key];

          return data
            .map((obj) => {
              if (listTobeShown.includes(obj.reportId)) {
                // const progressWidth = (
                //   (obj.value / responseCount) *
                //   100
                // ).toFixed(2);
                return `
                  <li class="list-group-item py-2 avoid-page--break" data-reportid="${obj.reportId}">
                    <p class="d-flex align-items-center justify-content-between mb-0 print--pos-rel-zindex">
                      <span class="fw-semibold">${obj.name}</span>
                      <span class="bg-${obj.cls}-subtle text-${obj.cls} py-1 px-4 rounded-pill fw-bold">${obj.value}</span>
                    </p>
                  </li>`;
              }
            })
            .join("");
        })
        .join("");

      $urlCheckedListGroup.append(urlSummary);
      $(".auditSummaryFor", $auditReportMain).html(
        `<p class="lead mb-0 text-dark fw-semibold"> ${i18n(
          "auditSummaryFor"
        )} </p><h1 class="mb-0 lh-1"><span class="text-primary fw-bold crawlHost">${
          statistics.hostName
        }</span></h1>`
      );

      Object.keys(state.groupedReports).forEach((cat) => {
        const $resultListGroup = $(
          `.resultListGroup[data-result-listgroup="${cat}"]`
        ).empty();
        const subsections = state.groupedReports[cat].subsections;
        Module.renderAuditResults(cat, subsections, $resultListGroup);
      });
    },
    openAuditReportPage() {
      // Object.assign(state, testState)
      const { reports, dashboard, statistics } = state;
      const $gauge = $(".gauge", $auditReportMain);
      const $categoryScores = $(".categoryScores", $auditReportMain);

      // Module.startTabs({});

      if ($gauge.length) {
        $gauge
          .circleProgress({
            // max: 100,
            size: 165,
            value: statistics.score / 100,
            //fill: "#0ea5e9",
            fill: {
              gradient: ["#38bcf8", "#0ea5e9", "#028ac7"],
            },
            lineCap: "round",
          })
          .on(
            "circle-animation-progress",
            function (event, progress, stepValue) {
              $(this)
                .find("strong")
                .html(Math.round(100 * stepValue.toFixed(2)) + "<i>%</i>");
            }
          );
      }

      Module.renderCommonReport();

      /* $(".categorySeoScore", $categoryScores)
        .find(".progress-bar")
        .width(statistics.categoryScores.SEO.score + "%");
      $(".categorySpeedScore", $categoryScores)
        .find(".progress-bar")
        .width(statistics.categoryScores.speed.score + "%");
      $(".categorySecurityScore", $categoryScores)
        .find(".progress-bar")
        .width(statistics.categoryScores.security.score + "%"); */

      $(".websiteCheckedOn").text(
        new Date(state.result.initiationTime).toUTCString()
      );
      Module.renderAuditReportSummary(reports, dashboard, statistics);
      Module.showAuditReport();
    },
    async updateCrawlStatusAndGenerateReports(save = true) {
      const { reports, statistics, dashboard } =
        await Module.generateReportsAndDashboard(globalReportSettings);
      //SC_LOG(4, { reports, statistics, dashboard });
      const groupedReports = generateReportCategories(reports, statistics);
      Object.assign(state.statistics, statistics);
      Object.assign(state.dashboard, dashboard);
      Object.assign(state.groupedReports, groupedReports);
      privateState.crawlReports = reports;
      setTimeout(() => {
        if (state.isDashboard) {
          Module.renderDashboard();
        } else {
          Module.onHashChange();
        }
      }, 500);
      // if (save) await Module.save();
    },
    resIfNoSuccess(status, url) {
      return {
        data: "",
        responseUrl: url,
        status: status,
        headers: {},
      };
    },
    getRequestID(url) {
      const metadata = state.requestMetadata[url] || {};
      return metadata ? metadata.requestId : "";
    },
    getRedirectsByRequestID(requestID) {
      return privateState.redirectsByReqtId[requestID] || [];
    },
    async getResData(url, requestOptions) {
      try {
        if (!privateState.urls[url]) {
          // const startTime = performance.now();
          //SC_LOG(1, `[SEOChecker] Before fetchWithTimeout ${url}, isCloudFlareDelay: ${privateState.isCloudFlareDelay}`);
          // if (privateState.isCloudFlareDelay) {
          //   privateState.isCloudFlareDelay = false;
          //   const cloudflareDelay = 1000;
          //   await new Promise(resolve => setTimeout(resolve, cloudflareDelay));
          //   if (!Utils.BlockConcurrentReq(cloudflareDelay)) {
          //     privateState.cloudflareDelay += cloudflareDelay;
          //   }
          //   //SC_LOG(1, `[SEOChecker] Cloudflare detected for ${url}, applying delay of ${privateState.cloudflareDelay} ms`);

          // }
          const response = await Module.fetchWithTimeout(url, requestOptions);
          ////SC_LOG(1, `[SEOChecker] After fetchWithTimeout ${url}`);
          // const endTime = performance.now();
          // const duration = endTime - startTime;
          // ////SC_LOG(1, `[SEOChecker] Fetch time for ${url}: ${dura  tion.toFixed(2)} ms`);

          // const serverHeader = response.data.headers.get('server');
          // const cfRayHeader = response.data.headers.get('cf-ray');
          // const isCloudflare = (serverHeader && serverHeader.toLowerCase().includes('cloudflare')) || cfRayHeader;
          // if (isCloudflare) {
          //   privateState.isCloudFlareDelay = true;
          //   //SC_LOG(1, `isCloudflare InitTime: ${state.result.initiationTime * 0.001} s, currTime: ${Date.now() * 0.001} s, Diff: ${(Date.now() - state.result.initiationTime) * 0.001}`);
          // }

          // if (response.data.status === 503 || response.data.status === 429) {
          //   ////SC_LOG(1, `[SEOChecker cloudflare testing] response for ${url} with status: ${response.data.status}`);
          // }
          // const retryAfter = response.data.headers.get('Retry-After');
          // if (retryAfter) {
          //   ////SC_LOG(1, `[SEOChecker cloudflare testing] headers - Rate limit reached. Retry after ${retryAfter} seconds for ${url} with status: ${response.data.status}`);
          // }
          if (response === "timeout") return Module.resIfNoSuccess(-1, url);

          if (response.status === 2) {
            return Module.resIfNoSuccess(0, url);
          }
          const headers = Module.getNormalizedHeaders(response.data.headers);
          const responseData = {
            responseUrl: response.data.url,
            status: response.data.status,
            headers: headers,
          };

          if (!headers["content-type"].includes("image/")) {
            responseData["data"] = await response.data.text();
          } else {
            const dataSize = await response.data.blob();
            responseData["dataSize"] = dataSize.length;
            responseData["imageAnalysis"] = await Helper.analyseImage(
              dataSize,
              url
            );
          }

          return responseData;
        } else {
          return privateState.urls[url];
        }
      } catch (error) {
        //SC_LOG(2, error);
        return Module.resIfNoSuccess(0, url);
      }
    },
    async dispatchReq(requestOptions) {
      const url = requestOptions.url;
      const resData = await Module.getResData(url, requestOptions);

      const responseUrl = resData.responseUrl || "";
      const metaData = state.requestMetadata[responseUrl] || {};
      const requestId = metaData ? metaData.requestId : "";
      const redirects = metaData
        ? privateState.redirectsByReqtId[requestId]
        : [];

      const responseDetails = {
        ...resData,
        requestUrl: requestOptions.url,
        destinationTo: undefined,
        requestMethod: requestOptions.method,
        requestId: requestId,
        redirects: redirects,
      };
      //SC_LOG(3, "[SEOChecker] dispatchReq url", url);
      requestOptions.callback(responseDetails);
    },
    async fetchWithTimeout(url, requestOptions) {
      const response = await Promise.race([
        Module.doFetch(url, requestOptions),
        new Promise((res, reject) =>
          setTimeout(() => res("timeout"), requestOptions.timeout)
        ),
      ]);
      return response;
    },
    getNormalizedHeaders(rawHeaders) {
      const headers = {};
      rawHeaders.forEach(
        (value, name) => (headers[name.trim().toLowerCase()] = value)
      );
      return headers;
    },
    mapUrl(urls) {
      return _.map(urls, (url) => ({ url }));
    },
    processRedirectChains: (responses) => {
      _.each(responses, (response) => {
        if (Helper.isRedirect(response)) {
          const maxRedirects = 10;
          const redirectChain = (function getRedirectChain(url, maxRedirects) {
            let chain = [];
            let nextUrl = responses[url]
              ? responses[url].destinationTo
              : undefined;

            for (let i = 0; i < maxRedirects && nextUrl; ++i) {
              chain.push(nextUrl);
              const nextResponse = responses[nextUrl];
              if (!nextResponse) break;
              nextUrl = nextResponse.destinationTo;
            }

            return chain;
          })(response.url, maxRedirects);

          const failureMsg =
            redirectChain.length >= maxRedirects
              ? i18n("MaxRedirectsReached")
              : "";

          response.failureMsg = failureMsg;
          response.success = !failureMsg;
          response.links = Module.mapUrl(redirectChain);
          response.forwardingTarget = redirectChain.length;
          response.finalRedirect = _.last(redirectChain);
        }
      });
    },
    collectInlinks: (responses) => {
      const inlinksMap = new Map();

      _.each(responses, (res) => {
        inlinksMap.set(res.url, new Set());
      });
      _.each(responses, (res) => {
        const urls = Helper.extractAllUrls(res);
        _.each(urls, (url) => {
          const map = inlinksMap.get(url);
          map && map.add(res.url);
        });
      });
      _.each(responses, (response) => {
        response.referringLinks = Array.from(inlinksMap.get(response.url));
      });
    },
    enrichResponseMetadata() {
      Module.processRedirectChains(state.result.responses);
      Module.collectInlinks(state.result.responses);
    },
    checkHomepageCanonicalization() {
      const responses = _.map(state.result.homeUrls, (url) =>
        Module.getResponse(url)
      );
      const urls = _.map(
        responses,
        (response) => response && (response.finalRedirect || response.url)
      );
      const firstUrl = _.first(urls);
      state.result.homeUrlsAreCanonicalized = _.every(
        urls,
        (url) => url === firstUrl
      );
    },
    postprocessResults() {
      // Constants.enableMutantUrlGeneration && Module.generateMutantResponses();
      Module.enrichResponseMetadata();
      Module.checkHomepageCanonicalization();
    },
    compileCrawlResults() {
      Module.postprocessResults();
      state.result.targetUrlResponse = Module.getResFollowingTargets(
        state.result.targetUrl
      );
      //SC_LOG(4, '[SEOChecker compileCrawlResults] targetUrl, targetUrlResponse', state.result.targetUrl, state.result.targetUrlResponse);
      // state.result.done = true;
      // state.result.endTime = _.now();
      // state.result.timeTaken = (state.result.endTime - state.result.initiationTime) / 1000;
      // state.result.responses = state.responses;
      //SC_LOG(4, '[SEOChecker] compileCrawlResults responses: ', state.result.responses);
      state.result.responseCount = _.size(state.result.responses);
      state.result.crawledUrlStack = state.crawledUrlStack;
    },
    finishQueuePromise() {
      return new Promise((resolve) => {
        Module.finishCrawl = _.once(() => {
          Module.updateStatus();
          if (!privateState.isStopped) {
            privateState.qStack.pause();
          }
          Module.compileCrawlResults();
          resolve();
        });
        privateState.qStack.drain(() => {
          if (!privateState.qStack.paused) {
            //SC_LOG(2, '[SEOChecker] finishQueuePromise qStack drain: auto stopped');
            state.manuallyStopped = false;
            Module.finishCrawl();
          }
        });
        // Module["queueDrain"] = finishCrawl;
      });
    },
    startPriorityQueue() {
      privateState.qStack = async.priorityQueue((task, cb) => {
        const startTime = Date.now();
        Module.updateUrlList(task.url);
        const handleRequest = () => {
          cb();
        };
        const handleError = (error) => {
          //SC_LOG(2, '[SEOChecker priorityQueue]', error.stack);
          handleRequest();
        };
        try {
          const requestOptions = {
            url: task.url,
            method: task.requestMethod,
            timeout: state.options.responseTimeout,
            callback: (response) => {
              if (Module.isNotPaused()) {
                try {
                  Module.processTask(task, response, handleRequest);
                } catch (error) {
                  //SC_LOG(2, '[SEOChecker processTask]', error.stack);
                  return handleRequest();
                }
              } else {
                privateState.qStack.push(task);
                Module.updateStatus();
                cb();
              }
            },
          };

          Module.controlReqFn(requestOptions);
        } catch (error) {
          handleError(error);
        }
      }, Constants.concurrentCrawReqCount);

      return Module.finishQueuePromise();
    },
    pause() {
      if (privateState.qStack) {
        privateState.qStack.pause();
        privateState.isPaused = true;
        clearInterval(privateState.updateStatusTimer);
        privateState.progress.pausedTime = Date.now();
        $loadingModalStatus.text(i18n("CrawlingPaused"));
        $("#pause_or_continue_crawl").text(i18n("ContinueCrawl"));
        //SC_LOG(4, '[SEOChecker] Crawl paused.');
      }
    },
    resume() {
      if (privateState.qStack && privateState.isPaused) {
        state.result.initiationTime =
          state.result.initiationTime +
          Date.now() -
          privateState.progress.pausedTime;
        privateState.progress.pausedTime = 0;
        privateState.qStack.resume();
        privateState.isPaused = false;
        Module.updateStatus();
        privateState.updateStatusTimer = window.setInterval(
          Module.updateModalProgress,
          1000
        );
        $loadingModalStatus.text(i18n("CheckingPages"));
        $("#pause_or_continue_crawl").text(i18n("PauseCrawl"));
        //SC_LOG(4, '[SEOChecker] Crawl resumed.');
        if (privateState.qStack.length() > 0) {
          privateState.qStack.process();
        }
      }
    },
    stop() {
      if (privateState.qStack) {
        privateState.qStack.pause();
        privateState.isStopped = true;
        if (Module.finishCrawl) {
          Module.finishCrawl();
        }
      }
    },
    onFinishSeeResults() {
      // state.stoppingCrawl = true;
      setTimeout(() => {
        if (privateState.qStack) {
          privateState.isPaused = false;
          state.manuallyStopped = true;
          Module.stop();
          if (privateState.progress.pausedTime === 0) {
            privateState.progress.pausedTime = Date.now();
          }
        }
      }, 50);
    },
    onPauseOrContinueCrawl() {
      // state.stoppingCrawl = true;
      setTimeout(() => {
        if (privateState.qStack) {
          privateState.isPaused ? Module.resume() : Module.pause();
        }
      }, 50);
    },
    onContinueCrawlingBtnClick() {
      // state.stoppingCrawl = true;
      setTimeout(() => {
        if (privateState.qStack) {
          state.crawlComplete = Module.finishQueuePromise();
          Module.isCrawlActivePromise = Module.process();
          state.result.initiationTime =
            state.result.initiationTime +
            Date.now() -
            privateState.progress.pausedTime;
          privateState.progress.pausedTime = 0;
          Module.updateStatus();
          Module.updateModalProgress();
          Module.showModal();
          Module.initModal();
          privateState.qStack.resume();
          privateState.isStopped = false;
          $("#pause_or_continue_crawl").text(i18n("PauseCrawl"));
          //SC_LOG(4, '[SEOChecker] Crawl continued.');
          if (privateState.qStack.length() > 0) {
            privateState.qStack.process();
          }
        }
      }, 50);
    },
    isValidCrawl() {
      return (
        state.urlOptions.targetUrl &&
        _.trim(state.urlOptions.targetUrl) &&
        !state.isUrlInProcess
      );
    },
    async startUrlProcessing() {
      try {
        state.error = "";
        if (!Module.isValidCrawl()) return;

        // Module.restoreDefaultSettingsKeepingCrawlUrl();

        if (state.skipSavingCrawl) {
          state.confirmBeforeClosingWindow = true;
        }

        // const normalizedUrl = Utils.normalizeURI(state.options.targetUrl);
        // const hostname = normalizedUrl.hostname();
        state.isDashboard = true;
        state.error = await Module.initiateCrawl();

        // const encodedCrawlUrl = encodeURIComponent(state.options.targetUrl);
        // const encodedError = encodeURIComponent(`"${state.error}"`);

        if (state.error) {
          //SC_LOG(2, i18n('UrlProcessingFailed'), state.error);
          Module.hideModal();
        } else {
          Module.showDashboard();
        }
      } catch (error) {
        //SC_LOG(2, 'startUrlProcessing', error);
        Module.hideModal();
      }
    },
    async fetchWithRetry(url, reqOptions, retryDelay = 0, maxRetries = 5) {
      let attempts = 0;

      while (attempts < maxRetries) {
        try {
          let response = await fetch(url, reqOptions);
          if (response.status === 200) {
            let responseData = await response.text();

            if (responseData.trim() === "") {
              reqOptions.credentials = "same-origin";
              response = await fetch(url, reqOptions);
              responseData = await response.text();
            }

            return { success: true, data: responseData, response };
          } else {
            // for errors like 404 or 500
            //SC_LOG(4, `Received HTTP status ${response.status}. Not retrying.`);
            return { success: false };
          }
        } catch (error) {
          if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError")
          ) {
            attempts++;
            //SC_LOG(4, `Network error fetching ${url}:`, error);
            retryDelay += 10;
            $loadingModalStatus.text(
              i18n("retryConnectMessage", [url, retryDelay])
            );
            if (attempts >= maxRetries) {
              //SC_LOG(4, `Max retries reached for ${url}. Stopping attempts.`);
              return { success: false, networkError: true };
            }
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * 1000)
            );
          } else {
            //SC_LOG(4, `Non-network error occurred: ${error.message}`);
            return { success: false, networkError: false };
          }
        }
      }

      return { success: false, networkError: false };
    },
    async findCorrectURL(u) {
      const urls = ["https://" + u, "http://" + u];

      let validUrl = "";
      privateState["reqOptions"] = Module.getReqOptions("GET");

      for (const url of urls) {
        const result = await Module.fetchWithRetry(
          url,
          privateState.reqOptions
        );
        if (result.success) {
          const response = result.response;
          const headers = Module.getNormalizedHeaders(response.headers);
          privateState.urls[url] = {
            data: result.data,
            responseUrl: response.url,
            status: response.status,
            headers: headers,
          };
          if (response.redirected) {
            validUrl = response.url;
          } else {
            validUrl = url;
          }
          break;
        }

        if (result.networkError) {
          validUrl = "networkError";
          break;
        }
      }

      return validUrl;
    },
    getValidUrl: async function (url) {
      const urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*$/;
      if (!urlRegex.test(url)) {
        url = "http://" + url;
      }
      try {
        const parsedUrl = new URL(url);
        url = parsedUrl.href.replace(parsedUrl.protocol + "//", "");
        // if(url.indexOf('www.') === -1){
        //   url = 'www.' + url;
        // }
        return await Module.findCorrectURL(url);
      } catch (error) {
        return false;
      }
    },
    validateBeforeStart: async function () {
      $start_btn.attr("disabled", true);
      Utils.setStorage({ scSettings: state.urlOptions });
      const val = $input_url.val().trim();
      const validUrl = await Module.getValidUrl(val);
      if (validUrl === "networkError") {
        Module.hideModal();
        scToast.show(i18n("CrawlingStoppedDueToNetworkError"), {
          background: "#d31919",
          color: "#fff",
          duration: 10000,
        });
      } else if (validUrl) {
        state.url = validUrl;
        state.urlOptions.targetUrl = validUrl;
        await Module.startUrlProcessing();
      } else {
        Module.hideModal();
        scToast.show(i18n("ErrorSiteNotReachable"), {
          background: "#d31919",
          color: "#fff",
          duration: 5000,
        });
      }
      $start_btn.removeAttr("disabled");
    },
    onInputUrlInput: function () {
      const val = $input_url.val();
      if (val) {
        $start_btn.removeAttr("disabled");
      } else {
        $start_btn.attr("disabled", true);
      }
    },
    onStartBtnClick: function (e) {
      e.preventDefault();
      Module.resetModalState();
      Module.showModal();
      Module.validateBeforeStart();
    },
    onInputKeypress(e) {
      const key = e.which;
      if (key == 13) {
        Module.validateBeforeStart();
        return false;
      }
    },
    onStartNewBtnClick: function (e) {
      e.preventDefault();
      Utils.openOrFocusAppPage("index");
    },
    onRestoreDefaultSettingsClick: function (e) {
      e.preventDefault();
      Module.initSettings(true);
      if (state.scMsgOn) {
        return;
      }
      const $cloParent = $(this).closest(".nav-item");
      $cloParent.append(
        $(
          `<div class="sc_message success">${i18n(
            "CrawlerSettingsRestoredMsg"
          )}</div>`
        )
      );
      state.scMsgOn = true;
      setTimeout(() => {
        $(".sc_message", $cloParent).fadeOut(300, function () {
          $(this).remove();
          state.scMsgOn = false;
        });
      }, 5000);
    },
    resetModalState() {
      $loading_list.html("");
      $checks_per_second.text(0.0);
      $urls_to_check.text(0);
      $urls_checked.text(0);
      $failed_responses.text(0);
      $threshold_explored.text(0);
      $duration.text("00:00:00");
    },
    addToLoadingList: (recentUrlList) => {
      if ($("li", $loading_list).length) {
        $("li", $loading_list).first().remove();

        // Append the new URLs
        recentUrlList.forEach(function (url) {
          $loading_list.append($("<li>").text(url));
        });

        // Ensure the container scrolls smoothly to the top after appending new items
        // $loading_list.animate({ scrollTop: 0 }, 200);
      } else {
        recentUrlList.forEach(function (url) {
          $loading_list.append($("<li>").text(url));
        });
      }
    },
    moveProgress: (progress, value) => {
      progress.css("width", `${value}%`);
    },
    msToHourSeconds(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const remainingSeconds = totalSeconds % 3600;

      return `${hours}h ${remainingSeconds}s`;
    },
    updateModalProgress() {
      if (!privateState.isPaused) {
        const progress = privateState.progress;
        // state.modalProgress = _.clone(progress);
        let time = _.now() - progress.initiationTime;
        if ($loading_list.length > 0) {
          Module.addToLoadingList(progress.recentUrlList);
        }
        //SC_LOG(4, 'updateModalProgress', { requestsProcessedPerSecond: progress.requestsProcessedPerSecond });
        $checks_per_second.text(
          Helper.formatNumber(progress.requestsProcessedPerSecond, 1)
        );
        $urls_to_check.text(Helper.formatNumber(progress.pendingRequestsCount));
        $urls_checked.text(
          Helper.formatNumber(progress.processedRequestsCount)
        );
        $failed_responses.text(
          Helper.formatNumber(progress.failedRequestsCount)
        );
        $threshold_explored.text(Helper.formatNumber(progress.exploredDepth));
        $duration.text(new Date(time).toISOString().substr(11, 8));
      }
    },
    showModal() {
      $loadingModal.show();
    },
    hideModal() {
      clearInterval(privateState.updateStatusTimer);
      $loadingModal.hide();
      // Module.resetModalState();
    },
    onHashChange() {
      const hash = window.location.hash.slice(1);
      const parts = hash.split("/");
      // const id = parts[parts.length - 1];

      switch (parts[0]) {
        case "home":
          state.isDashboard = true;
          Module.showDashboard();
          break;
        case "content":
          state.isDashboard = false;
          if (parts[2]) {
            Module.openContentPage({ id: parts[1], url: parts[2] });
          } else {
            Module.openContentPage({ id: parts[1] });
          }
          break;
        case "audit-report":
          if (SEO_CHECKER_CONFIG.showAuditReport) {
            state.isDashboard = false;
            Module.openAuditReportPage();
          }
          break;
      }
      feather.replace();
    },
  };

  $(document).ready(function () {
    Module.init();
  });
  generateRuleBasedData();

  function getTabUrl() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getTabUrl" }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        const { targetUrl } = response;
        const isValidUrl =
          targetUrl.startsWith("http") &&
          !targetUrl.startsWith("https://chrome.google.com/");
        //SC_LOG(3, '[SEO-CHECKER][getTabUrl] targetUrl', targetUrl);
        resolve(isValidUrl ? targetUrl : "");
      });
    });
  }
})();
