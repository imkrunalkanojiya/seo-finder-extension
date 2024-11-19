class UrlCheckerSettings {
    constructor() {
        this.maxSlashesInUrl = 5;
        this.minWordsPerPage = 300;
        this.maxUrlLength = 100;
        this.maxCssBytes = 50000;
        this.maxJsBytes = 10000;
        this.minTitleLength = 10;
        this.maxTitleLength = 60;
        this.maxH1Length = 70;
        this.minH1Length = 1;
        this.minDescriptionLength = 100;
        this.maxDescriptionLength = 320;
    }
}
class TableColumn {
    constructor(props) {
        this.name = "";
        this.type = "unfamiliar";
        this.width = undefined;
        this.name = props.name || this.name;
        this.width = props.width || this.width;
        this.type = props.type || this.type;
        if (this.width === TableColumn.autoW) {
            this.width = undefined;
        }
    }
}

TableColumn.smallWidth = 157;
TableColumn.balanceWidth = 208;
TableColumn.bigWidth = 285;
TableColumn.veryBigWidth = 418;
TableColumn.autoW = -1;

class UrlColumn extends TableColumn {
  constructor(props) {
    super(Object.assign({
      type: "url"
    }, props));
  }
}

class ListColumn extends TableColumn {
    constructor(options, columns) {
        super(Object.assign({
            type: "list",
            width: TableColumn.balanceWidth
        }, options));
        this.columns = columns;
    }
}

class TextColumn extends TableColumn {
    constructor(options) {
        super(Object.assign({
            type: "text",
            width: TableColumn.bigWidth
        }, options));
    }
}

class LongTextColumn extends TableColumn {
    constructor(options) {
        super(Object.assign({
            type: "text",
            width: TableColumn.veryBigWidth
        }, options));
    }
}

class NumberColumn extends TableColumn {
    constructor(options) {
        super(Object.assign({
            type: "number",
            width: TableColumn.smallWidth
        }, options));
    }
}

class CodeColumn extends TableColumn {
    constructor(options) {
        super(Object.assign({
            type: "code",
            width: TableColumn.balanceWidth
        }, options));
    }
}

class BooleanColumn extends TableColumn {
    constructor(options) {
        super(Object.assign({
            type: "bool",
            width: TableColumn.smallWidth
        }, options));
    }
}

class PassedColumn extends BooleanColumn {
    constructor(options) {
        super(Object.assign({
            name: "Passed",
            type: "passed",
            width: 68
        }, options));
    }
}

class ReportStatistics {
    constructor() {
        this.targetUrl = "";
        this.tagetUrlHost = "";
        this.responseCount = 0;
        this.hostName = "";
        this.score = 0;
        this.maxScore = 0;
        this.pagesCount = 0;
        this.brokenUrlsCount = 0;
        this.categoryScores = {};
    }
}

const globalReportSettings = [];

const ReportPriority = {
    info: "info",
    low: "low",
    medium: "medium",
    high: "high"
};

const ReportPriorityWeight = {
    high: 12,
    medium: 4,
    low: 1,
    info: 0
};