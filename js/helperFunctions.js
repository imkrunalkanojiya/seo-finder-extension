const Helper = (function () {
    function isHttps(res) {
        return res.protocol === "https";
    }
    function isJs(res) {
        return res.type === Constants.fileType.js;
    }
    function isPdf(res) {
        return res.type === Constants.fileType.pdf;
    }
    function isCss(res) {
        return res.type === Constants.fileType.css;
    }
    function isSitemap(res) {
        return isRobotsTxt(res) || res.type === Constants.fileType.sitemap;
    }
    function isRobotsTxt(res) {
        return isInternal(res) && res.urlFilename === "robots.txt";
    }
    // function isRobotsAndSitemap(res) {
    //     return isInternal(res) && res.urlFilename === "robots.txt";
    // }
    function isInternalHtml(res) {
        return isInternal(res) && isHtml(res);
    }
    function isInternal(res) {
        return res.internal;
    }
    function isInteralHtmlNotNotFound(result) {
        return isInternal(result) && isHtml(result) && result.tag !== Constants.testType.NotFoundTest
    }
    function isExternal(res) {
        return !isInternal(res);
    }
    function isHtml(res) {
        return res.type === Constants.fileType.html;
    }
    function isOther(res) {
        return isInternal(res) && !isHtml(res) && !isCss(res) && !isJs(res) && !isSitemap(res) && !isImage(res) && !isNonSuccessRedirect(res) && !isNotFound(res) && !isSuccess(res);
    }
    function isFailure(res) {
        return isNotFound(res) && !isNonSuccessRedirect(res) && !isSuccess(res);
    }
    function isNonSuccessRedirect(res) {
        return isRedirectWithoutSuccess(res) && !isPermanentRedirect(res) && !isTemporaryRedirect(res);
    }
    function isRedirectWithoutSuccess(res) {
        return isRedirect(res) && !isSuccess(res);
    }
    function isPermanentRedirect(res) {
        return res.status === 301 || res.status === 308;
    }
    function isTemporaryRedirect(res) {
        return res.status === 302 || res.status === 303 || res.status === 307;
    }
    function isNotFound(res) {
        return !isInternal(res) && res.tag !== Constants.testType.NotFoundTest;
    }
    function isHtmlAndInternal(res) {
        return isInternal(res) && isHtml(res) && res.tag !== Constants.testType.NotFoundTest;
    }
    function isNonResource(res) {
        return !(isHtmlAndInternal(res) || isCss(res) || isJs(res) || isImage(res) || isSitemap(res) || isRedirect(res) || isBrokenUrl(res))
    }
    function isHtmlAndInternalAndHttps(res) {
        return isHtmlAndInternal(res) && isHttps(res)
    }
    function isHtmlInternalAndNotIndexable(res) {
        return isHtmlAndInternal(res) && !res.indexable;
    }
    function isHtmlInternalAndIndexable(res) {
        return isHtmlAndInternal(res) && res.indexable;
    }
    function isBrokenUrl(res) {
        return !isSuccess(res) && res.tag !== Constants.testType.NotFoundTest
    }
    function isNonLinkInternalNonRedirectNotError(e) {
        return isNonLink(e) && isInternal(e) && !isRedirect(e) && !isBrokenUrl(e)
    }
    function isSuccess(e) {
        return e.success;
    }
    function isTrue(e) {
        return true
    }
    function isJsOrCss(e) {
        return isCss(e) || isJs(e);
    }
    function isJsOrCssOrImage(e) {
        return isCss(e) || isJs(e) || isImage(e);
    }
    function isLarge(e) {
        return isJsOrCss(e) && e.uncompressedSize > 1000;
    }
    function isNonHtml(e) {
        return !isHtml(e) && !isNonSuccessRedirect(e) && !isNotFound(e) && !isSuccess(e);
    }
    function isLink(e) {
        return e.type === Constants.fileType.link;
    }
    function isNonLink(e) {
        return e.type !== Constants.fileType.link;
    }
    function isImage(e) {
        return e.type === Constants.fileType.image;
    }
    function isRedirect(e) {
        return e.type === Constants.fileType.redirect;
    }
    function isExternalRedirect(e) {
        return isRedirect(e) && !e.isIntDestination && isInternal(e)
    }
    function isMetaRefresh(e) {
        return !!e.metaRefreshUrl;
    }
    function isLargeTextAsset(e) {
        return isSuccess(e) && isNonLink(e) && !isRedirect(e) && (
            "txt" === e.urlSuffix ||
            "svg" === e.urlSuffix ||
            isHtmlAndInternal(e) ||
            "js" === e.urlSuffix ||
            "css" === e.urlSuffix ||
            "xml" === e.urlSuffix ||
            "json" === e.urlSuffix
        ) && e.uncompressedSize > 1000;
    }
    function isImageOrPdf(e) {
        return isImage(e) && "svg" !== e.urlSuffix && "ico" !== e.urlSuffix || isPdf(e);
    }
    function isHtmlInternalAndNotRobotIndexed(e) {
        return isHtmlAndInternal(e) && !e.metaRobotsIndex;
    }
    function isHtmlInternalAndRobotIndexed(e) {
        return isHtmlAndInternal(e) && e.metaRobotsIndex;
    }
    function isHtmlInternalAndNotRobotFollowed(e) {
        return isHtmlAndInternal(e) && !e.robotsMetaFollow;
    }
    function isHtmlInternalAndHttps(e) {
        return isHtmlAndInternal(e) && isHttps(e);
    }
    function isSelfCanonical(e) {
        return isHtmlAndInternal(e) && e.isSelfCanonical;
    }
    function isSelfCanonicalAndHasNoCanonical(e) {
        return isHtmlAndInternal(e) && !!e.canonicalUrl && !e.isSelfCanonical
    }
    function hasCanonical(e) {
        return isHtmlAndInternal(e) && !!e.canonicalUrl;
    }
    function hasNoCanonical(e) {
        return isHtmlAndInternal(e) && !e.canonicalUrl;
    }
    function isSuccessfulOrRedirect(e) {
        return isSuccess(e) || isNonSuccessRedirect(e);
    }
    function isServerError(e) {
        return e.status >= 500 && e.status < 600;
    }
    function isClientError(e) {
        return e.status >= 400 && e.status < 500 && e.tag !== Constants.testType.NotFoundTest;
    }
    function isServerErrorOrRedirect(e) {
        return isServerError(e) || isNonSuccessRedirect(e);
    }
    function isServerErrorOrClientError(e) {
        return isServerError(e) || isClientError(e);
    }
    function isError(e) {
        return !isSuccess(e) && !isNonSuccessRedirect(e);
    }
    function isHtmlResponse(e) {
        return isInternalHtml(e) && isSuccessfulOrRedirect(e);
    }
    function isNonHtmlResponse(e) {
        return isNonHtml(e) && isSuccessfulOrRedirect(e);
    }
    function isPasswordInput(e) {
        return e.passwordInputsCount > 0;
    }
    function isNotFoundTest(e) {
        return e.tag === Constants.testType.NotFoundTest;
    }
    function isStatusInRange(res, rangeStart) {
        const statusCode = res.status;
        return statusCode >= rangeStart && statusCode < rangeStart + 100;
    }
    function isStatus200(res) {
        return res.status === 200
    }
    function isStatus2xx(res) {
        return isStatusInRange(res, 200);
    }
    function isStatus3xx(res) {
        return isStatusInRange(res, 300);
    }
    function isStatus4xx(res) {
        return isStatusInRange(res, 400) && res.tag !== Constants.testType.NotFoundTest;
    }
    function isStatus5xx(res) {
        return isStatusInRange(res, 500);
    }
    function isStatusNegativeOrZero(status) {
        return status <= 0;
    }
    function isNonPermanentRedirect(e) {
        return isRedirect(e) && !isPermanentRedirect(e) && !isTemporaryRedirect(e);
    }
    function generateCacheControlHeader(cacheOptions, separator) {
        return _.reduce(cacheOptions, (header, option) => option ? header ? `${header}${separator} ${option}` : "" + option : header, "");
    }
    function mapToArrays(elements) {
        return _.map(elements, element => [element]);
    }
    function extractRelatedLinks(data, index, relatedData) {
        let key = data[index];
        let url = data.url;
        let relatedUrls = relatedData[key];

        const extractedUrls = _.take(relatedUrls, 11);
        const filteredUrls = _.without(extractedUrls, url);

        const extracted = _.take(filteredUrls, 10);
        const isEmpty = _.isEmpty(extracted);

        return [isEmpty, key, mapToArrays(extracted)];
    }
    function isNotEmpty(e) {
        return !_.isEmpty(e)
    }
    function countMatchingElements(collection, predicate) {
        if (!predicate)
            return _.size(collection);

        var matchesPredicate = _.iteratee(predicate);

        return _.reduce(collection, (function (count, element) {
            return matchesPredicate(element) ? count + 1 : count;
        }), 0);
    }
    function formatPercentage(value) {
        return Math.floor(100 * value);
    }
    function groupByProperty(collection, property, transform = _.identity) {
        let grouped = {};
        _.each(collection, item => {
            const value = item[property];
            grouped[value] = grouped[value] || [];
            grouped[value].push(transform(item));
        });
        return grouped;
    }
    function toKebabCase(str) {
        return str.toLocaleLowerCase().replace(/[^\w\s-]/gi, "").split(" ").join("-");
    }
    function mapUrlsToObjects(urls) {
        return _.map(urls, url => ({
            url: url
        }));
    }
    function parseCacheControlHeader(header) {
        if (typeof header !== "string") {
            return null;
        }

        const parsedValues = {};
        const remainingHeader = header.replace(/(?:^|(?:\s*,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g, (match, key, value, quotedValue) => {
            const parsedValue = value || quotedValue;
            parsedValues[key] = !parsedValue || parsedValue.toLowerCase();
            return "";
        });

        if (parsedValues["max-age"]) {
            try {
                const maxAge = parseInt(parsedValues["max-age"], 10);
                if (!isNaN(maxAge)) {
                    parsedValues["max-age"] = maxAge;
                } else {
                    return null;
                }
            } catch (error) { }
        }

        return remainingHeader ? null : parsedValues;
    }
    function extractCacheHeaders(response) {
        const cacheControlHeader = response.getResponseHeader("cache-control");
        const parsedCacheControl = parseCacheControlHeader(cacheControlHeader) || {};

        const maxAge = parsedCacheControl["max-age"] || 0;
        const expiresHeader = response.getResponseHeader("expires");
        const currentTime = Date.now();
        const cacheExpirationTime = expiresHeader ? new Date(expiresHeader).getTime() - currentTime : 0;
        const lastModifiedHeader = response.getResponseHeader("last-modified");
        const entityTagHeader = response.getResponseHeader("entityTag");

        return {
            lastModified: lastModifiedHeader ? new Date(lastModifiedHeader).getTime() : 0,
            entityTag: entityTagHeader,
            cacheExpirationTime: cacheExpirationTime / 1000,
            maxAgeCache: maxAge,
            cachePublic: !parsedCacheControl.private,
            noStoreCache: parsedCacheControl["no-store"] === "true",
            noCacheCache: parsedCacheControl["no-cache"] === "true"
        };
    }
    function parseSecurityHeaders(response) {
        return {
            sniffingDisabled: response.getResponseHeader("x-content-type-options").trim() === "nosniff"
        };
    }
    function parseHeaderValues(headerValueString) {
        var parsedValues = {};

        if (headerValueString) {
            var valuePairs = _.compact(headerValueString.split(";"));
            var keyValuePairs = _.compact(_.map(valuePairs, function (pairString) {
                return pairString.match(/\s*([^\s^=]*)=?([^\s]*)?/);
            }));

            _.each(keyValuePairs, function (pair) {
                if (pair) {
                    parsedValues[pair[1]] = pair[2];
                }
            });
        }

        return parsedValues;
    }
    function extractAltTextFromElement(element) {
        const altText = function extractAltText(element) {
            return processHTML($(element).find("img").map(function (index, imgElement) {
                return imgElement.alt;
            }).get().join(" "));
        }(element);

        return processHTML($(element).text() || "" || altText);
    }
    function parseHtml(html) {
        return (new DOMParser).parseFromString(html, "text/html")
    }
    function extractTextFromHTML(htmlString) {
        try {
            return (new DOMParser).parseFromString(htmlString, "text/html").documentElement.textContent;
        } catch (error) {
            console.error("decode error", htmlString, error);
            return htmlString;
        }
    }
    function compressWhiteSpaceAndTrim(text) {
        return (text || "").replace(/[\n\r]/g, " ").replace(/  +/g, " ").trim();
    }
    function processHTML(html) {
        return extractTextFromHTML(compressWhiteSpaceAndTrim(html));
    }
    function extractUrls(items) {
        return _.map(items, item => item.url);
    }
    function extractAssetUrls(data) {
        return _.flatten([
            extractUrls(data.js),
            extractUrls(data.css),
            extractUrls(data.images),
            extractUrls(data.favicons),
            extractUrls(data.frames)
        ]);
    }
    function extractAllUrls(data) {
        const temp = extractAndFilterUrls(data);
        return _.flatten([extractAssetUrls(data), temp])
    }
    function extractAndFilterUrls(data) {
        const urls = _.flatten([
            extractUrls(data.links),
            data.sitemaps,
            data.destinationTo,
            data.canonicalUrl
        ]);
        return _.filter(urls, url => !_.isEmpty(url));
    }
    function parseHstsHeader(header) {
        const parts = header.split(';');
        const result = {};
        parts.forEach(part => {
            const keyValue = part.split('=');
            const key = keyValue[0].trim();
            const value = keyValue[1] ? keyValue[1].trim() : true;
            result[key] = value;
        });
        return result;
    }
    function calculateContentHash(str) {
        let hash = hashString(str);
        return btoa(hash.toString()).replace(/=/g, "");
    }
    function hashString(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
        }
        return hash;
    }
    function extractEntityUrls(entity) {
        return _.compact(_.flatten([
            extractUrls(entity.links),
            entity.authorUrl,
            entity.canonicalUrl ? entity.canonicalUrl : "",
            entity.metaRefreshUrl,
            entity.publisherUrl,
            entity.nextUrl,
            entity.prevUrl,
            extractUrls(entity.frames)
        ]));
    }
    function formatErrorMessage(line, column, message) {
        return `Line ${line}, ${column ? `Column ${column}, ` : ""}${message}`;
    }
    function formatNumber(number, decimalPlaces = 0) {
        const fractionDigits = decimalPlaces || 0;
        return Number(number).toLocaleString("en-US", {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
    }


    // Check image compression using canvas
    // const analyseImage = async function(blob, compressionQuality = 0.7) {
    //   try {
    //       const originalSize = blob.size;

    //       const img = new Image();
    //       img.src = URL.createObjectURL(blob);

    //       return new Promise((resolve) => {
    //           img.onload = () => {
    //               const canvas = document.createElement('canvas');
    //               const ctx = canvas.getContext('2d');

    //               canvas.width = img.width;
    //               canvas.height = img.height;

    //               ctx.drawImage(img, 0, 0);

    //               canvas.toBlob((compressedBlob) => {
    //                   const compressedSize = compressedBlob.size;

    //                   resolve(compressedSize < originalSize);
    //               }, 'image/jpeg', compressionQuality);
    //           };

    //           img.onerror = () => {
    //               console.error('Failed to load the image.');
    //               resolve(false);
    //           };
    //       });
    //   } catch (error) {
    //       console.error('Error fetching image:', error);
    //       return false;
    //   }
    // }

    // Check image compression using dimension
    const analyseImage = async function (blob, url) {
        try {
            const fileSizeInBytes = blob.size;
            const fileSizeInKB = Math.round(fileSizeInBytes / 1024);

            const img = new Image();
            img.src = URL.createObjectURL(blob);

            return new Promise((resolve) => {
                img.onload = () => {
                    const width = img.naturalWidth;
                    const height = img.naturalHeight;

                    const mimeType = blob.type;
                    let expectedUncompressedSize = 0;
        
                    switch (mimeType) {
                        case 'image/jpeg':
                            expectedUncompressedSize = width * height * 3;
                            break;
                        case 'image/png':
                            expectedUncompressedSize = width * height * 4;
                            break;
                        case 'image/webp':
                            expectedUncompressedSize = width * height * 3;
                            break;
                        default:
                            expectedUncompressedSize = width * height * 3;
                            break;
                    }
        
                    const compressionRatio = fileSizeInBytes / expectedUncompressedSize;
                    let compressionThreshold;
                    if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
                        compressionThreshold = 0.25;
                    } else if (mimeType === 'image/png') {
                        compressionThreshold = 0.7;
                    } else {
                        compressionThreshold = 0.6;
                    }
                    const likelyCompressed = compressionRatio < compressionThreshold;
                    // const lowCompression = compressionRatio >= 0.6 && compressionRatio < 1;
                    // const isUncompressed = compressionRatio >= 1
                    // const isCompressed = fileSizeInKB <= Constants.compression.maxFileSizeInKB && (width >= Constants.compression.minDimensions || height >= Constants.compression.minDimensions);

                    const resolutionTooHigh = width > Constants.highResolution.maxWidth || height > Constants.highResolution.maxHeight;

                    const fileSizeTooLarge = fileSizeInKB > Constants.largeFile.maxFileSizeInKB;
                    // SC_LOG(2, "analyseImage url", url)
                    // SC_LOG(2, "analyseImage likelyCompressed", likelyCompressed)
                    // if(isUncompressed){
                    //     SC_LOG(2, "analyseImage isUncompressed", isUncompressed);
                    // }
                    resolve({
                        isCompressed: likelyCompressed,
                        resolutionTooHigh,
                        fileSizeTooLarge,
                        resolutions: `height: ${height} px, width: ${width} px`,
                        size: fileSizeInKB + ' kb'
                    });
                };

                img.onerror = () => {
                    console.error('Failed to load the image.');
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error fetching image:', error);
            return false;
        }
    }

    return {
        isHttps,
        isJs,
        isPdf,
        isCss,
        isSitemap,
        isRobotsTxt,
        isInternal,
        isInteralHtmlNotNotFound,
        isExternal,
        isHtml,
        isOther,
        isFailure,
        isHtmlAndInternal,
        isNonResource,
        isHtmlAndInternalAndHttps,
        isHtmlInternalAndNotIndexable,
        isHtmlInternalAndIndexable,
        isNonLinkInternalNonRedirectNotError,
        isTrue,
        isJsOrCss,
        isJsOrCssOrImage,
        isLarge,
        isNonLink,
        isImage,
        isExternalRedirect,
        isMetaRefresh,
        isImageOrPdf,
        isHtmlInternalAndNotRobotIndexed,
        isHtmlInternalAndRobotIndexed,
        isHtmlInternalAndNotRobotFollowed,
        isSelfCanonical,
        isSelfCanonicalAndHasNoCanonical,
        hasCanonical,
        hasNoCanonical,
        isLargeTextAsset,
        isPasswordInput,
        isNotFoundTest,
        isStatus2xx,
        isStatus3xx,
        isStatus4xx,
        isStatus5xx,
        isStatusNegativeOrZero,
        isTemporaryRedirect,
        isNonPermanentRedirect,
        isInternal,
        isExternal,
        isHtml,
        isBrokenUrl,
        isRedirect,
        isStatus200,
        isPermanentRedirect,
        generateCacheControlHeader,
        mapToArrays,
        extractRelatedLinks,
        isNotEmpty,
        countMatchingElements,
        formatPercentage,
        groupByProperty,
        toKebabCase,
        mapUrlsToObjects,
        extractCacheHeaders,
        parseSecurityHeaders,
        parseHeaderValues,
        extractAltTextFromElement,
        parseHtml,
        processHTML,
        extractUrls,
        extractAssetUrls,
        extractAllUrls,
        parseHstsHeader,
        calculateContentHash,
        hashString,
        extractEntityUrls,
        formatErrorMessage,
        formatNumber,
        analyseImage
    }

})()