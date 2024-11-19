const generateReportCategories = (reports, dashboard) => {
  // const createSubcategory = (reports, subcategory) => {
  //     const clonedReports = _.clone(reports);
  //     return {
  //         subcategory: subcategory,
  //         reports: _.map(clonedReports, report => {
  //             const clonedReport = _.clone(report);
  //             clonedReport.results = ["hidden"];
  //             return clonedReport;
  //         })
  //     };
  // };

  // const visibleReports = _.filter(reports, report => dashboard.environmentDevelopment || !report.reportGenerator.hidden);
  const groupedByCategory = _.groupBy(reports, report => report.reportGenerator.category);

  return _.mapValues(groupedByCategory, (reports, category) => {
      const groupedBySubcategory = _.groupBy(reports, report => report.reportGenerator.subcategory);
      // const subsections = _.map(groupedBySubcategory, (subcategoryReports, subcategory) => createSubcategory(subcategoryReports, subcategory));
      const categoryScore = dashboard.categoryScores[category];
      const label = categoryScore ? `${categoryScore.score}%` : `${Helper.formatNumber(dashboard.responseCount)} ${dashboard.responseCount === 1 ? "URL" : "URLs"}`;

      return {
          visible: false,
          label: label,
          subsections: groupedBySubcategory
      };
  });
};

class ReportGenerator {
  constructor(options) {
    const { filterResponsesMemoiser } = options;
    const indexablePages = filterResponsesMemoiser(Helper.isHtmlInternalAndIndexable);

    const downloadedResources = filterResponsesMemoiser(Helper.isJsOrCss);

    const urlProperty = _.property("url");

    this.indexablePagesByPrimaryHeading = Helper.groupByProperty(indexablePages, "primaryHeading", urlProperty);
    this.indexablePagesByTitle = Helper.groupByProperty(indexablePages, "title", urlProperty);
    this.indexablePagesByDescription = Helper.groupByProperty(indexablePages, "description", urlProperty);
    this.indexablePagesByUniqueHashValue = Helper.groupByProperty(indexablePages, "uniqueHashValue", urlProperty);
    this.indexablePagesByContentHash = Helper.groupByProperty(downloadedResources, "contentHash", urlProperty);

    this.crawl = options.crawl;
    this.config = options.config;
  }

  getResponse(url) {
    return this.crawl.responses[url];
  }

  getResAndDestination(url) {
    const response = this.getResponse(url);
    const destinationUrl = response && response.finalRedirect;
    const destination = destinationUrl ? this.crawl.getResponse(destinationUrl) : undefined;
    return { response, destination };
  }

  getResAndFollowingTargets(url) {
    const response = this.getResponse(url);
    const destination = response && this.crawl.getResFollowingTargets(response.url);
    return { response, destination };
  }

  getResFollowingTargets(url) {
    return this.crawl.getResFollowingTargets(url);
  }
}
