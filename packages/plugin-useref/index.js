const { createPlugin, pipeChain, noopStream } = require('wok-core/utils');

function userefPlugin(stream, env, api, opts) {
  const useref = require('gulp-useref');
  const gulpif = require('gulp-if');
  const sourcemaps = require('gulp-sourcemaps');
  const conf = Object.assign(
    { sourcemaps: true },
    userefPlugin.transforms,
    opts,
  );

  conf.searchPath = conf.searchPath && api.pattern(conf.searchPath);
  conf.base = conf.base && api.resolve(conf.base);
  return stream
    .pipe(
      useref,
      conf,
      conf.sourcemaps &&
        pipeChain().pipe(
          sourcemaps.init,
          { loadMaps: true },
        ),
    )
    .pipe(() => gulpif(/\.(css|js)/, api.hooks.call('useref:assets', conf)))
    .pipe(() => gulpif('*.js', api.hooks.call('useref:js', conf)))
    .pipe(() => gulpif('*.css', api.hooks.call('useref:css', conf)))
    .pipe(
      conf.sourcemaps
        ? () =>
            sourcemaps.write(
              typeof conf.sourcemaps === 'string' ? conf.sourcemaps : undefined,
            )
        : () => noopStream,
    );
}

userefPlugin.transforms = {
  replace: (blockContent, target, attrs) =>
    `<script src="${target}"${attrs ? ` ${attrs}` : ''}></script>`,
};

module.exports = createPlugin({
  name: 'useref',
  productionOnly: true,
  plugin: userefPlugin,
});
