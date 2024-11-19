const browser = window.chrome;
const i18n = browser.i18n.getMessage.bind(browser);
const Constants = {
    uA: navigator?.userAgent ?? "Mozilla/5.0",
    seoCheckerNotFoundPage: "/seo-checker-not-found-page",
    concurrentCrawReqCount: 7,
    initDepth: 1,
    fileType: {
        link: "link",
        js: "js",
        css: "css",
        xml: "xml",
        image: "image",
        html: "html",
        unknown: "unknown",
        robots: "robots",
        sitemap: "sitemap",
        pdf: "pdf",
        redirect: "redirect"
    },
    testType: {
        Sitemap: "Sitemap",
        HomepageTest: "HomepageTest",
        NotFoundTest: "NotFoundTest"
    },
    requestMethod: {
        Get: "GET",
        Head: "HEAD",
        Post: "POST"
    },
    compression: {
        maxFileSizeInKB: 100,
        minDimensions: 1000
    },
    highResolution: {
        maxWidth: 2560,
        maxHeight: 1440
    },
    largeFile: {
        maxFileSizeInKB: 200
    }
}

const mainfest = chrome.runtime.getManifest();

const PageType = {
    robots: "robots",
    sitemap: "sitemap",
    image: "image",
    js: "js",
    css: "css",
    xml: "xml",
    link: "link",
    error: "error"
};

const defaultSettings = {
    targetUrl: "",
    processInDepthDir: true,
    processSubDomains: false,
    processNoIndexedPages: true,
    processIntLinks: true,
    processExtLinks: true,
    processPageImages: true,
    processPageCss: true,
    processPageJavascript: true,
    processRobotFile: true,
    processNotFoundTesting: true,
    thresholdLevel: 0,
    urlLimit: 10000,
    responseTimeout: 10000,
    hostName: "",
    userAgent: Constants.uA,
    excludePattern: "",
    includePattern: "",
    urlLimitToProcessPerSec: 30,
    urlsToProcess: []
}

