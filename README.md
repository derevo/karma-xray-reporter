# Karma Xray Reporter

Transforms Karma test output to Xray format which can be sent to an [Xray for JIRA installation](http://www.xpand-addons.com/xray/).

## Usage

`describe` and `it` blocks can contain one or more JIRA issue keys in their descriptions, which will then be converted into `Test Execution` reports in Xray.

`describe` blocks with JIRA keys will get their success status from the aggregate result of all of their child `it` blocks (see examples).

_Note that the JIRA issue keys *must be* keys of the *test* issue type, otherwise the import to Xray will fail._

### Examples
##### Using `describe` blocks
```
// ABC-123 will be reported with a "PASS" status
describe('ABC-123 A test suite for some feature', function () {
  it('should pass', function () {
    expect(true).toBeTrue();
  });
});
```
##### Using status aggregation with `describe` blocks
```
// ABC-123 will be reported with a "FAIL" status
describe('ABC-123 A test suite for some feature', function () {

  it('should fail', function () {
    expect(false).toBeTrue();
  });

  // ABC-124 will be reported with a "PASS" status
  it('ABC-124 should pass', function () {
    expect(true).toBeTrue();
  });

});
```
#### Tagging multiple JIRA issues
```
// ABC-123 and ABC-124 will be reported separately, each with a "PASS" statuses
describe('A test suite for some feature', function () {
  it('ABC-123 ABC-124 should pass', function () {
    expect(true).toBeTrue();
  });
});
```

## Configuration

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['xray']
  });
};
```

## Options

### filename

**Type:** String

File location to write to. Defaults to `xray.json` if not present.

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['xray'],
    xrayReporter: {
      filename: './xray.json'
    }
  });
};
```

### version

**Type:** String

The version number to add to the report. Note, in order for the Xray import to succeed, this must be a valid JIRA fix version for the projects you are importing to.

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['xray'],
    xrayReporter: {
      version: '1.0'
    }
  });
};
```

### revision

**Type:** String

The revision to add to the report.

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['xray'],
    xrayReporter: {
      revision: '1.1.0'
    }
  });
};
```

### passLabel

**Type:** String

The label to use for "passed" specs. Defaults to 'PASS' if not present.

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['xray'],
    xrayReporter: {
      passLabel: 'PASS'
    }
  });
};
```

### failLabel

**Type:** String

The label to use for "failed" specs. Defaults to 'FAIL' if not present.

```
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['xray'],
    xrayReporter: {
      failLabel: 'FAIL'
    }
  });
};
```
