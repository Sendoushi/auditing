# Auditing

Set the audits once and just run the tests.
The runner is based on [mocha](https://mochajs.org/).

[![Build Status](https://travis-ci.org/Sendoushi/auditing.svg?branch=master)](https://travis-ci.org/Sendoushi/auditing)

----------

## Installation

- Install [node](http://nodejs.org)

```
cd <project_folder>
npm init # If you don't have a package.json already
npm install --save-dev auditing
```

----------

## Tasks

Set a `.audit.json` and run all the tasks you want when you pass it to `auditing`.<br>

**Note:**
Any kind of path should be absolute or relative to the place the script is called.

### Usage


#### CLI

```
node <mocha_path> <auditing> --mocha=true --config=<config_src>
```

##### Explanation

```
<mocha_path>
```
Pass the path to `mocha`. From example `node_modules/mocha/bin/mocha`. You could simply use `mocha` instead if you have it globally or if you're using `npm scripts`.

```
<auditing>
```
Set the path for the `auditing` main `index.js` file. It is required.

##### Example

```sh
node ./node_modules/mocha/bin/mocha ./node_modules/auditing/dist/index.js --mocha=true --config=".audit.json"

# Or for ES6... You will need babel-core in the dependencies and ES2015 preset setup in the .babelrc
node ./node_modules/mocha/bin/mocha ./node_modules/auditing/src/index.js --compilers js:babel-core/register --mocha=true --config=".audit.json"
```

=========

## Configure

This repo relies on usage of `*.json` config files. Below I try to explain how to.

### Config file parameters
```json
{
    "projectId": "<project_id>",
    "projectName": "<project_name>",
    "data": [{
        "urls": ["<url_path>"],
        "audits": ["w3", "SEO", "lighthouse", "<path_to_custom>", {
            "name": "Custom",
            "src": "<path_to_custom>",
            "ignore": ["<pattern_to_ignore>"]
        }, {
            "name": "w3"
        }],
        "base": "<optionl_url_base_path>",
        "baseEnv": "<optionl_env_var_to_set_base_upon>"
    }]
}
```

### Examples
Go under the [src/_test/data](src/_test/data) folder and check the `*.json`.
