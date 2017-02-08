var fs = require('fs'),
    filename = 'xray.json',
    version = '',
    revision = '',
    passLabel = 'PASS',
    failLabel = 'FAIL',
    JIRA_KEY_PATTERN = /\b[A-Z]+-[0-9]+\b/g;

var XrayReporter = function (baseReporterDecorator, config) {
    var results = {info: {}, tests: []},
        startTime, endTime, browserUsed;

    startTime = new Date().toISOString().replace(/\.\d+Z/, '+00:00');

    // Extend the base reporter
    baseReporterDecorator(this);

    // Normalize config options
    filename = config && config.filename || filename;
    version = config && config.version || version;
    revision = config && config.revision || revision;
    passLabel = config && config.passLabel || passLabel;
    failLabel = config && config.failLabel || failLabel;

    this.onSpecComplete = function (browser, result) {
        var testKeys = [], parentKeys = [];

        if (result.description) {
            testKeys = parseJiraKey(result.description);
        }

        if (result.suite) {
            parentKeys = parseJiraKey(result.suite);
        }

        // Only report tests associated with Jira keys, since that's all we
        // care about
        if (testKeys.length) {
            testKeys.forEach(function (v, i) {
                var specResult = {};

                specResult.testKey = v;
                specResult.finish = new Date().toISOString().replace(/\.\d+Z/, '+00:00');
                specResult.start = new Date();
                specResult.start.setSeconds(specResult.start.getSeconds() - result.time);
                specResult.start = specResult.start.toISOString().replace(/\.\d+Z/, '+00:00');
                specResult.status = /^true$/i.test(result.success) ? passLabel : failLabel;
                results.tests.push(specResult);
            });

            browserUsed = browser;

        } if (parentKeys.length) {
            parentKeys.forEach(function (v, i) {
                var specResult = results.tests.find(function (el) {
                        return el.testKey === v;
                    }),
                    newEntry = false;

                if (!specResult) {
                    specResult = {
                        testKey: v,
                        start: new Date().toISOString().replace(/\.\d+Z/, '+00:00')
                    };
                    newEntry = true;
                }

                // Update parent with latest "finish" date
                specResult.finish = new Date().toISOString().replace(/\.\d+Z/, '+00:00');

                if (/^false$/i.test(result.success)) {
                    specResult.status = failLabel;
                } else if (!/^FAIL$/i.test(specResult.status) && /^true$/i.test(result.success)) {
                    specResult.status = passLabel;
                }

                if (newEntry) {
                    results.tests.push(specResult);
                } else {
                    results.tests[results.tests.indexOf(specResult)] = specResult;
                }


            });

            browserUsed = browser;
        }
    };

    this.onRunComplete = function (browser, result) {
        endTime = new Date().toISOString().replace(/\.\d+Z/, '+00:00');
        results.info.summary = "Web Publisher JS automation test execution";
        results.info.description = "Tests run on " + browserUsed;
        results.info.version = version;
        results.info.revision = revision;
        results.info.startDate = startTime;
        results.info.finishDate = endTime;

        fs.writeFileSync(filename, JSON.stringify(results), 'utf-8');
        this.write('\nXray results written to: ' + filename + '\n');
    };

    /**
     * Parses the first JIRA issue key found in a string
     * @param  {String|Array} string The string or array of strings to parse
     * @return {Array} Returns an array of keys
     */
    function parseJiraKey (string) {
        var returnArray = [];

        if (!Array.isArray(string)) {
            string = [string];
        }

        string.forEach(function (v, i) {
            var matches = v.match(JIRA_KEY_PATTERN);

            if (matches && matches.length) {
                returnArray = returnArray.concat(matches);
            }
        });

        return returnArray;
    }

}

XrayReporter.$inject = ['baseReporterDecorator', 'config.xrayReporter'];

// PUBLISH DI MODULE
module.exports = {
    'reporter:xray': ['type', XrayReporter]
};