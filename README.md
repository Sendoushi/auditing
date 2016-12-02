# Bedrock: Audit

Audits to use on the frontend.
The runner is based on [mocha](https://mochajs.org/).

[![Build Status](https://travis-ci.org/Sendoushi/bedrock-audit.svg?branch=master)](https://travis-ci.org/Sendoushi/bedrock-audit)

## Installation
You need to have [node](http://nodejs.org) so you can have the package dependency management and use the tasks:
- Install [node](http://nodejs.org)

```
cd <project_folder>
npm init # If you don't have a package.json already
npm install --save git://github.com/Sendoushi/bedrock-audit.git#0.0.1
```

## Tasks

Set a `.audit.json` and run all the tasks you want when you pass it to `bedrock-audit`.<br>
**Note:** Any kind of path should be absolute or relative to the place the script is called.

### Usage

```
node <mocha_path> <bedrock_audit_src> --config=<config_src>
```

#### CLI Explanation
```
<mocha_path>
```
Pass the path to `mocha`. From example `node_modules/mocha/bin/mocha`. You could simply use `mocha` instead if you have it globally.

```
<bedrock_audit_src>
```
Set the path for the `bedrock-audit` main src file. It is required.

#### Example

```sh
node ./node_modules/mocha/bin/mocha ./node_modules/bedrock-audit/suite/audit.js --config=".audit.json"
```

=========

## Configure

This repo relies on usage of `*.json` config files. Below I try to explain the best I can how to.

### Config file parameters
```json
{
    "projectId": "<project_id>",
    "projectName": "<project_name>",
    "data": [{
        "urls": ["<url_path>"],
        "audits": ["w3", "SEO", "lighthouse", "eslint", "stylelint", "<path_to_custom>"],
        "base": "<optionl_url_base_path>",
        "baseEnv": "<optionl_env_var_to_set_base_upon>"
    }]
}
```

### Examples
Go under the [test/examples](test/examples) folder and check the `*.json`.
