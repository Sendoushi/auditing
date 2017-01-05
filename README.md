# Auditing

Set the audits once and just run the tests.
The runner is based on [mocha](https://mochajs.org/).

[![Build Status](https://travis-ci.org/Sendoushi/auditing.svg?branch=master)](https://travis-ci.org/Sendoushi/auditing)

----------

## Installation

- Install [node](http://nodejs.org)

```sh
cd <project_folder>
npm init # If you don't have a package.json already
npm install --save-dev auditing
```

----------

## Usage

#### Core usage

I still have to document how you can `require` and use the `core` directly but just so that you know, you can do it and the results are based on `promises`.

#### CLI

Set a `.audit.json` and run all the tasks you want when you pass it to `auditing`.<br>

**Note:**
Any kind of path should be absolute or relative to the place the script is called.

```sh
node <mocha_path> <auditing> --mocha=true --config=<config_src>

# Pass the path to mocha. For example node_modules/mocha/bin/mocha.
# You could simply use mocha instead if you have it globally or if you're using npm scripts.
<mocha_path>

# Set the path for the auditing main index.js file.
<auditing>
```

##### Example

```sh
node ./node_modules/mocha/bin/mocha ./node_modules/auditing/dist/index.js --mocha=true --config=".audit.json"

# Or for ES6... You will need babel-core in the dependencies and ES2015 preset setup in your .babelrc
node ./node_modules/mocha/bin/mocha ./node_modules/auditing/src/index.js --compilers js:babel-core/register --mocha=true --config=".audit.json"
```

-------------------

## Configuration

```json
{
    "projectId": "<project_id>",
    "projectName": "<project_name>",
    "data": [{
        "src": ["<url_path>", "<content|markup>", "<file>"],
        // Type should reflect the src type
        "type": "url|content|file",
        // Type can also be an object
        "type": {
            "of": "url",
            // base and baseEnv are options only available for type url
            "base": "<optional_url_base_path>",
            "baseEnv": "<optional_env_var_to_set_base_upon>"
        },
        "audits": ["<path_to_custom>", {
            "src": "<path_to_custom>",
            // Ignore rules and nested messages with ignore
            "ignore": ["<pattern_to_ignore>"]
        }]
    }]
}
```

### Examples
Go under the [src/_test/data](src/_test/data) folder and check the `*.json`.
