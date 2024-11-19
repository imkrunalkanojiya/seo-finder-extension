function analyzePage(urlResponse, responseDetails) {
    const parsedHtml = Helper.parseHtml(urlResponse.data);
    const $parsed = createjQueryInstance(parsedHtml);
    const href = $parsed("head base").attr("href") || "";
    const baseUrl = href ? Utils.resolveURL(urlResponse.url, href) : urlResponse.url;
    const metaTags = extractMetaTags($parsed);
    const pageMetadata = Object.assign(Object.assign({}, urlResponse), {
        metaTags: metaTags,
        absUrlFromCurrentPage: (uri) => Utils.resolveURL(baseUrl, uri).toString(),
        absUriFromCurrentPage: (uri) => Utils.resolveURL(baseUrl, uri),
        absUrlFromCurrentPageOrUndefined: (url) => typeof url === void 0 ? void 0 : pageMetadata.absUrlFromCurrentPage(url),
        $parsed: $parsed,
        html: parsedHtml,
        baseUrl
    });
    const analyzedCss = analyzeCss(pageMetadata);
    const resourcesData = {
        favicons: analyzeFavicons(pageMetadata),
        images: analyzeImages(pageMetadata),
        frames: analyzeFrames(pageMetadata),
        css: analyzedCss.css,
        js: analyzeJavascript(pageMetadata)
    };
    const filteredResources = function filterInsecureResources(urls) {
        return {
            nonSecureResources: _.filter(urls, url => _.startsWith(url, "http://"))
        };
    }(Helper.extractAssetUrls(resourcesData));
    return extractFeatures(urlResponse, pageMetadata, responseDetails, resourcesData, analyzedCss, filteredResources);
}