const preSetMetaData = {
    SEO: {
        name: "SEO",
        subsections: [
            {
                id: "page-titles",
                name: i18n('PageTitles'),
                reports: [{
                    category: "SEO",
                    id: "set-page-titles",
                    name: i18n('SetPageTitles'),
                    subcategory: i18n('PageTitles'),
                    summary: i18n('SetPageTitlesSummary')
                }, {
                    category: "SEO",
                    id: "use-optimal-length-titles",
                    name: i18n('UseOptimalLengthTitles'),
                    subcategory: i18n('PageTitles'),
                    summary: i18n('UseOptimalLengthTitlesSummary')
                }, {
                    category: "SEO",
                    id: "use-unique-titles",
                    name: i18n('UseUniqueTitles'),
                    subcategory: i18n('PageTitles'),
                    "summary-screenshot": i18n('UseUniqueTitlesShortSummary'),
                    summary: i18n('UseUniqueTitlesSummary')
                }]
            }, {
                id: "page-headings",
                name: i18n('PageHeadings'),
                reports: [{
                    category: "SEO",
                    id: "set-h1-headings",
                    name: i18n('SetH1Headings'),
                    subcategory: i18n('PageHeadings'),
                    summary: i18n('SetH1HeadingsSummary')
                }, {
                    category: "SEO",
                    id: "use-one-h1-heading-per-page",
                    name: i18n('UseOneH1HeadingPerPage'),
                    subcategory: i18n('PageHeadings'),
                    summary: i18n('UseOneH1HeadingPerPageSummary')
                }, {
                    category: "SEO",
                    id: "use-optimal-length-h1-headings",
                    name: i18n('UseOptimalLengthH1Headings'),
                    subcategory: i18n('PageHeadings'),
                    summary: i18n('UseOptimalLengthH1HeadingsSummary')
                }, {
                    category: "SEO",
                    id: "use-unique-h1-headings",
                    name: i18n('UseUniqueH1Headings'),
                    subcategory: i18n('PageHeadings'),
                    summary: i18n('UseUniqueH1HeadingsSummary')
                }]
            }, {
                id: "page-descriptions",
                name: i18n('PageDescriptions'),
                reports: [{
                    category: "SEO",
                    id: "set-page-descriptions",
                    name: i18n('SetPageDescriptions'),
                    subcategory: i18n('PageDescriptions'),
                    summary: i18n('SetPageDescriptionsSummary')
                }, {
                    category: "SEO",
                    id: "use-optimal-length-descriptions",
                    name: i18n('UseOptimalLengthDescriptions'),
                    subcategory: i18n('PageDescriptions'),
                    summary: i18n('UseOptimalLengthDescriptionsSummary')
                }, {
                    category: "SEO",
                    id: "use-unique-descriptions",
                    name: i18n('UseUniqueDescriptions'),
                    subcategory: i18n('PageDescriptions'),
                    summary: i18n('UseUniqueDescriptionsSummary')
                }]
            }, {
                id: "url-names",
                name: i18n('UrlNames'),
                reports: [{
                    category: "SEO",
                    id: "use-short-urls",
                    name: i18n('UseShortUrls'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('UseShortUrlsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-underscores-in-urls",
                    name: i18n('AvoidUnderscoresInUrls'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('AvoidUnderscoresInUrlsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-url-extensions",
                    name: i18n('AvoidUrlExtensions'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('AvoidUrlExtensionsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-url-parameters",
                    name: i18n('AvoidUrlParams'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('AvoidUrlParamsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-symbols-in-urls",
                    name: i18n('AvoidSymbolsInUrls'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('AvoidSymbolsInUrlsSummary')
                }, {
                    category: "SEO",
                    id: "use-lowercase-urls",
                    name: i18n('UseLowercaseUrls'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('UseLowercaseUrlsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-deeply-nested-urls",
                    name: i18n('AvoidDeeplyNestedUrls'),
                    subcategory: i18n('UrlNames'),
                    summary: i18n('AvoidDeeplyNestedUrlsSummary')
                }]
            }, {
                id: "page-content",
                name: i18n('PageContent'),
                reports: [{
                    category: "SEO",
                    id: "avoid-thin-content-pages",
                    name: i18n('AvoidThinContentPages'),
                    subcategory: i18n('PageContent'),
                    summary: i18n('AvoidThinContentPagesSummary')
                }, {
                    category: "SEO",
                    id: "set-image-alt-text",
                    name: i18n('SetImageAltText'),
                    subcategory: i18n('PageContent'),
                    summary: i18n('SetImageAltTextSummary')
                }, {
                    category: "SEO",
                    id: "set-mobile-scaling",
                    name: i18n('SetMobileScaling'),
                    subcategory: i18n('PageContent'),
                    summary: i18n('SetMobileScalingSummary')
                }, {
                    category: "SEO",
                    id: "avoid-plugins",
                    name: i18n('AvoidPlugins'),
                    subcategory: i18n('PageContent'),
                    summary: i18n('AvoidPluginsSummary')
                }]
            }, {
                id: "duplicate-content",
                name: i18n('DuplicateContent'),
                reports: [{
                    category: "SEO",
                    id: "set-canonical-urls",
                    name: i18n('SetCanonicalUrls'),
                    subcategory: i18n('DuplicateContent'),
                    summary: i18n('SetCanonicalUrlsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-duplicate-pages",
                    name: i18n('AvoidDuplicatePageContent'),
                    subcategory: i18n('DuplicateContent'),
                    summary: i18n('AvoidDuplicatePageContentSummary')
                }]
            },
            {
                id: "image-analysis",
                name: i18n('ImageAnalysis'),
                reports: [
                    {
                        category: "SEO",
                        id: "are-image-compressed",
                        name: i18n('AreImagesCompressed'),
                        subcategory: i18n('ImageAnalysis'),
                        summary: i18n('AreImagesCompressedSummary')
                    }, {
                        category: "SEO",
                        id: "are-resolutions-too-high",
                        name: i18n('AreResolutionsTooHigh'),
                        subcategory: i18n('ImageAnalysis'),
                        summary: i18n('AreResolutionsTooHighSummary')
                    }, {
                        category: "SEO",
                        id: "are-file-sizes-large",
                        name: i18n('AreFileSizesTooLarge'),
                        subcategory: i18n('ImageAnalysis'),
                        summary: i18n('AreFileSizesTooLargeSummary')
                    }
                ]
            },
            {
                id: "links",
                name: i18n('Links'),
                reports: [{
                    category: "SEO",
                    id: "return-404-for-broken-links",
                    name: i18n('Use404CodeForBrokenURLs'),
                    subcategory: i18n('Links'),
                    summary: i18n('Use404CodeForBrokenUrlsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-broken-internal-links",
                    name: i18n('AvoidBrokenInternalLinks'),
                    subcategory: i18n('Links'),
                    summary: i18n('AvoidBrokenInternalLinksSummary')
                }, {
                    category: "SEO",
                    id: "avoid-broken-external-links",
                    name: i18n('AvoidBrokenExternalLinks'),
                    subcategory: i18n('Links'),
                    summary: i18n('AvoidBrokenExternalLinksSummary')
                }, {
                    category: "SEO",
                    id: "avoid-broken-page-resources",
                    name: i18n('AvoidBrokenPageResources'),
                    subcategory: i18n('Links'),
                    summary: i18n('AvoidBrokenPageResourcesSummary')
                }]
            }, {
                id: "robotstxt",
                name: "Robots.txt",
                reports: [{
                    category: "SEO",
                    id: "add-robotstxt-files",
                    name: i18n('UseRobotFiles'),
                    subcategory: "Robots.txt",
                    summary: i18n('UseRobotFilesSummary')
                }, {
                    category: "SEO",
                    id: "specify-sitemap-locations",
                    name: i18n('SetSitemapLocations'),
                    subcategory: "Robots.txt",
                    summary: i18n('SetSitemapLocationsSummary')
                }]
            }, {
                id: "redirects",
                name: i18n('Redirects'),
                reports: [{
                    category: "SEO",
                    id: "avoid-temporary-redirects",
                    name: i18n('AvoidTempRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('AvoidTempRedirectsSummary')
                }, {
                    category: "SEO",
                    id: "avoid-meta-redirects",
                    name: i18n('AvoidMetaRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('AvoidMetaRedirectsSummary')
                }]
            }, {
                id: "code-validation",
                name: i18n('CodeValidation'),
                reports: [{
                    category: "SEO",
                    id: "use-valid-html",
                    name: i18n('UseValidHTML'),
                    subcategory: i18n('CodeValidation'),
                    summary: i18n('UseValidHTMLSummary')
                }, {
                    category: "SEO",
                    id: "use-valid-css",
                    name: i18n('UseValidCSS'),
                    subcategory: i18n('CodeValidation'),
                    summary: i18n('UseValidCSSSummary')
                }, {
                    category: "SEO",
                    id: "use-valid-javascript",
                    name: i18n('UseValidJavaScript'),
                    subcategory: i18n('CodeValidation'),
                    summary: i18n('UseValidJavaScriptSummary')
                }]
            }]
    },
    explore: {
        name: "explore",
        url: "hidden",
        subsections: [
            {
                id: "overview",
                name: i18n('Overview'),
                reports: [{
                    category: "explore",
                    id: "all-urls",
                    name: i18n('AllUrls'),
                    subcategory: i18n('Overview'),
                    summary: i18n('AllUrlsSummary')
                }, {
                    category: "explore",
                    id: "internal-urls",
                    name: i18n('InternalUrls'),
                    subcategory: i18n('Overview'),
                    summary: i18n('InternalUrlsSummary')
                }, {
                    category: "explore",
                    id: "external-urls",
                    name: i18n('ExternalUrls'),
                    subcategory: i18n('Overview'),
                    summary: i18n('ExternalUrlsSummary')
                }, {
                    category: "explore",
                    id: "failing-urls",
                    name: i18n('FailingUrls'),
                    subcategory: i18n('Overview'),
                    summary: i18n('FailingUrlsSummary')
                }]
            }, {
                id: "status-codes",
                name: i18n('StatusCodes'),
                reports: [{
                    category: "explore",
                    id: "status-20x",
                    name: i18n('20xstatusSuccess'),
                    subcategory: i18n('StatusCodes'),
                    summary: i18n('20xstatusSuccessSummary')
                }, {
                    category: "explore",
                    id: "status-30x",
                    name: i18n('30xStatusRedirection'),
                    subcategory: i18n('StatusCodes'),
                    summary: i18n('30xStatusRedirectionSummary')
                }, {
                    category: "explore",
                    id: "status-40x",
                    name: i18n('40xStatusClientError'),
                    subcategory: i18n('StatusCodes'),
                    summary: i18n('40xStatusClientErrorSummary')
                }, {
                    category: "explore",
                    id: "status-50x",
                    name: i18n('50xStatusServerError'),
                    subcategory: i18n('StatusCodes'),
                    summary: i18n('50xStatusServerErrorSummary')
                }, {
                    category: "explore",
                    id: "status-other",
                    name: i18n('OtherStatus'),
                    subcategory: i18n('StatusCodes'),
                    summary: i18n('OtherStatusSummary')
                }]
            }, {
                id: "indexing",
                name: i18n('Indexing'),
                reports: [{
                    category: "explore",
                    id: i18n('PagesContainCanonicalLink'),
                    name: i18n('CanonicalPages'),
                    subcategory: i18n('Indexing'),
                    summary: ""
                }, {
                    category: "explore",
                    id: i18n('PagesNotContainCanonicalLink'),
                    name: i18n('NoncanonicalPages'),
                    subcategory: i18n('Indexing'),
                    summary: ""
                }, {
                    category: "explore",
                    id: "noindex",
                    name: i18n('NoindexPages'),
                    subcategory: i18n('Indexing'),
                    summary: i18n('NoindexPagesSummary')
                }, {
                    category: "explore",
                    id: "no-follow",
                    name: i18n('NofollowPages'),
                    subcategory: i18n('Indexing'),
                    summary: i18n('NofollowPagesSummary')
                }]
            }, {
                id: "url-types",
                name: i18n('UrlTypes'),
                reports: [{
                    category: "explore",
                    id: "pages",
                    name: i18n('Pages'),
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('PagesSummary')
                }, {
                    category: "explore",
                    id: "css",
                    name: i18n('CSS'),
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('CssSummary')
                }, {
                    category: "explore",
                    id: "javascript",
                    name: i18n('JavaScript'),
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('JavaScriptSummary')
                }, {
                    category: "explore",
                    id: "images",
                    name: i18n('Images'),
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('ImagesSummary')
                }, {
                    category: "explore",
                    id: "robotstxt",
                    name: "Robots.txt",
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('RobotsSummary')
                }, {
                    category: "explore",
                    id: "sitemap",
                    name: i18n('Sitemap'),
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('SitemapSummary')
                }, {
                    category: "explore",
                    id: "type-other",
                    name: i18n('Other'),
                    subcategory: i18n('UrlTypes'),
                    summary: i18n('OtherSummary')
                }]
            }, {
                id: "redirects",
                name: i18n('Redirects'),
                reports: [{
                    category: "explore",
                    id: "redirects",
                    name: i18n('Redirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('redirectsSummary')
                }, {
                    category: "explore",
                    id: "permanent-redirects",
                    name: i18n('PermanentRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('PermanentRedirectsSummary')
                }, {
                    category: "explore",
                    id: "temporary-redirects",
                    name: i18n('TempRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('TempRedirectsSummary')
                }, {
                    category: "explore",
                    id: "other-redirects",
                    name: i18n('OtherRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('OtherRedirectsSummary')
                }]
            }, {
                id: "hidden",
                name: i18n('Hidden'),
                reports: [{
                    category: "explore",
                    id: "outlinks",
                    name: i18n('Outlinks'),
                    subcategory: i18n('Hidden'),
                    summary: ""
                }, {
                    category: "explore",
                    id: "inlinks",
                    name: i18n('Inlinks'),
                    subcategory: i18n('Hidden'),
                    summary: ""
                }, {
                    category: "explore",
                    id: "response-headers",
                    name: i18n('ResponseHeaders'),
                    subcategory: i18n('Hidden'),
                    summary: ""
                }, {
                    category: "explore",
                    id: "document-structure",
                    name: i18n('DocumentStructure'),
                    subcategory: i18n('Hidden'),
                    summary: ""
                }, {
                    category: "explore",
                    id: "redirect-path",
                    name: i18n('RedirectPath'),
                    subcategory: i18n('Hidden'),
                    summary: ""
                }]
            }]
    },
    security: {
        name: "security",
        subsections: [
            {
                id: "https",
                name: "HTTPS",
                reports: [{
                    category: "security",
                    id: "use-https",
                    name: i18n('UseHttps'),
                    subcategory: "HTTPS",
                    summary: i18n('UseHttpsSummary')
                }, {
                    category: "security",
                    id: "avoid-mixed-content-errors",
                    name: i18n('AvoidMixedContent'),
                    subcategory: "HTTPS",
                    "summary-screenshot": i18n('AvoidMixedContentShortSummary'),
                    summary: i18n('AvoidMixedContentSummary')
                }, {
                    category: "security",
                    id: "secure-passwords-fields",
                    name: i18n('UseSecurePasswordForms'),
                    subcategory: "HTTPS",
                    "summary-screenshot": i18n('UseSecurePasswordFormsShortSummary'),
                    summary: i18n('UseSecurePasswordFormsSummary')
                }]
            }, {
                id: "hsts",
                name: "HSTS",
                reports: [{
                    category: "security",
                    id: "enable-hsts",
                    name: i18n('UseHsts'),
                    subcategory: "HSTS",
                    summary: i18n('UseHstsSummary')
                }, {
                    category: "security",
                    id: "allow-hsts-preload",
                    name: i18n('UseHstsPreload'),
                    subcategory: "HSTS",
                    summary: i18n('UseHstsPreloadSummary')
                }]
            }, {
                id: "content-sniffing",
                name: i18n('ContentSniffing'),
                reports: [{
                    category: "security",
                    id: "disable-content-sniffing",
                    name: i18n('UseSniffingProtection'),
                    subcategory: i18n('ContentSniffing'),
                    summary: i18n('UseSniffingProtectionSummary')
                }, {
                    category: "security",
                    id: "specify-mime-types",
                    name: i18n('SetMimeTypes'),
                    subcategory: i18n('ContentSniffing'),
                    summary: i18n('SetMimeTypesSummary')
                }]
            }, {
                id: "miscellaneous",
                name: i18n('General'),
                reports: [{
                    category: "security",
                    id: "restrict-iframe-usage",
                    name: i18n('UseClickjackProtection'),
                    subcategory: i18n('Miscellaneous'),
                    summary: i18n('UseClickjackProtectionSummary')
                }, {
                    category: "security",
                    id: "enable-xss-protection",
                    name: i18n('UseXssProtection'),
                    subcategory: i18n('Miscellaneous'),
                    summary: i18n('UseXssProtectionSummary')
                }, {
                    category: "security",
                    id: "hide-server-version-data",
                    name: i18n('HideServerVersionData'),
                    subcategory: i18n('Miscellaneous'),
                    summary: i18n('HideServerVersionDataSummary')
                }]
            }]
    },
    speed: {
        name: "speed",
        subsections: [
            {
                id: "page-size",
                name: i18n('PageSize'),
                reports: [{
                    category: "speed",
                    id: "compress-sent-data",
                    name: i18n('UseCompression'),
                    subcategory: i18n('PageSize'),
                    summary: i18n('UseCompressionSummary')
                }, {
                    category: "speed",
                    id: "avoid-recompressing-data",
                    name: i18n('AvoidRecompressingData'),
                    subcategory: i18n('PageSize'),
                    summary: i18n('AvoidRecompressingDataSummary')
                }, {
                    category: "speed",
                    id: "minify-files",
                    name: i18n('UseMinification'),
                    subcategory: i18n('PageSize'),
                    "summary-screenshot": i18n('UseMinificationShortSummary'),
                    summary: i18n('UseMinificationSummary')
                }, {
                    category: "speed",
                    id: "avoid-inline-sourcemaps",
                    name: i18n('AvoidInlineSourceMaps'),
                    subcategory: i18n('PageSize'),
                    summary: i18n('AvoidInlineSourceMapsSummary')
                }]
            }, {
                id: "caching",
                name: i18n('Caching'),
                reports: [{
                    category: "speed",
                    id: "enable-caching",
                    name: i18n('UseCaching'),
                    subcategory: i18n('Caching'),
                    summary: i18n('UseCachingSummary')
                }, {
                    category: "speed",
                    id: "use-long-caching-times",
                    name: i18n('UseLongCachingTimes'),
                    subcategory: i18n('Caching'),
                    summary: i18n('UseLongCachingTimesSummary')
                }, {
                    category: "speed",
                    id: "avoid-duplicate-resources",
                    name: i18n('AvoidDuplicateResources'),
                    subcategory: i18n('Caching'),
                    summary: i18n('AvoidDuplicateResourcesSummary')
                }]
            }, {
                id: "css",
                name: i18n('CSS'),
                reports: [{
                    category: "speed",
                    id: "avoid-inline-css",
                    name: i18n('AvoidExcessiveInlineCss'),
                    subcategory: i18n('CSS'),
                    summary: i18n('AvoidExcessiveInlineCssSummary')
                }, {
                    category: "speed",
                    id: "avoid-css-import",
                    name: i18n('AvoidCssImport'),
                    subcategory: i18n('CSS'),
                    summary: i18n('AvoidCssImportSummary')
                }]
            }, {
                id: "javascript",
                name: i18n('JavaScript'),
                reports: [{
                    category: "speed",
                    id: "defer-javascript-loading",
                    name: i18n('AvoidRenderBlockingJavaScript'),
                    subcategory: i18n('JavaScript'),
                    summary: i18n('AvoidRenderBlockingJavaScriptSummary')
                }, {
                    category: "speed",
                    id: "avoid-inline-javascript",
                    name: i18n('AvoidExcessiveInlineJavaScript'),
                    subcategory: i18n('JavaScript'),
                    summary: i18n('AvoidExcessiveInlineJavaScriptSummary')
                }]
            }, {
                id: "redirects",
                name: i18n('Redirects'),
                reports: [{
                    category: "speed",
                    id: "avoid-internal-link-redirects",
                    name: i18n('AvoidInternalLinkRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('AvoidInternalLinkRedirectsSummary')
                }, {
                    category: "speed",
                    id: "avoid-resource-redirects",
                    name: i18n('AvoidResourceRedirects'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('AvoidResourceRedirectsSummary')
                }, {
                    category: "speed",
                    id: "avoid-redirect-chains",
                    name: i18n('AvoidRedirectChains'),
                    subcategory: i18n('Redirects'),
                    summary: i18n('AvoidRedirectChainsSummary')
                }]
            }]
    }
};
function createConfigRule(config) {
    let urlColumn = new UrlColumn({
        name: "URL",
        sort: "asc",
        order: -1
    });
    let headings = config.headings;
    headings.unshift(urlColumn);
    const lastHeading = _.last(headings);
    if (lastHeading) {
        lastHeading.strong = true;
    }
    const id = config.id ? config.id : Helper.toKebabCase(config.name);
    config.id = id;
    if (SEO_CHECKER_RULES[config.category][id]) {
        config.priority = SEO_CHECKER_RULES[config.category][id].priority;
    } else {
        // console.log('not found id: ', id);
    }
    globalReportSettings.push(config);
}
function generateRuleBasedData() {
    const headingInstance = new PassedColumn();
    (() => {
        function filterValidUrls(res, urls, validator) {
            const uniqueUrls = _.uniq(urls);
            return _.filter(uniqueUrls, url => {
                const response = res.crawl.getResFollowingTargets(url);
                return !!response && (validator(response) && Helper.isBrokenUrl(response));
            });
        }
        createConfigRule({
            category: "SEO",
            subcategory: "page titles",
            id: "set-page-titles",
            name: i18n('SetPageTitles'),
            headings: [headingInstance, new TextColumn({
                name: i18n('Title'),
                hide: false
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.title;
                return [n.length > 0, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page titles",
            id: "set-h1-headings",
            name: i18n('SetH1Headings'),
            headings: [headingInstance, new TextColumn({
                name: i18n('H1Headings')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.primaryHeading;
                return [n.length > 0, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page titles",
            name: "use-one-h1-heading-per-page",
            headings: [headingInstance, new TextColumn({
                name: i18n('FirstH1')
            }), new ListColumn({
                name: i18n('H1sToFix')
            }, [new TextColumn({
                name: "H1"
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = 1 === e.primaryHeadings.length
                    , r = n ? [] : Helper.mapToArrays(e.primaryHeadings);
                return [n, e.primaryHeading, r]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page titles",
            name: "use-optimal-length-h1-headings",
            headings: [headingInstance, new TextColumn({
                name: "H1"
            }), new NumberColumn({
                name: i18n('Length'),
                strong: true
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.primaryHeading
                    , r = n.length >= t.config.minH1Length
                    , i = n.length <= t.config.maxH1Length;
                return [r && i, n, n.length]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page headings",
            id: "use-unique-h1-headings",
            name: i18n('UseUniqueH1Headings'),
            headings: [headingInstance, new LongTextColumn({
                name: "H1"
            }), new ListColumn({
                name: i18n('PagesWithSameH1')
            }, [new UrlColumn({
                name: i18n('URL')
            })])],
            filter: Helper.isHtmlInternalAndIndexable,
            test: function (e, t) {
                return Helper.extractRelatedLinks(e, "primaryHeading", t.indexablePagesByPrimaryHeading)
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page titles",
            id: "use-optimal-length-titles",
            name: i18n('UseOptimalLengthTitles'),
            headings: [headingInstance, new TextColumn({
                name: i18n('Title'),
                hide: false
            }), new NumberColumn({
                name: i18n('Length'),
                strong: true
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.title;
                return [n.length >= t.config.minTitleLength && n.length <= t.config.maxTitleLength, n, n.length]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page descriptions",
            id: "set-page-descriptions",
            name: i18n('SetPageDescriptions'),
            headings: [headingInstance, new LongTextColumn({
                name: i18n('Description')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.description;
                return [n.length > 0, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page descriptions",
            id: "use-optimal-length-descriptions",
            name: i18n('UseOptimalLengthDescriptions'),
            headings: [headingInstance, new LongTextColumn({
                name: i18n('Description')
            }), new NumberColumn({
                name: i18n('Length'),
                strong: true
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.description;
                return [n.length >= t.config.minDescriptionLength && n.length <= t.config.maxDescriptionLength, n, n.length]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page titles",
            id: "use-unique-titles",
            name: i18n('UseUniqueTitles'),
            headings: [headingInstance, new TextColumn({
                name: i18n('Title'),
                hide: false
            }), new ListColumn({
                name: i18n('PagesWithSameTitle')
            }, [new UrlColumn({
                name: i18n('URL')
            })])],
            filter: Helper.isHtmlInternalAndIndexable,
            test: function (e, t) {
                return Helper.extractRelatedLinks(e, "title", t.indexablePagesByTitle)
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page descriptions",
            id: "use-unique-descriptions",
            name: i18n('UseUniqueDescriptions'),
            headings: [headingInstance, new LongTextColumn({
                name: i18n('Description')
            }), new ListColumn({
                name: i18n('PagesWithSameDescription')
            }, [new UrlColumn({
                name: i18n('URL')
            })])],
            filter: Helper.isHtmlInternalAndIndexable,
            test: function (e, t) {
                return Helper.extractRelatedLinks(e, "description", t.indexablePagesByDescription)
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "use-short-urls",
            name: i18n('UseShortUrls'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('UrlLength')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                const n = e.url.length;
                return [n <= t.config.maxUrlLength, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "avoid-url-extensions",
            name: i18n('AvoidUrlExtensions'),
            headings: [headingInstance, new TextColumn({
                name: i18n('Extension')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e) {
                const t = e.urlSuffix;
                return [!t, t]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "avoid-url-parameters",
            name: i18n('AvoidUrlParams'),
            headings: [headingInstance, new TextColumn({
                name: i18n('UrlParams')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e) {
                const t = e.urlQuery;
                return [!t, t]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "avoid-symbols-in-urls",
            name: i18n('AvoidSymbolsInUrls'),
            headings: [headingInstance, new TextColumn({
                name: "Symbols"
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e) {
                const t = e.pathSegment.replace(/[a-zA-Z0-9\-_/.]/g, "");
                return [!t, t]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "use-lowercase-urls",
            name: i18n('UseLowercaseUrls'),
            headings: [headingInstance],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e) {
                const t = e.urlHostname + e.pathSegment;
                return [t === t.toLowerCase()]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "avoid-underscores-in-urls",
            name: i18n('AvoidUnderscoresInUrls'),
            headings: [headingInstance],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e) {
                return [!_.includes(e.pathSegment, "_")]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "URL names",
            id: "avoid-deeply-nested-urls",
            name: i18n('AvoidDeeplyNestedUrls'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('Subfolders')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                const n = (e.pathSegment.match(/\//g) || "").length;
                return [n <= t.config.maxSlashesInUrl, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page content",
            id: "avoid-thin-content-pages",
            name: i18n('AvoidThinContentPages'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('WordCount')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = e.wordCount;
                return [n >= t.config.minWordsPerPage, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page content",
            id: "set-image-alt-text",
            name: i18n('SetImageAltText'),
            headings: [headingInstance, new ListColumn({
                name: i18n('MissingAltTags')
            }, [new UrlColumn({
                name: i18n('ImageUrl')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: (e, t) => {
                const n = _.filter(e.images, e => !!e.url && void 0 === e.alt)
                    , i = _.map(n, e => e.url);
                return [_.isEmpty(i), Helper.mapToArrays(i)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page content",
            id: "set-mobile-scaling",
            name: i18n('SetMobileScaling'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('ViewportSetting'),
                width: TableColumn.bigWidth
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                return [Helper.isNotEmpty(e.viewport), e.viewport]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "page content",
            id: "avoid-plugins",
            name: i18n('AvoidPlugins'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('PluginTags')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                const n = e.pluginsTagging.length;
                return [0 === n, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "Duplicate content",
            name: i18n('SetCanonicalUrls'),
            id: "set-canonical-urls",
            furtherReading: [],
            headings: [headingInstance, new UrlColumn({
                name: i18n('CanonicalUrl')
            }), new TextColumn({
                name: i18n('Issue')
            })],
            filter: Helper.isHtmlInternalAndRobotIndexed,
            test: (page, responseHelper) => {
                const canonicalUrl = page.canonicalUrl;
                const canonicalResponse = canonicalUrl ? responseHelper.getResponse(canonicalUrl) : undefined;
                let errorMessage = "";

                if (page.canonicalError) {
                    errorMessage = page.canonicalError;
                } else if (canonicalUrl) {
                    if (canonicalResponse) {
                        if (Helper.isBrokenUrl(canonicalResponse)) {
                            errorMessage = i18n('CanonicalUrlStatus', [canonicalResponse.status]);
                        } else if (Helper.isRedirect(canonicalResponse)) {
                            errorMessage = i18n('CanonicalUrlRedirects');
                        } else if (!Helper.isNonLink(canonicalResponse)) {
                            if (Helper.isHtml(canonicalResponse)) {
                                if (!canonicalResponse.canonicalUrl || canonicalResponse.isSelfCanonical) {
                                    if (page.indexable && !canonicalResponse.metaRobotsIndex) {
                                        errorMessage = i18n('CanonicalUrlNotIndexable');
                                    }
                                } else {
                                    errorMessage = i18n('CanonicalUrlPointsToCanonicalizedPage');
                                }
                            } else {
                                errorMessage = i18n('CanonicalUrlNotPage');
                            }
                        }
                    } else {
                        errorMessage = i18n('CanonicalUrlNotSet');
                    }
                }

                return [!errorMessage, page.canonicalUrl || "", errorMessage || ""];
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "duplicate content",
            id: "avoid-duplicate-pages",
            name: i18n('AvoidDuplicatePages'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('DataUniqueHash'),
                hide: true
            }), new ListColumn({
                name: i18n('DuplicatePages')
            }, [new UrlColumn({
                name: i18n('URL')
            })])],
            filter: Helper.isHtmlInternalAndIndexable,
            test: function (e, t) {
                return Helper.extractRelatedLinks(e, "uniqueHashValue", t.indexablePagesByUniqueHashValue)
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "image analysis",
            id: "are-image-compressed",
            name: i18n('AreImagesCompressed'),
            headings: [headingInstance, new BooleanColumn({
                name: i18n('Compressed')
            })],
            filter: Helper.isImage,
            test: function (e, t) {
                // SC_LOG(1, "imageanalysis", e,t);
                return [e.imageAnalysis.isCompressed, e.imageAnalysis.isCompressed]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "image analysis",
            id: "are-resolutions-too-high",
            name: i18n('AreResolutionsTooHigh'),
            headings: [headingInstance, new TextColumn({
                name: i18n('ResolutionTooHigh')
            })],
            filter: Helper.isImage,
            test: function (e, t) {
                return [!e.imageAnalysis.resolutionTooHigh, e.imageAnalysis.resolutions]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "image analysis",
            id: "are-file-sizes-large",
            name: i18n('AreFileSizesTooLarge'),
            headings: [headingInstance, new TextColumn({
                name: i18n('FileSizeTooLarge')
            })],
            filter: Helper.isImage,
            test: function (e, t) {
                return [!e.imageAnalysis.fileSizeTooLarge, e.imageAnalysis.size]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "Links",
            id: "return-404-for-broken-links",
            name: i18n('setNotFoundPage'),
            headings: [headingInstance, new UrlColumn({
                name: i18n('RedirectTarget')
            }), new CodeColumn({
                name: i18n('HttpResponseCode')
            })],
            filter: Helper.isNotFoundTest,
            test: function (e, t) {
                const { response: n, destination: r } = t.getResAndFollowingTargets(e.url)
                    , i = r ? r.status : "";
                return [404 === i, r && r !== n ? r.url : "", String(i)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "Links",
            id: "avoid-broken-internal-links",
            name: i18n('AvoidBrokenInternalLinks'),
            headings: [headingInstance, new ListColumn({
                name: i18n('BrokenLinks')
            }, [new UrlColumn({
                name: i18n('BrokenLinks')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (t, n) {
                const i = filterValidUrls(n, _.map(t.links, e => e.url), Helper.isInternal);
                return [_.isEmpty(i), Helper.mapToArrays(i)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "Links",
            id: "avoid-broken-external-links",
            name: i18n('AvoidBrokenExternalLinks'),
            headings: [headingInstance, new ListColumn({
                name: i18n('BrokenLinks')
            }, [new UrlColumn({
                name: i18n('BrokenLinks')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (t, n) {
                const i = filterValidUrls(n, _.map(t.links, e => e.url), Helper.isExternal);
                return [_.isEmpty(i), Helper.mapToArrays(i)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "Links",
            id: "avoid-broken-page-resources",
            name: i18n('AvoidBrokenPageResources'),
            headings: [headingInstance, new ListColumn({
                name: i18n('BrokenResources')
            }, [new UrlColumn({
                name: i18n('BrokenResources')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (t, n) {
                const i = filterValidUrls(n, Helper.extractAllUrls(t), Helper.isTrue);
                return [_.isEmpty(i), Helper.mapToArrays(i)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "robots.txt",
            id: "add-robotstxt-files",
            name: i18n('AddRobotFiles'),
            headings: [headingInstance, new UrlColumn({
                name: i18n('RedirectTarget')
            })],
            filter: Helper.isRobotsTxt,
            test: function (e, t) {
                const n = e.finalRedirect
                    , r = n ? t.crawl.responses[n] : e;
                return [Helper.isStatus200(r), n || ""]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "robots.txt",
            id: "specify-sitemap-locations",
            name: i18n('SpecifySitemapLocations'),
            headings: [headingInstance],
            filter: Helper.isSitemap,
            test: function (e, res) {
                const n = res.crawl.getResFollowingTargets(e.url);
                return [Boolean(n && n.type === Constants.fileType.sitemap)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "redirects",
            id: "avoid-meta-redirects",
            name: i18n('AvoidMetaRedirects'),
            headings: [headingInstance, new UrlColumn({
                name: i18n('MetaRedirectTarget')
            })],
            filter: Helper.isMetaRefresh,
            test: function (e) {
                const n = e.metaRefreshUrl;
                return [!n, n]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "redirects",
            id: "avoid-temporary-redirects",
            name: i18n('AvoidTemporaryRedirects'),
            headings: [headingInstance, new UrlColumn({
                name: i18n('RedirectTarget')
            }), new CodeColumn({
                name: i18n('RedirectStatus')
            })],
            filter: Helper.isExternalRedirect,
            test: function (e) {
                return [Helper.isPermanentRedirect(e), e.finalRedirect ? e.finalRedirect : "", "" + e.status]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "code validation",
            id: "use-valid-html",
            name: i18n('UseValidHTML'),
            headings: [headingInstance, new ListColumn({
                name: i18n('HtmlErrors')
            }, [new CodeColumn({
                name: i18n('HtmlErrors'),
                width: TableColumn.autoW
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e) {
                return [_.isEmpty(e.errors), Helper.mapToArrays(e.errors)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "code validation",
            id: "use-valid-css",
            name: i18n('UseValidCSS'),
            headings: [headingInstance, new ListColumn({
                name: i18n('CssErrors')
            }, [new CodeColumn({
                name: i18n('CssErrors'),
                width: TableColumn.autoW
            })])],
            filter: Helper.isCss,
            test: function (e) {
                return [_.isEmpty(e.errors), Helper.mapToArrays(e.errors)]
            }
        });
        createConfigRule({
            category: "SEO",
            subcategory: "code validation",
            id: "use-valid-javascript",
            name: i18n('UseValidJavaScript'),
            headings: [headingInstance, new ListColumn({
                name: i18n('JsErrors')
            }, [new CodeColumn({
                name: i18n('JsErrors'),
                width: TableColumn.autoW
            })])],
            filter: Helper.isJs,
            test: function (e) {
                return [_.isEmpty(e.errors), Helper.mapToArrays(e.errors)]
            }
        });
    })();

    (() => {
        createConfigRule({
            category: "speed",
            subcategory: "page size",
            id: "compress-sent-data",
            name: i18n('CompressSentData'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('ContentEncoding')
            })],
            filter: Helper.isLargeTextAsset,
            test: function (e, t) {
                return [e.compressed, e.responseHeaders["content-encoding"]]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "page size",
            id: "avoid-recompressing-data",
            name: i18n('AvoidRecompressingData'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('ContentEncoding')
            })],
            filter: Helper.isImageOrPdf,
            test: function (e, t) {
                return [!e.compressed, e.responseHeaders["content-encoding"]]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "page size",
            id: "minify-files",
            name: i18n('MinifyFiles'),
            headings: [headingInstance, new BooleanColumn({
                name: i18n('Minified')
            })],
            filter: Helper.isJsOrCss,
            test: function (e, t) {
                return [e.minified, e.minified]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "page size",
            id: "avoid-inline-sourcemaps",
            name: i18n('AvoidInlineSourcemaps'),
            headings: [headingInstance, new BooleanColumn({
                name: i18n('SourcemapFree')
            })],
            filter: Helper.isJsOrCss,
            test: function (e, t) {
                return [_.isEmpty(e.includesSourceMap), _.isEmpty(e.includesSourceMap)]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "javascript",
            id: "avoid-inline-javascript",
            name: i18n('AvoidInlineJavaScript'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('InlineJsChars')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, res) {
                return [e.jsInlining <= res.config.maxJsBytes, e.jsInlining]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "javascript",
            id: "defer-javascript-loading",
            name: i18n('DeferJavaScriptLoading'),
            headings: [headingInstance, new ListColumn({
                name: i18n('BlockingJsFiles')
            }, [new UrlColumn({
                name: i18n('BlockingJavaScriptUrl')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                let n = e.js
                    , i = _.filter(n, (function (e) {
                        return !(e.async || e.defer || e.atPageEnd)
                    }
                    ))
                    , o = _.map(i, e => {
                        let t;
                        return t = [e.url],
                            t
                    }
                    );
                return [_.isEmpty(i), o]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "CSS",
            id: "avoid-inline-css",
            name: i18n('AvoidInlineCss'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('InlineCssBytes')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                return [e.cssInlining <= t.config.maxCssBytes, e.cssInlining]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "CSS",
            id: "avoid-css-import",
            name: i18n('AvoidCssImport'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('CssImports')
            })],
            filter: Helper.isCss,
            test: function (e, t) {
                return [0 === e.importedCss, e.importedCss]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "redirects",
            id: "avoid-internal-link-redirects",
            name: i18n('AvoidInternalLinkRedirects'),
            headings: [headingInstance, new ListColumn({
                name: i18n('RedirectingOutlinks')
            }, [new UrlColumn({
                name: i18n('RedirectingOutlinks')
            }), new UrlColumn({
                name: i18n('RedirectTarget')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                var n = _.filter(e.links, (function (e) {
                    let n = t.crawl.responses[e.url];
                    return !!n && (Helper.isInternal(n) && Helper.isRedirect(n))
                }
                ))
                    , i = _.map(n, e => {
                        const n = t.getResponse(e.url);
                        return [e.url, n && n.finalRedirect || ""]
                    }
                    );
                return [_.isEmpty(n), i]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "redirects",
            id: "avoid-resource-redirects",
            name: i18n('AvoidResourceRedirects'),
            headings: [headingInstance, new ListColumn({
                name: i18n('RedirectingResources')
            }, [new UrlColumn({
                name: i18n('RedirectingResources')
            })])],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                const n = Helper.extractAllUrls(e);
                let i = _.filter(n, (function (e) {
                    let n = t.crawl.responses[e];
                    return !!n && Helper.isRedirect(n)
                }
                ));
                return [_.isEmpty(i), Helper.mapToArrays(i)]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "redirects",
            id: "avoid-redirect-chains",
            name: i18n('AvoidRedirectChains'),
            headings: [headingInstance, new UrlColumn({
                name: i18n('RedirectTarget')
            }), new NumberColumn({
                name: i18n('ChainLength')
            })],
            filter: Helper.isExternalRedirect,
            test: function (e, t) {
                return [e.forwardingTarget <= 1, e.finalRedirect ? e.finalRedirect : "", e.links.length]
            }
        });
        createConfigRule({
            id: "enable-caching",
            category: "speed",
            subcategory: "caching",
            name: i18n('AllowCaching'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('CacheDisablingOptions')
            })],
            filter: Helper.isJsOrCssOrImage,
            test: function (e, t) {
                const cacheOptions = [e.noCacheCache ? "no-cache" : "", e.noStoreCache ? "no-store" : ""];
                const cacheControlHeader = Helper.generateCacheControlHeader(cacheOptions, ", ");
                return [!cacheControlHeader, cacheControlHeader]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "caching",
            id: "use-long-caching-times",
            name: i18n('UseLongCachingTimes'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('CacheTimeUsed')
            }), new NumberColumn({
                name: i18n('CachedTimeInMins')
            })],
            filter: Helper.isJsOrCssOrImage,
            test: function (e, t) {
                let n = 0
                    , r = "";
                void 0 !== e.maxAgeCache ? (r = "max-age",
                    n = e.maxAgeCache) : void 0 !== e.cacheExpirationTime && (r = "expires",
                        n = e.cacheExpirationTime);
                const i = n ? n / 60 : 0;
                return [i >= 1440, r, i]
            }
        });
        createConfigRule({
            category: "speed",
            subcategory: "caching",
            id: "avoid-duplicate-resources",
            name: i18n('AvoidDuplicateResources'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('DataUniqueHashValue'),
                hide: true
            }), new ListColumn({
                name: i18n('DuplicateResources')
            }, [new UrlColumn({
                name: i18n('URL')
            })])],
            filter: Helper.isJsOrCss,
            test: function (e, t) {
                return Helper.extractRelatedLinks(e, "contentHash", t.indexablePagesByContentHash)
            }
        })
    })();

    (() => {
        createConfigRule({
            category: "security",
            subcategory: "HTTPS",
            id: "use-https",
            name: i18n('UseHttps'),
            headings: [headingInstance],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                return [Helper.isHttps(e)]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "HTTPS",
            id: "avoid-mixed-content-errors",
            name: i18n('AvoidMixedContentErrors'),
            headings: [headingInstance, new ListColumn({
                name: i18n('InsecureResources')
            }, [new UrlColumn({
                name: i18n('InsecureResource')
            })])],
            filter: Helper.isHtmlAndInternalAndHttps,
            test: function (e, t) {
                return [_.isEmpty(e.nonSecureResources), Helper.mapToArrays(e.nonSecureResources)]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "HTTPS",
            id: "secure-passwords-fields",
            name: i18n('SecurePasswordsFields'),
            headings: [headingInstance, new BooleanColumn({
                name: i18n('HttpsPage')
            }), new BooleanColumn({
                name: i18n('PostAction')
            }), new BooleanColumn({
                name: i18n('HttpsAction')
            })],
            filter: Helper.isPasswordInput,
            test: function (e, t) {
                let n = Helper.isHttps(e)
                    , r = !e.passwordInFormNotByPost
                    , i = !e.unsecuredFormSubmission;
                return [n && r && i, n, r, i]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "HSTS",
            id: "enable-hsts",
            name: i18n('EnableHsts'),
            headings: [headingInstance, new NumberColumn({
                name: i18n('HstsMaxAge')
            }), new BooleanColumn({
                name: i18n('IncludeSubDomains')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                return [e.maxAgeHSTS > 0, e.maxAgeHSTS, e.includeSubdomainsHSTS]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "HSTS",
            id: "allow-hsts-preload",
            name: i18n('AllowHstsPreload'),
            headings: [headingInstance, new BooleanColumn({
                name: i18n('PreloadSet')
            }), new BooleanColumn({
                name: i18n('IncludeSubDomains')
            }), new NumberColumn({
                name: i18n('HstsExpiry')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                return [e.preloadHSTS && e.maxAgeHSTS >= 31536e3 && e.includeSubdomainsHSTS, e.preloadHSTS, e.includeSubdomainsHSTS, e.maxAgeHSTS]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "content sniffing",
            id: "specify-mime-types",
            name: i18n('SpecifyMimeTypes'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('ContentTypeHeader')
            })],
            filter: Helper.isNonLinkInternalNonRedirectNotError,
            test: function (e, t) {
                const n = e.responseHeaders["content-type"] || "";
                return [Helper.isNotEmpty(n), n]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "content sniffing",
            id: "disable-content-sniffing",
            name: i18n('DisableContentSniffing'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('XContentTypeOptionsHeader')
            })],
            filter: Helper.isNonLinkInternalNonRedirectNotError,
            test: function (e, t) {
                let n = e.responseHeaders["x-content-type-options"];
                return [e.sniffingDisabled, n]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "miscellaneous",
            id: "restrict-iframe-usage",
            name: i18n('RestrictIframeUsage'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('xFrameOptions')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                let n = e.responseHeaders["x-frame-options"];
                return [e.xFrameOptionsSet, n]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "miscellaneous",
            id: "enable-xss-protection",
            name: i18n('EnableXssProtection'),
            headings: [headingInstance, new CodeColumn({
                name: i18n('XXssProtectionHeader')
            })],
            filter: Helper.isInteralHtmlNotNotFound,
            test: function (e, t) {
                let n = e.responseHeaders["x-xss-protection"];
                return [e.xssProtectionHeaderSet, n]
            }
        });
        createConfigRule({
            category: "security",
            subcategory: "miscellaneous",
            id: "hide-server-version-data",
            name: i18n('HideServerVersionData'),
            headings: [headingInstance, new ListColumn({
                name: i18n('ServerVersionHeaders')
            }, [new CodeColumn({
                name: i18n('ServerVersionHeaders')
            })])],
            filter: Helper.isInternal,
            test: function (e, t) {
                const n = [{
                    name: "server",
                    passes: function (e) {
                        return !/\d/.test(e)
                    }
                }, {
                    name: "x-powered-by"
                }, {
                    name: "x-aspnet-version"
                }, {
                    name: "x-aspnetmvc-version"
                }]
                    , i = _.compact(_.map(n, (function (t) {
                        const n = t.passes
                            , r = t.name
                            , i = e.responseHeaders[r];
                        return !!i && ((!n || !n(i)) && `${r}: ${i}`)
                    }
                    )));
                return [_.isEmpty(i), Helper.mapToArrays(i)]
            }
        })
    })();

    (() => {
        function createConfigRules(name, subcategory, filter, id, summary, furtherReading) {
            createConfigRule({
                category: "explore",
                subcategory: subcategory,
                name: name,
                summary: summary || "",
                furtherReading: furtherReading || null,
                filter: filter,
                id: id,
                headings: [],
                test: function (e, t) {
                    return [true]
                }
            })
        }
        createConfigRules(i18n('CrawledUrls'), i18n('Overview'), Helper.isTrue, 'crawled-urls', i18n('CrawledUrlsSummary'));
        createConfigRules(i18n('InternalUrls'), i18n('Overview'), Helper.isInternal, "internal-urls", i18n('InternalUrlsLargeSummary'));
        createConfigRules(i18n('ExternalUrls'), i18n('Overview'), Helper.isExternal, "external-urls", i18n('ExternalUrlsLargeSummary'));
        createConfigRules(i18n('Pages'), i18n('UrlTypes'), Helper.isInteralHtmlNotNotFound, "pages", i18n('PagesSummary'));
        createConfigRules(i18n('CSS'), i18n('UrlTypes'), Helper.isCss, "css", i18n('CssSummary'));
        createConfigRules(i18n('JavaScript'), i18n('UrlTypes'), Helper.isJs, "javascript", i18n('JavaScriptSummary'));
        createConfigRules(i18n('Images'), i18n('UrlTypes'), Helper.isImage, "images", i18n('ImagesSummary'));
        createConfigRules("Robots.txt", i18n('UrlTypes'), Helper.isRobotsTxt, void 0, i18n('RobotsSummary'));
        createConfigRules(i18n('Sitemap'), i18n('UrlTypes'), Helper.isSitemap, "sitemap", i18n('SitemapSummary'));
        createConfigRules(i18n('Other'), i18n('UrlTypes'), Helper.isNonResource, "type-other", i18n('OtherSummary'));
        createConfigRules(i18n('SuccessStatus'), i18n('StatusCodes'), Helper.isStatus2xx, "status-2xx", i18n('SuccessStatusSummary'));
        createConfigRules(i18n('RedirectionStatus'), i18n('StatusCodes'), Helper.isStatus3xx, "status-3xx", i18n('RedirectionStatusSummary'));
        createConfigRules(i18n('ClientErrorStatus'), i18n('StatusCodes'), Helper.isStatus4xx, "status-4xx", i18n('ClientErrorStatusSummary'));
        createConfigRules(i18n('ServerErrorStatus'), i18n('StatusCodes'), Helper.isStatus5xx, "status-5xx", i18n('ServerErrorStatusSummary'));
        createConfigRules(i18n('ConnectionErrors'), i18n('StatusCodes'), Helper.isStatusNegativeOrZero, "status-connection-error", i18n('ConnectionErrorSummary'));
        createConfigRules(i18n('BrokenUrls'), i18n('StatusCodes'), Helper.isBrokenUrl, "status-error", i18n('BrokenUrlSummary'));
        createConfigRules(i18n('PagesWithoutCanonicalTag'), i18n('Canonicalization'), Helper.hasNoCanonical, "pages-without-canonical", i18n('PagesWithoutCanonicalTagSummary'));
        createConfigRules(i18n('PagesWithCanonicalTag'), i18n('Canonicalization'), Helper.hasCanonical, "pages-with-canonical", i18n('PagesWithCanonicalTagSummary'));
        createConfigRules(i18n('CanonicalisedPages'), i18n('Canonicalization'), Helper.isSelfCanonicalAndHasNoCanonical, "canonicalised-pages", i18n('CanonicalisedPageSummary'));
        createConfigRules(i18n('SelfCanonicalPages'), i18n('Canonicalization'), Helper.isSelfCanonical, "self-canonical-pages", i18n('SelfCanonicalPageSummary'));
        createConfigRules(i18n('IndexablePages'), i18n('Indexing'), Helper.isHtmlInternalAndIndexable, "indexable-pages", i18n('IndexablePageSummary'));
        createConfigRules(i18n('NonIndexablePages'), i18n('Indexing'), Helper.isHtmlInternalAndNotIndexable, "non-indexable-pages", i18n('NonIndexablePageSummary'));
        createConfigRules(i18n('NoindexPages'), i18n('Indexing'), Helper.isHtmlInternalAndNotRobotIndexed, "noindex-pages", i18n('NoindexPageLargeSummary'), {
            label: i18n('BlockSearchEngineIndexing'),
            url: "https://support.google.com/webmasters/answer/93710?hl=en"
        });
        createConfigRules(i18n('NofollowPages'), i18n('Indexing'), Helper.isHtmlInternalAndNotRobotFollowed, "no-follow", i18n('NofollowPagesSummary'));
        createConfigRules(i18n('Redirects'), i18n('redirects'), Helper.isRedirect, 'redirects', i18n('AllRedirectsCrawled'));
        createConfigRules(i18n('PermanentRedirects'), i18n('redirects'), Helper.isPermanentRedirect, "permanent-redirects", i18n('PermanentRedirectsSummary'));
        createConfigRules(i18n('TempRedirects'), i18n('redirects'), Helper.isTemporaryRedirect, "temporary-redirects", i18n('TempRedirectsSummary'));
        createConfigRules(i18n('OtherRedirects'), i18n('redirects'), Helper.isNonPermanentRedirect, "other-redirects", i18n('OtherRedirectsSummary'));
        createConfigRule({
            category: "explore",
            subcategory: i18n('hidden'),
            hidden: true,
            id: "outlinks",
            name: i18n('Outlinks'),
            summary: "",
            furtherReading: [],
            headings: [new ListColumn({
                name: i18n('Outlinks')
            }, [new UrlColumn({
                name: i18n('Outlinks')
            })])],
            filter: Helper.isTrue,
            test: function (e, t) {
                const n = _.filter(_.map(e.links, e => e.url), Helper.isNotEmpty);
                let i = Array.from(new Set(n));
                return [Helper.mapToArrays(i)]
            }
        });
        createConfigRule({
            category: "explore",
            subcategory: i18n('hidden'),
            hidden: true,
            id: "redirect-path",
            name: i18n('RedirectPath'),
            summary: "",
            furtherReading: [],
            headings: [new ListColumn({
                name: i18n('RedirectChain')
            }, [new UrlColumn({
                name: i18n('UrlInRedirectPath')
            }), new NumberColumn({
                name: i18n('PathPosition')
            })])],
            filter: Helper.isRedirect,
            test: function (e, t) {
                let n = 1;
                return [_.filter(_.map(e.links, e => [e.url, n++]), Helper.isNotEmpty)]
            }
        });
        createConfigRule({
            category: "explore",
            subcategory: i18n('hidden'),
            hidden: true,
            id: "inlinks",
            name: i18n('Inlinks'),
            summary: "",
            furtherReading: [],
            filter: Helper.isTrue,
            headings: [new ListColumn({
                name: i18n('Inlinks')
            }, [new UrlColumn({
                name: i18n('Inlinks')
            })])],
            test: function (e, t) {
                return [Helper.mapToArrays(e.referringLinks)]
            }
        });
        createConfigRule({
            category: "explore",
            subcategory: i18n('hidden'),
            hidden: true,
            id: "response-headers",
            name: i18n('ResponseHeaders'),
            summary: "",
            furtherReading: [],
            filter: Helper.isTrue,
            headings: [new ListColumn({
                name: i18n('Headers')
            }, [new CodeColumn({
                name: i18n('HeaderName')
            }), new CodeColumn({
                name: i18n('Value'),
                width: TableColumn.autoW
            })])],
            test: function (e, t) {
                return [_.map(e.responseHeaders, (e, t) => [t, e])]
            }
        })
    })();

    loadPreSetMetaData();

    _.forEach(globalReportSettings, s => {
        const parsedSummary = marked.parse(s.summary);
        s.summary = parsedSummary;
    });
}

function loadPreSetMetaData() {
    const metadata = preSetMetaData;
    const mergedMetadata = {};
    for (const category in metadata) {
        if (category === "explore")
            continue;
        const subsections = metadata[category].subsections;
        for (const subCategory in subsections) {
            const reports = subsections[subCategory].reports;
            const indexedReports = _.keyBy(reports, report => report.id);
            _.extend(mergedMetadata, indexedReports);
        }
    }
    globalReportSettings.forEach(guideline => {
        const id = guideline.id;
        if (!id)
            throw console.error(guideline),
            new Error("id not found");

        const metadataEntry = mergedMetadata[id];
        if (metadataEntry) {
            guideline.summary = metadataEntry.summary;
            guideline.name = metadataEntry.name;
            guideline.subcategory = metadataEntry.subcategory;
        } else if (guideline.category !== "explore" && !guideline.hidden) {
            console.error("guidelines doesn't have rule with id", id);
        }
    });
}
function defaultOptionsPerUrl() {
    return {
        forwardingTarget: -1,
        finalRedirect: void 0,
        destinationTo: "",
        isIntDestination: false,
        jsInlining: -1,
        cssInlining: -1,
        pluginsTagging: [],
        languageDetected: "",
        viewport: "",
        description: "",
        charset: "",
        passwordInputsCount: -1,
        unsecuredFormSubmission: false,
        passwordInFormNotByPost: false,
        errors: [],
        uncompressedSize: -1,
        responseSuccessful: 1,
        cacheExpirationTime: -1,
        maxAgeCache: -1,
        noStoreCache: false,
        noCacheCache: false,
        preloadHSTS: false,
        maxAgeHSTS: -1,
        includeSubdomainsHSTS: false,
        importedCss: 0,
        internal: false,
        status: -1,
        contentType: "",
        sniffingDisabled: false,
        url: "",
        processingTime: -1,
        referringLinks: [],
        title: "",
        images: [],
        links: [],
        headings: [],
        primaryHeading: "",
        primaryHeadings: [],
        canonicalUrl: undefined,
        isSelfCanonical: false,
        canonicalError: "",
        hreflangs: {},
        publisherUrl: "",
        authorUrl: "",
        entityTag: "",
        xMetadata: {},
        openGraphMetadata: {},
        uniqueHashValue: -1,
        characterSetHeader: "",
        textFrequencies: [],
        wordCount: -1,
        metaRefreshUrl: "",
        metaRobotsIndex: false,
        indexable: true,
        robotsMetaFollow: false,
        xFrameOptionsSet: false,
        css: [],
        js: [],
        frames: [],
        favicons: [],
        nextUrl: "",
        prevUrl: "",
        sitemaps: [],
        responseHeaders: {},
        contentHash: "",
        urlSuffix: "",
        pathSegment: "",
        urlQuery: "",
        urlHostname: "",
        urlFilename: "",
        protocol: "",
        nonSecureResources: [],
        sourceMapUrl: "",
        includesSourceMap: "",
        xssProtectionHeaderSet: false,
        minified: false,
        compressed: false,
        success: true,
        failureMsg: "",
        resTransmissionTime: 0,
        downloadingTime: 0,
        responseTime: 0,
        contentSize: 0,
        threshold: -100,
        lastModified: 0
    };
}