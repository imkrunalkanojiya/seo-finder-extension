const SEO_CHECKER_CONFIG = {
    showAuditReport: true
}
const SEO_CHECKER_RULES = {
    "SEO": {
        "set-page-titles": {
            "subcategory": "Page titles",
            "name": "Are page titles set?",
            "priority": ReportPriority.high
        },
        "use-optimal-length-titles": {
            "subcategory": "Page titles",
            "name": "Are title lengths optimal?",
            "priority": ReportPriority.medium
        },
        "use-unique-titles": {
            "subcategory": "Page titles",
            "name": "Are page titles unique?",
            "priority": ReportPriority.low
        },
        "set-h1-headings": {
            "subcategory": "Page headings",
            "name": "Does page have H1 headings?",
            "priority": ReportPriority.high
        },
        "use-one-h1-heading-per-page": {
            "subcategory": "Page headings",
            "name": "Does the page have more than one H1 tag?",
            "priority": ReportPriority.medium
        },
        "use-optimal-length-h1-headings": {
            "subcategory": "Page headings",
            "name": "Are H1 lengths optimal?",
            "priority": ReportPriority.medium
        },
        "use-unique-h1-headings": {
            "subcategory": "Page headings",
            "name": "Are H1 tags unique?",
            "priority": ReportPriority.low
        },
        "set-page-descriptions": {
            "subcategory": "Page descriptions",
            "name": "Are page descriptions set?",
            "priority": ReportPriority.low
        },
        "use-optimal-length-descriptions": {
            "subcategory": "Page descriptions",
            "name": "Are description lengths optimal?",
            "priority": ReportPriority.low
        },
        "use-unique-descriptions": {
            "subcategory": "Page descriptions",
            "name": "Are descriptions unique?",
            "priority": ReportPriority.low
        },
        "use-short-urls": {
            "subcategory": "URL Analysis",
            "name": "Are URLs short?",
            "priority": ReportPriority.medium
        },
        "avoid-url-extensions": {
            "subcategory": "URL Analysis",
            "name": "Do URLs have extensions?",
            "priority": ReportPriority.low
        },
        "avoid-url-parameters": {
            "subcategory": "URL Analysis",
            "name": "Do URL have parameters?",
            "priority": ReportPriority.low
        },
        "avoid-symbols-in-urls": {
            "subcategory": "URL Analysis",
            "name": "Do URLs have symbols?",
            "priority": ReportPriority.medium
        },
        "use-lowercase-urls": {
            "subcategory": "URL Analysis",
            "name": "Are URLs lowercase?",
            "priority": ReportPriority.low
        },
        "avoid-underscores-in-urls": {
            "subcategory": "URL Analysis",
            "name": "Are there underscores in URLs?",
            "priority": ReportPriority.low
        },
        "avoid-deeply-nested-urls": {
            "subcategory": "URL Analysis",
            "name": "Are URLs nested?",
            "priority": ReportPriority.medium
        },
        "avoid-thin-content-pages": {
            "subcategory": "Page content",
            "name": "Are there thin content pages?",
            "priority": ReportPriority.high
        },
        "set-image-alt-text": {
            "subcategory": "Page content",
            "name": "Are image ALT texts set?",
            "priority": ReportPriority.high
        },
        "set-mobile-scaling": {
            "subcategory": "Page content",
            "name": "Is mobile scaling set?",
            "priority": ReportPriority.high
        },
        "avoid-plugins": {
            "subcategory": "Page content",
            "name": "Using browser plugins?",
            "priority": ReportPriority.medium
        },
        "set-canonical-urls": {
            "subcategory": "Duplicate Content",
            "name": "Are canonical URLs set?",
            "priority": ReportPriority.medium
        },
        "avoid-duplicate-pages": {
            "subcategory": "Duplicate Content",
            "name": "Is there duplicate page content?",
            "priority": ReportPriority.high
        },
        "are-image-compressed": {
            "subcategory": "IMAGE ANALYSIS",
            "name": "Are images compressed?",
            "priority": ReportPriority.high
        },
        "are-resolutions-too-high": {
            "subcategory": "IMAGE ANALYSIS",
            "name": "Are resolutions too high?",
            "priority": ReportPriority.medium
        },
        "are-file-sizes-large": {
            "subcategory": "IMAGE ANALYSIS",
            "name": "Are file sizes too large?",
            "priority": ReportPriority.medium
        },
        "return-404-for-broken-links": {
            "subcategory": "links",
            "name": "Do broken URLs return 404 status code?",
            "priority": ReportPriority.high
        },
        "avoid-broken-internal-links": {
            "subcategory": "links",
            "name": "Are internal links broken?",
            "priority": ReportPriority.medium
        },
        "avoid-broken-external-links": {
            "subcategory": "links",
            "name": "Are external links broken?",
            "priority": ReportPriority.low
        },
        "avoid-broken-page-resources": {
            "subcategory": "links",
            "name": "Are page resources broken?",
            "priority": ReportPriority.high
        },
        "add-robotstxt-files": {
            "subcategory": "Robots.txt",
            "name": "Does robots.txt exist?",
            "priority": ReportPriority.medium
        },
        "specify-sitemap-locations": {
            "subcategory": "Robots.txt",
            "name": "Are sitemap locations set?",
            "priority": ReportPriority.medium
        },
        "avoid-meta-redirects": {
            "subcategory": "Redirects",
            "name": "Any meta redirects?",
            "priority": ReportPriority.high
        },
        "avoid-temporary-redirects": {
            "subcategory": "Redirects",
            "name": "Any temporary redirects?",
            "priority": ReportPriority.medium
        },
        "use-valid-html": {
            "subcategory": "Code validation",
            "name": "Is HTML valid?",
            "priority": ReportPriority.medium
        },
        "use-valid-css": {
            "subcategory": "Code validation",
            "name": "Is CSS valid?",
            "priority": ReportPriority.medium
        },
        "use-valid-javascript": {
            "subcategory": "Code validation",
            "name": "Is JavaScript valid?",
            "priority": ReportPriority.medium
        }
    },
    "speed": {
        "compress-sent-data": {
            "subcategory": "Page size analysis",
            "name": "Is compression setup?",
            "priority": ReportPriority.high
        },
        "avoid-recompressing-data": {
            "subcategory": "Page size analysis",
            "name": "Is data recompressed",
            "priority": ReportPriority.medium
        },
        "minify-files": {
            "subcategory": "Page size analysis",
            "name": "Is minification setup?",
            "priority": ReportPriority.high
        },
        "avoid-inline-sourcemaps": {
            "subcategory": "Page size analysis",
            "name": "Avoid inline sourcemaps",
            "priority": ReportPriority.high
        },
        "avoid-inline-javascript": {
            "subcategory": "JavaScript",
            "name": "Is inline JavaScript used?",
            "priority": ReportPriority.medium
        },
        "defer-javascript-loading": {
            "subcategory": "JavaScript",
            "name": "Is render-blocking JavaScript used?",
            "priority": ReportPriority.high
        },
        "avoid-inline-css": {
            "subcategory": "CSS",
            "name": "Is inline CSS used?",
            "priority": ReportPriority.medium
        },
        "avoid-css-import": {
            "subcategory": "CSS",
            "name": "Is CSS @import used?",
            "priority": ReportPriority.high
        },
        "avoid-internal-link-redirects": {
            "subcategory": "Redirects",
            "name": "Are internal link redirects used?",
            "priority": ReportPriority.medium
        },
        "avoid-resource-redirects": {
            "subcategory": "Redirects",
            "name": "Are resource redirects used?",
            "priority": ReportPriority.low
        },
        "avoid-redirect-chains": {
            "subcategory": "Redirects",
            "name": "Are redirect chains used?",
            "priority": ReportPriority.high
        },
        "enable-caching": {
            "subcategory": "Caching",
            "name": "Is caching used?",
            "priority": ReportPriority.high
        },
        "use-long-caching-times": {
            "subcategory": "Caching",
            "name": "Are long caching times used?",
            "priority": ReportPriority.high
        },
        "avoid-duplicate-resources": {
            "subcategory": "Caching",
            "name": "Are there duplicate resources?",
            "priority": ReportPriority.medium
        }
    },
    "security": {
        "use-https": {
            "subcategory": "HTTPS",
            "name": "Is HTTPS used?",
            "priority": ReportPriority.high
        },
        "avoid-mixed-content-errors": {
            "subcategory": "HTTPS",
            "name": "Is there mixed content?",
            "priority": ReportPriority.high
        },
        "secure-passwords-fields": {
            "subcategory": "HTTPS",
            "name": "Are forms with passwords secure?",
            "priority": ReportPriority.high
        },
        "enable-hsts": {
            "subcategory": "HSTS",
            "name": "Is HSTS used?",
            "priority": ReportPriority.medium
        },
        "allow-hsts-preload": {
            "subcategory": "HSTS",
            "name": "Is HSTS preload used?",
            "priority": ReportPriority.low
        },
        "specify-mime-types": {
            "subcategory": "Content sniffing",
            "name": "Are MIME types set?",
            "priority": ReportPriority.medium
        },
        "disable-content-sniffing": {
            "subcategory": "Content sniffing",
            "name": "Is content sniffing protection enabled?",
            "priority": ReportPriority.medium
        },
        "restrict-iframe-usage": {
            "subcategory": "Miscellaneous",
            "name": "Is clickjack protection enabled?",
            "priority": ReportPriority.medium
        },
        "enable-xss-protection": {
            "subcategory": "Miscellaneous",
            "name": "Is XSS protection enabled?",
            "priority": ReportPriority.medium
        },
        "hide-server-version-data": {
            "subcategory": "Miscellaneous",
            "name": "Is server information hidden?",
            "priority": ReportPriority.low
        }
    },
    "explore": {
        "crawled-urls": {
            "subcategory": "Overview",
            "name": "Crawled URLs",
            "priority": ReportPriority.info
        },
        "internal-urls": {
            "subcategory": "Overview",
            "name": "Internal URLs",
            "priority": ReportPriority.info
        },
        "external-urls": {
            "subcategory": "Overview",
            "name": "External URLs",
            "priority": ReportPriority.info
        },
        "pages": {
            "subcategory": "URL types",
            "name": "Pages",
            "priority": ReportPriority.info
        },
        "css": {
            "subcategory": "URL types",
            "name": "CSS",
            "priority": ReportPriority.info
        },
        "javascript": {
            "subcategory": "URL types",
            "name": "JavaScript",
            "priority": ReportPriority.info
        },
        "images": {
            "subcategory": "URL types",
            "name": "Images",
            "priority": ReportPriority.info
        },
        "robotstxt": {
            "subcategory": "URL types",
            "name": "Robots.txt",
            "priority": ReportPriority.info
        },
        "sitemap": {
            "subcategory": "URL types",
            "name": "Sitemap",
            "priority": ReportPriority.info
        },
        "type-other": {
            "subcategory": "URL types",
            "name": "Other",
            "priority": ReportPriority.info
        },
        "status-2xx": {
            "subcategory": "Status codes",
            "name": "2xx status code - Success",
            "priority": ReportPriority.info
        },
        "status-3xx": {
            "subcategory": "Status codes",
            "name": "3xx status code - Redirection",
            "priority": ReportPriority.info
        },
        "status-4xx": {
            "subcategory": "Status codes",
            "name": "4xx status code - Client Error",
            "priority": ReportPriority.info
        },
        "status-5xx": {
            "subcategory": "Status codes",
            "name": "5xx status code - Server Error",
            "priority": ReportPriority.info
        },
        "status-connection-error": {
            "subcategory": "Status codes",
            "name": "Connection Errors",
            "priority": ReportPriority.info
        },
        "status-error": {
            "subcategory": "Status codes",
            "name": "Total Broken URLs",
            "priority": ReportPriority.info
        },
        "pages-without-canonical": {
            "subcategory": "Canonicalization",
            "name": "Pages without canonical tag",
            "priority": ReportPriority.info
        },
        "pages-with-canonical": {
            "subcategory": "Canonicalization",
            "name": "Pages with canonical tag",
            "priority": ReportPriority.info
        },
        "canonicalised-pages": {
            "subcategory": "Canonicalization",
            "name": "Canonicalised pages",
            "priority": ReportPriority.info
        },
        "self-canonical-pages": {
            "subcategory": "Canonicalization",
            "name": "Self-canonical pages",
            "priority": ReportPriority.info
        },
        "indexable-pages": {
            "subcategory": "Indexing",
            "name": "Indexable Pages",
            "priority": ReportPriority.info
        },
        "non-indexable-pages": {
            "subcategory": "Indexing",
            "name": "Non-indexable Pages",
            "priority": ReportPriority.info
        },
        "noindex-pages": {
            "subcategory": "Indexing",
            "name": "Noindex pages",
            "priority": ReportPriority.info
        },
        "no-follow": {
            "subcategory": "Indexing",
            "name": "Nofollow pages",
            "priority": ReportPriority.info
        },
        "redirects": {
            "subcategory": "Redirects",
            "name": "Redirects",
            "priority": ReportPriority.info
        },
        "permanent-redirects": {
            "subcategory": "Redirects",
            "name": "Permanent Redirects",
            "priority": ReportPriority.info
        },
        "temporary-redirects": {
            "subcategory": "Redirects",
            "name": "Temporary Redirects",
            "priority": ReportPriority.info
        },
        "other-redirects": {
            "subcategory": "Redirects",
            "name": "Other Redirects",
            "priority": ReportPriority.info
        },
        "outlinks": {
            "subcategory": "hidden",
            "name": "outlinks",
            "priority": ReportPriority.info
        },
        "redirect-path": {
            "subcategory": "hidden",
            "name": "Redirect path",
            "priority": ReportPriority.info
        },
        "inlinks": {
            "subcategory": "hidden",
            "name": "Inlinks",
            "priority": ReportPriority.info
        },
        "response-headers": {
            "subcategory": "hidden",
            "name": "Response headers",
            "priority": ReportPriority.info
        }
    }
}