function extractFeatures(urlResponse, pageMetadata, responseDetails, resourcesData, analyzedCss, filteredResources) {
    return Object.assign({}, responseDetails, {
        type: Constants.fileType.html
    }, resourcesData, filteredResources, function () {
        const descriptionMeta = pageMetadata.$parsed("meta[name=description]").attr("content");
        const description = Helper.processHTML(descriptionMeta);
        return {
            viewport: Helper.processHTML(pageMetadata.$parsed("meta[name=viewport]").attr("content")) || "",
            languageDetected: Helper.processHTML(pageMetadata.$parsed("html")[0].lang),
            charset: Helper.processHTML(pageMetadata.html.charset),
            characterSetHeader: _.includes(pageMetadata.getResponseHeader("content-type").toLowerCase(), "charset=") ? "true" : "",
            ...parseTitle(pageMetadata.html),
            description: description,
            prevUrl: pageMetadata.$parsed("link[rel=prev]").attr("href") || "",
            nextUrl: pageMetadata.$parsed("link[rel=next]").attr("href") || "",
            ...function () {
                const { canonicalUrl, canonicalError } = function () {
                    function createUriObject(uri, type) {
                        return {
                            uri: Utils.normalizeURI(uri),
                            type: type
                        }
                    }
                    function createError(error) {
                        return {
                            canonicalUrl: undefined,
                            canonicalError: error
                        }
                    }
                    let linkHeader = pageMetadata.getResponseHeader("link");
                    let baseUrl = pageMetadata.baseUrl;
                    let links = [];
                    if (linkHeader.startsWith('/')) {
                        baseUrl = baseUrl.replace(/\/$/, '');
                        linkHeader = `<${baseUrl}${linkHeader}>`;
                    }
                    try {
                        links = Link.parse(linkHeader).get("rel", "canonical");
                    } catch (error) {
                        SC_LOG(2, "[SEOChecker] header link parse", error.stack);
                        links = [];
                    }
                    const headerLinks = _.map(links, uri => createUriObject(uri.uri, "header"));
                    const canonicalTags = _.map(pageMetadata.$parsed("head link[rel=canonical]"), uri => createUriObject($(uri).attr("href"), "tag"));
                    const allLinks = [...headerLinks, ...canonicalTags];

                    if (allLinks.length === 0)
                        return createError(i18n('NoCanonicalTagHeaderFound'));
                    if (headerLinks.length > 1)
                        return createError(i18n('MultipleCanonicalHeadersFound'));
                    if (canonicalTags.length > 1)
                        return createError(i18n('MultipleCanonicalTagsFound'));
                    if (headerLinks.length > 0 && canonicalTags.length > 0)
                        return createError(i18n('CanonicalHeadersTagsUsedAtSameTime'));
                    const canonicalUri = _.first(allLinks).uri;
                    if (!canonicalUri)
                        return createError(i18n('UnknownError'));
                    const canonicalUrl = String(canonicalUri);
                    return canonicalUrl ? canonicalUri.protocol() ? {
                        canonicalUrl: canonicalUrl,
                        canonicalError: ""
                    } : createError(i18n('CanonicalShouldBeAbsoluteError', [_.first(allLinks).type])) : createError(i18n('CanonicalEmptyUrlError', [_.first(allLinks).type]))
                }();
                const isSelfCanonical = !!canonicalUrl && pageMetadata.url === canonicalUrl;
                const isCanonicalError = !!canonicalUrl && pageMetadata.url !== canonicalUrl;
                const robotsMeta = parseRobotsMeta(pageMetadata);
                const isIndexable = !!robotsMeta.metaRobotsIndex && !isCanonicalError;
                return {
                    isSelfCanonical: isSelfCanonical,
                    canonicalUrl: canonicalUrl,
                    canonicalError: canonicalError,
                    indexable: isIndexable,
                    ...robotsMeta
                };
            }(),
            publisherUrl: pageMetadata.$parsed("link[rel=publisher]").attr("href") || "",
            authorUrl: pageMetadata.$parsed("link[rel=author]").attr("href") || ""
        };
    }(), {
        downloadingTime: 0,
        responseTime: 0,
        resTransmissionTime: new Date(pageMetadata.getResponseHeader("date")).getTime() || 0,
        contentSize: parseInt(pageMetadata.getResponseHeader("content-length")),
        minified: (pageMetadata.html,
            pageMetadata.$parsed("html").clone().find("pre, code").remove(),
            true)
    }, Helper.extractCacheHeaders(urlResponse), parseRobotsMeta(pageMetadata), Helper.parseSecurityHeaders(urlResponse), {
        xFrameOptionsSet: null !== pageMetadata.getResponseHeader("x-frame-options").trim().toLowerCase().match(/(^deny$)|(^sameorigin$)|(^allow-from\s)/)
    }, function () {
        let containsNonSecureForm = false;
        let containsNonSecureAction = false;
        const forms = pageMetadata.$parsed("form:has(input[type=password])");
        _.each(forms, function (form) {
            const method = ($(form).attr("method") || "get").trim().toLowerCase();
            if (method !== "post")
                containsNonSecureForm = true;
            const action = $(form).attr("action") || pageMetadata.url;
            if (pageMetadata.absUriFromCurrentPage(action).protocol() !== "https")
                containsNonSecureAction = true;
        });
        return {
            passwordInputsCount: forms.length,
            passwordInFormNotByPost: containsNonSecureForm,
            unsecuredFormSubmission: containsNonSecureAction
        };
    }(), function () {
        const strictTransportSecurity = pageMetadata.getResponseHeader("strict-transport-security");
        const parsedHsts = Helper.parseHeaderValues(strictTransportSecurity);
        const maxAgeHSTS = parseInt(parsedHsts["max-age"]) || 0;
        function isPropertyUndefined(property) {
            return parsedHsts.hasOwnProperty(property) && typeof parsedHsts[property] === "undefined";
        }
        const preloadHSTS = isPropertyUndefined("preload");
        const includeSubdomainsHSTS = isPropertyUndefined("includeSubDomains");
        return {
            maxAgeHSTS: maxAgeHSTS,
            preloadHSTS: preloadHSTS,
            includeSubdomainsHSTS: includeSubdomainsHSTS
        };
    }(), {
        cssInlining: _.reduce(pageMetadata.$parsed("*[style]"), (sum, styleTag) => ($(styleTag).attr("style") || "").length + sum, 0) + pageMetadata.$parsed("style").text().length
    }, {
        xssProtectionHeaderSet: null !== pageMetadata.getResponseHeader("x-xss-protection").trim().match(/^\s*1\s*;\s*mode=block\s*(;|$)/)
    }, {
        jsInlining: pageMetadata.$parsed("script:not([src]):not([type]), script:not([src])[type*='ecmascript' i], script:not([src])[type*='javascript' i]").text().length
    }, function () {
        const h1Texts = _.map(pageMetadata.$parsed("body h1"), h1 => Helper.extractAltTextFromElement(h1));
        return {
            headings: [],
            primaryHeading: h1Texts[0] || "",
            primaryHeadings: h1Texts
        };
    }(), {
        pluginsTagging: _.map(pageMetadata.$parsed("embed, object, applet"), () => "")
    }, {
        links: _.map(pageMetadata.$parsed("a"), function (linkElement) {
            const altText = Helper.extractAltTextFromElement(linkElement);
            const relAttribute = ($(linkElement).attr("rel") || "").toLowerCase().trim().replace(/ +/g, " ").split(" ");
            const href = $(linkElement).attr("href") || "";
            return {
                url: pageMetadata.absUrlFromCurrentPage(href) || "",
                text: altText,
                follow: !_.includes(relAttribute, "nofollow")
            };
        })
    }, function () {
        const keywords = extractKeywordsFromElement(pageMetadata.html);
        const uniqueHashValueAndFrequencies = getUniqueHashValueAndTextFrequencies(keywords);
        return {
            wordCount: keywords.length,
            uniqueHashValue: uniqueHashValueAndFrequencies.uniqueHashValue
        };
    }(), {
        xMetadata: _.reduce(pageMetadata.$parsed('meta[name^="twitter"]'), (result, element) => {
            const name = $(element).attr("name") || "";
            const content = $(element).attr("content") || "";
            result[name] = content;
            return result;
        }, {}),
        openGraphMetadata: _.reduce(pageMetadata.$parsed('meta[property^="og"]'), (result, element) => {
            const property = $(element).attr("property") || "";
            const content = $(element).attr("content") || "";
            result[property] = content;
            return result;
        }, {})
    }, {
        hreflangs: {},
        metaRefreshUrl: ""
    }, {
        errors: _.take(lintHTML(pageMetadata.data), 5)
    }, {
        cssNotInHead: analyzedCss.cssNotInHead,
        internal: true,
        processingTime: 0,
        tag: Constants.testType.HomepageTest,
        failureMsg: "",
        referringLinks: []
    });

}

