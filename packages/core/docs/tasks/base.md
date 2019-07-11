# Base Task

A generic purpose task. Use it as base for custom tasks.

## Parameters

| parameter | type               | note                                   |
| --------- | ------------------ | -------------------------------------- |
| `src`     | string<br>string[] | [Globs][1] source files <sup>(1)</sup> |
| `dest`    | string             | Destination folder <sup>(1)</sup>      |
| `name`    | string             | Final task name                        |
| `cache`   | boolean (`false`)  | Run the task on changed files only     |

1. Supports environment templates.

[1]: https://gulpjs.com/docs/en/api/concepts#globs

## Hooks

| name       | type          | description                                                   |
| ---------- | ------------- | ------------------------------------------------------------- |
| `process`  | [lazypipe][2] | executed before writing each file onto the destination folder |
| `complete` | [lazypipe][2] | executed after each file has been written                     |

[2]: https://github.com/OverZealous/lazypipe

## Example

Create a file concatenation task.

```js
const gulp = require('gulp');
const config = require('@wok-cli/core');
const { base } = require('@wok-cli/core/tasks');
const concat = require('gulp-concat');

const $ = config(gulp);

const concatTask = $.task(base, {
  src: ['src/js/*.js'],
  dest: 'dist',
  name: 'concat',
});

concatTask.tap('process', 'concat', (lazypipe) => lazypipe.pipe(concat));

exports.concat = concatTask;
```