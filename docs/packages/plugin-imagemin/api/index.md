<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## imageMinPlugin(lazypipe, env, api, params)

A plugin to optimize image files in a stream of files.

### Parameters

-   `lazypipe` **Lazypipe** Hook accumulator
-   `env` **[object][1]** Wok environment configuration object
    -   `env.production`  
-   `api` **[object][1]** Wok internal API
-   `params` **[object][1]** Plugin parameters.
    -   `params.pattern` **([string][2] \| [Array][3]&lt;[string][2]>)** Glob pattern matching image files (optional, default `'**/*.{png,jpg,gif,svg,webp}'`)

Returns **Lazypipe** 

[1]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