function parsePageErrors(data) {
    return _.take(lintHTML(data), 5)
}
function lintHTML(e) {
    try {
        const lintResult = HTMLHint.HTMLHint.verify(e, {
            "attr-no-duplication": true,
            "tag-pair": true,
            "doctype-first": true,
            "doctype-html5": true,
            "spec-char-escape": true,
            "id-unique": true,
            "src-not-empty": true
        });
        return _.map(lintResult, function (error) {
            return Helper.formatErrorMessage(error.line, error.col, error.message);
        });
    } catch (error) {
        SC_LOG(2, 'lintHTML', error);
        return [];
    }
}
function parseTitle($h) {
    return {
        title: Helper.processHTML($("title", $h).first().text())
    }
}
function extractKeywordsFromElement(element) {
    var clonedBody = $("body", element).clone();
    clonedBody.find("script").remove();
    clonedBody.find("style").remove();
    clonedBody.find("h1").remove();
    $("*", clonedBody).append(".");
    var textContent = $(clonedBody).text().toLowerCase();
    textContent = (textContent = textContent.replace(/  /g, " ")).replace(/["\.]|'s/g, " ");
    return textContent.split(/[^a-z0-9]+/);
}
function parseRobotsMeta(pageMetadata) {
    let indexAllowed = true;
    let followAllowed = true;
    const robotsContent = Helper.processHTML(pageMetadata.$parsed("meta[name=robots]").attr("content"));

    if (robotsContent) {
        const directives = _.map(_.split(robotsContent, ","), directive => _.toLower(_.trim(directive)));

        _.each(directives, directive => {
            if (directive === "noindex") {
                indexAllowed = false;
            } else if (directive === "nofollow") {
                followAllowed = false;
            }
        });
    }

    return {
        metaRobotsIndex: indexAllowed,
        robotsMetaFollow: followAllowed
    };
}

function extractMetaTags($parsed) {
    const metaTags = {};
    const metaElements = $parsed("meta");
    _.map(metaElements, ele => {
        _.each(ele.attributes, attribute => {
            const attributeName = attribute.name.toLowerCase().trim();
            const attributeValue = attribute.value;
            metaTags[attributeName] = attributeValue;
        });
    });
    return metaTags;
}

function extractRedirectUrl($parsed, pageMetadata) {
    const content = (($parsed("meta[http-equiv=refresh]").attr("content") || "").match(/url\s*=\s*['"]?\s*([^'\s]*)['"]?/i) || [])[1];
    return pageMetadata.absUrlFromCurrentPage(content)
}

function analyzeCss(pageMetadata) {
    let cssNotInHead = [];
    const css = _.map($("link[rel=stylesheet]", pageMetadata.html), function (link) {
        const isLinkInHead = _.isEmpty($(link).parent("head"));
        const href = $(link).attr("href");
        const absoluteUrl = pageMetadata.absUrlFromCurrentPageOrUndefined(href) || "";
        if (absoluteUrl && isLinkInHead) {
            cssNotInHead.push(absoluteUrl);
        }
        return {
            url: absoluteUrl
        };
    });
    return {
        cssNotInHead: cssNotInHead,
        css: css
    };
}

function analyzeFavicons(pageMetadata) {
    return _.map(pageMetadata.$parsed("link[rel='shortcut icon'],[rel='icon']"), link => {
        const href = $(link).attr("href");
        return {
            url: typeof href === "undefined" ? "" : pageMetadata.absUrlFromCurrentPage(href) || "",
            sizes: $(link).attr("sizes")
        };
    })
}

function analyzeImages(pageMetadata) {
    const images = pageMetadata.$parsed("img");
    return _.map(images, function (image) {
        const src = $(image).attr("src") || "",
            url = _.startsWith(src, "data:") ? "Data URI image" : pageMetadata.absUrlFromCurrentPage(src),
            alt = $(image).attr("alt"),
            title = Helper.processHTML($(image).attr("title")) || undefined,
            width = typeof $(image).attr("width") === "undefined" ? undefined : parseInt($(image).attr("width")),
            height = typeof $(image).attr("height") === "undefined" ? undefined : parseInt($(image).attr("height"));
        return {
            url: url,
            alt: alt === void 0 ? void 0 : Helper.processHTML(alt),
            title: title,
            width: width,
            height: height
        };
    })
}

function analyzeFrames(pageMetadata) {
    const frameUrls = _.map(pageMetadata.$parsed("iframe, frame"), frame => pageMetadata.absUrlFromCurrentPageOrUndefined($(frame).attr("src")) || "");
    return Helper.mapUrlsToObjects(frameUrls)
}

function analyzeJavascript(pageMetadata) {
    return _.map(pageMetadata.$parsed("script[src]"), script => {
        const $script = $(script),
            defer = !!$script.attr("defer"),
            async = !!$script.attr("async"),
            src = pageMetadata.absUrlFromCurrentPageOrUndefined($script.attr("src")) || "",
            atPageEnd = !_.isEmpty($script.parent("body")) && _.isEmpty($script.nextUntil("*:not(script)").last().next());
        return {
            url: src,
            defer: defer,
            async: async,
            atPageEnd: atPageEnd
        };
    })
}
// function extractCanonicalInfo(responseDetails, $parsed) {
//     const canonicalLinks = parseCanonicalLinks(responseDetails, $parsed);
//     const canonicalUrl = canonicalLinks.canonicalUrl;
//     const canonicalError = canonicalLinks.canonicalError;
//     const isSelfCanonical = canonicalUrl && responseDetails.url === canonicalUrl;
//     const indexable = canonicalLinks.metaRobotsIndex && !isSelfCanonical;
//     return {
//         isSelfCanonical: isSelfCanonical,
//         canonicalUrl: canonicalUrl,
//         canonicalError: canonicalError,
//         indexable: indexable
//     };
// }
function getCanonicalLinks(parsedLinks, attr, val) {
    const canonicalLinks = [];
    for (const link of parsedLinks) {
        if (link[attr] === val) {
            canonicalLinks.push(link.url);
        }
    }
    return canonicalLinks.length ? canonicalLinks : null;
}

// function parseCanonicalLinks(responseDetails, $parsed) {
//     function createCanonicalUrlObject(uri, type) {
//         return {
//             uri: Utils.normalizeURI(uri),
//             type: type
//         };
//     }

//     function createErrorObject(error) {
//         return {
//             canonicalUrl: undefined,
//             canonicalError: error
//         };
//     }

//     const linkHeader = responseDetails.getResponseHeader("link");
//     const canonicalLinks = linkHeader ? Link.parse(linkHeader).get("rel", "canonical") : [];
//     const headerCanonicalUrls = _.map(canonicalLinks, uri => createCanonicalUrlObject(uri, "header"));
//     const tagCanonicalLinks = $parsed("head link[rel=canonical]");
//     const tagCanonicalUrls = _.map(tagCanonicalLinks, e => createCanonicalUrlObject($(e).attr("href"), "tag"));
//     const allCanonicalUrls = [...headerCanonicalUrls, ...tagCanonicalUrls];
//     if (allCanonicalUrls.length === 0) return createErrorObject(i18n('Missing')"No canonical tag or header found");
//     if (headerCanonicalUrls.length > 1) return createErrorObject(i18n('Missing')"Multiple canonical headers found");
//     if (tagCanonicalUrls.length > 1) return createErrorObject(i18n('Missing')"Multiple canonical tags found");
//     if (tagCanonicalUrls.length > 0 && headerCanonicalUrls.length > 0) return createErrorObject(i18n('Missing')"Canonical headers and tags being used at the same time");
//     const canonicalUrlObject = _.first(allCanonicalUrls);

//     if (!canonicalUrlObject) return createErrorObject("Unknown error");
//     const uri = canonicalUrlObject.uri;
//     const uriString = String(uri);
//     if (uriString) {
//         if (uri.protocol()) {
//             return {
//                 canonicalUrl: uriString,
//                 canonicalError: ""
//             };
//         } else {
//             return createErrorObject(`Canonical ${canonicalUrlObject.type} URL is relative when it should be absolute`);
//         }
//     } else {
//         return createErrorObject(`Canonical ${canonicalUrlObject.type} with blank URL`);
//     }
// }

// function extractSocialMetaTags($parsed, prefix) {
//     const tags = {};
//     $parsed(`meta[property^="${prefix}"]`).each((index, element) => {
//         const property = $parsed(element).attr("property") || "";
//         const content = $parsed(element).attr("content") || "";
//         tags[property] = content;
//     });
//     return tags;
// }

// function extractWordsFromBody(element) {
//     const clonedBody = $(element).find("body").clone();
//     clonedBody.find("script").remove();
//     clonedBody.find("style").remove();
//     clonedBody.find("h1").remove();
//     $("*", clonedBody).append(".");
//     let textContent = $(clonedBody).text().toLowerCase();
//     textContent = textContent.replace(/  /g, " ").replace(/["\.]|'s/g, " ");
//     return textContent.split(/[^a-z0-9]+/);
// }

function getUniqueHashValueAndTextFrequencies(text) {
    var lowercaseWords = _.map(text, word => _.toLower(word));
    const shingles = function (words) {
        var combinedWords = _.map(words, (word, index) => {
            return word + " " + words[index + 1] + " " + words[index + 2];
        });
        combinedWords.pop();
        return combinedWords;
    }(lowercaseWords = _.reject(lowercaseWords, (word) => {
        return word.length === 1;
    }));

    const wordFreqLimit = 30;
    const shingleFreqLimit = 30;

    const topWordFrequencies = _.take(countWordFrequencies(lowercaseWords), wordFreqLimit);
    const topShingleFrequencies = _.take(countWordFrequencies(shingles), shingleFreqLimit);

    return {
        uniqueHashValue: Helper.hashString(shingles.join(" ")),
        wordFrequencies: topWordFrequencies,
        textFrequencies: topShingleFrequencies
    };
}

function countWordFrequencies(words) {
    var pairs = _.chain(words).countBy().toPairs().value();
    return _.chain(pairs).sortBy((pair) => {
        return -pair[1];
    }).value();
}
// function calculateWordCount(parsedHtml) {
//     const wordArray = extractWordsFromBody(parsedHtml);
//     const uniqueHashValue = getUniqueHashValueAndTextFrequencies(wordArray);
//     return { wordCount: wordArray.length, uniqueHashValue: uniqueHashValue };
// }

function calculateUniqueHashValue(wordArray) {
    const sortedWords = wordArray.slice().sort();
    return sortedWords.join('-');
}

// function analyzeFormSecurity($parsed) {
//     const forms = $("form:has(input[type=password])");
//     let passwordInputsCount = forms.length;
//     let passwordInFormNotByPost = false;
//     let unsecuredFormSubmission = false;

//     forms.each((index, form) => {
//         const method = ($parsed(form).attr("method") || "get").trim().toLowerCase();
//         if (method !== "post") {
//             passwordInFormNotByPost = true;
//         }
//         const action = $parsed(form).attr("action") || "";
//         if (!action.startsWith("https://")) {
//             unsecuredFormSubmission = true;
//         }
//     });

//     return {
//         passwordInputsCount: passwordInputsCount,
//         passwordInFormNotByPost: passwordInFormNotByPost,
//         unsecuredFormSubmission: unsecuredFormSubmission
//     };
// }

// function extractHstsInfo(responseDetails) {
//     const header = responseDetails.getResponseHeader("strict-transport-security");
//     const hsts = Helper.parseHstsHeader(header);
//     const maxAgeHSTS = parseInt(hsts["max-age"]) || 0;
//     const preloadHSTS = hsts["preload"] === "";
//     const includeSubdomainsHSTS = hsts["includeSubDomains"] === "";
//     return {
//         maxAgeHSTS: maxAgeHSTS,
//         preloadHSTS: preloadHSTS,
//         includeSubdomainsHSTS: includeSubdomainsHSTS
//     };
// }

// function createRedirectPage(pageMetadata, redirectUrl) {
//     const redirectPage = { ...pageMetadata, destinationTo: redirectUrl, status: 301 };
//     redirectPage.metaRefreshUrl = redirectUrl;
//     return redirectPage;
// }

// function getBaseUrl(currentUrl, baseHref) {
//     return baseHref ? resolveRelativeUrl(currentUrl, baseHref) : currentUrl;
// }

// function resolveRelativeUrl(currentUrl, relativeUrl) {
//     if (/^https?:\/\//i.test(relativeUrl)) {
//         return relativeUrl;
//     }
//     const currentUrlParts = currentUrl.split('/');
//     const baseUrlParts = currentUrlParts.slice(0, -1);
//     const relativeUrlParts = relativeUrl.split('/');
//     for (const part of relativeUrlParts) {
//         if (part === '..') {
//             baseUrlParts.pop();
//         }
//         else if (part !== '.') {
//             baseUrlParts.push(part);
//         }
//     }
//     const resolvedUrl = baseUrlParts.join('/');

//     return resolvedUrl;
// }

// function getAbsoluteUrl(baseUrl, relativeUrl) {
//     return relativeUrl ? resolveRelativeUrl(baseUrl, relativeUrl).toString() : "";
// }
function createjQueryInstance(context) {
    return ($(context), selector => $(selector, context));
}
