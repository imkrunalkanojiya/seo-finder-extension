class RobotsParser {
    constructor(url, content) {
        this._url = new URL(url);
        this._url.port = this._url.port || 80;
        this._url.hostname = this._url.hostname.toString();
        this._rules = {};
        this._sitemapInRobotFile = false;
        this._sitemaps = [];
        this._preferredHost = null;

        this.parseContent(content || "");
    }
    static async create(url, content) {
        const parser = new RobotsParser(url, content);
        await parser.checkForSitemaps();
        return parser;
    }
    parseContent(content) {
        const lines = content.split(/\r\n|\r|\n/).map(RobotsParser.splitOnColon).map(RobotsParser.normalizeInput);
        let currentUserAgents = [];
        let isUserAgentSection = true;
        for (let line of lines) {
            if (line && line[0] && line[0].indexOf("#") !== 0) {
                switch (line[0].toLowerCase()) {
                    case "user-agent":
                        if (isUserAgentSection) currentUserAgents.length = 0;
                        if (line[1]) currentUserAgents.push(RobotsParser.extractBasePath(line[1]));
                        break;
                    case "disallow":
                        this.addRule(currentUserAgents, line[1], false);
                        break;
                    case "allow":
                        this.addRule(currentUserAgents, line[1], true);
                        break;
                    case "crawl-delay":
                        this.setCrawlDelay(currentUserAgents, line[1]);
                        break;
                    case "sitemap":
                        if (line[1]) this.addSitemap(line[1]);
                        break;
                    case "host":
                        if (line[1]) this.setPreferredHost(line[1].toLowerCase());
                        break;
                }
                isUserAgentSection = line[0].toLowerCase() !== "user-agent";
            }
        }
        if(this._sitemaps.length){
            this._sitemapInRobotFile = true;
        }
    }
    addRule(userAgents, pattern, allow) {
        userAgents.forEach(userAgent => {
            if (!this._rules[userAgent]) this._rules[userAgent] = [];
            if (pattern) {
                this._rules[userAgent].push({
                    pattern: RobotsParser.createRegExpFromPattern(pattern),
                    allow: allow
                });
            }
        });
    }
    setCrawlDelay(userAgents, delay) {
        const delayNumber = Number(delay);
        userAgents.forEach(userAgent => {
            if (!this._rules[userAgent]) this._rules[userAgent] = [];
            if (!isNaN(delayNumber)) {
                this._rules[userAgent].crawlDelay = delayNumber;
            }
        });
    }
    addSitemap(sitemapUrl) {
        this._sitemaps.push(sitemapUrl);
    }
    setPreferredHost(host) {
        this._preferredHost = host;
    }
    isAllowed(url, userAgent) {
        const parsedUrl = new URL(url);
        const baseUserAgent = RobotsParser.extractBasePath(userAgent || "*");

        parsedUrl.port = parsedUrl.port || 80;
        parsedUrl.hostname = parsedUrl.hostname.toString();

        if (parsedUrl.protocol === this._url.protocol && parsedUrl.hostname === this._url.hostname && parsedUrl.port === this._url.port) {
            const rules = this._rules[baseUserAgent] || this._rules["*"] || [];
            return RobotsParser.checkUrlAgainstRules(parsedUrl.pathname, rules);
        }
    }
    isDisallowed(url, userAgent) {
        return !RobotsParser.isAllowed(url, userAgent);
    }
    getCrawlDelay(userAgent) {
        const baseUserAgent = RobotsParser.extractBasePath(userAgent || "*");
        return (this._rules[baseUserAgent] || this._rules["*"] || {}).crawlDelay;
    }
    getPreferredHost() {
        return this._preferredHost;
    }
    getSitemaps() {
        return this._sitemaps.slice();
    }
    isSitemapInRobotFile() {
        return this._sitemapInRobotFile;
    }
    static normalizeInput(input) {
        return input ? Array.isArray(input) ? input.map(RobotsParser.normalizeInput) : String(input).trim() : null;
    }
    static splitOnColon(input) {
        var index = String(input).indexOf(":");
        return !input || index < 0 ? null : [input.slice(0, index), input.slice(index + 1)];
    }
    static extractBasePath(input) {
        var lowerCaseInput = input.toLowerCase();
        var slashIndex = lowerCaseInput.indexOf("/");
        if (slashIndex > -1) {
            lowerCaseInput = lowerCaseInput.substr(0, slashIndex);
        }
        return lowerCaseInput.trim();
    }
    static createRegExpFromPattern(pattern) {
        if (pattern.indexOf("*") < 0 && pattern.indexOf("$") < 0) {
            return pattern;
        }
        pattern = pattern.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&")
                         .replace(/\*/g, "(?:.*)")
                         .replace(/\\\$$/, "$");
        return new RegExp(pattern);
    }
    static checkUrlAgainstRules(path, rules) {
        let isAllowed = true;
        let longestPatternLength = 0;
        for (let rule of rules) {
            if (typeof rule.pattern === "string") {
                if (path.indexOf(rule.pattern) === 0) {
                    if (rule.pattern.length > longestPatternLength) {
                        longestPatternLength = rule.pattern.length;
                        isAllowed = rule.allow;
                    }
                }
            } else if (rule.pattern.test(path)) {
                return rule.allow;
            }
        }
        return isAllowed;
    }
    async checkForSitemaps() {
        if (this._sitemaps.length === 0) {
            const potentialSitemaps = [
                "/sitemap.xml",
                "/sitemap.txt",
                "/sitemap_index.xml"
            ];
            for (const path of potentialSitemaps) {
                const sitemapUrl = `${this._url.protocol}//${this._url.hostname}${path}`;
                const exists = await this.checkSitemapExists(sitemapUrl);
                if (exists) {
                    this.addSitemap(sitemapUrl);
                    break;
                }
            }
            if (this._sitemaps.length === 0) {
                // console.error("No sitemap found.");
            }
        }
    }
    async checkSitemapExists(sitemapUrl) {
        try {
            const headResponse = await fetch(sitemapUrl, { method: 'HEAD', redirect: 'manual' });
            if (headResponse.status === 301 || headResponse.status === 302) {
                const redirectUrl = headResponse.headers.get('location');
                if (redirectUrl) {
                    this.addSitemap(redirectUrl);
                    return true;
                }
            } else if (headResponse.ok) {
                return true;
            }
            if (headResponse.status === 405 || headResponse.status === 403) {
                const getResponse = await fetch(sitemapUrl, { method: 'GET', redirect: 'manual' });
                
                if (getResponse.status === 301 || getResponse.status === 302) {
                    const redirectUrl = getResponse.headers.get('location');
                    if (redirectUrl) {
                        this.addSitemap(redirectUrl);
                        return true;
                    }
                }
                return getResponse.ok;
            }
        } catch (error) {
            try {
                const getResponse = await fetch(sitemapUrl, { method: 'GET', redirect: 'manual' });
    
                if (getResponse.status === 301 || getResponse.status === 302) {
                    const redirectUrl = getResponse.headers.get('location');
                    if (redirectUrl) {
                        this.addSitemap(redirectUrl);
                        return true;
                    }
                }
    
                return getResponse.ok;
            } catch (error) {
                return false;
            }
        }
        return false;
    }
}