const { copy, clean } = require('wok-core/tasks');
const bump = require('task-bump');
const styles = require('task-styles');
const scripts = require('task-scripts');
const modernizr = require('task-modernizr');
const views = require('task-views');
const { createPreset } = require('wok-core/preset');
const { runif } = require('wok-core/utils');
const imagemin = require('plugin-imagemin');
const sass = require('plugin-sass');
const rev = require('task-rev');
const serve = require('task-serve');
const { babel, eslint, stylelint, minifyJS } = require('./lib/hooks');

// passed-in config object
module.exports = (config) => {
  const preset = createPreset(config);

  const { env } = config;

  preset
    .set('bump', bump)
    .set('clean', clean, {
      pattern: ['<%= paths.dist.root %>/**/*', '<%= paths.tmp %>'],
    })
    .set('copy')
    .task(copy)
    .params({
      pattern: ['<%= paths.static %>/**/*'],
      dest: '<%= paths.dist.root %>',
    })
    .hook('beforeWrite', 'imagemin', imagemin)
    .end()

    .set('styles', styles)
    .hook('styles:pre', 'stylelint', stylelint)
    .hook('styles:pre', 'sass', sass)
    .params('styles', {
      src: ['<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}'],
      dest: '<%= paths.dist.root %>/<%= paths.styles %>',
      'hooks:pre': {
        sass: {
          includePaths: ['<%= paths.src.vendors %>', 'node_modules'],
          publicPath: '/assets',
          basePath: '<%= paths.src.root %>/assets',
        },
      },
    })
    .set('scripts', scripts, {
      src: ['<%= paths.src.root %>/<%= paths.scripts %>/**/*.js'],
      dest: '<%= paths.dist.root %>/<%= paths.scripts %>',
    })
    .hook('scripts:pre', 'eslint', eslint)
    .hook('scripts:transform', 'babel', babel)
    .set('modernizr', modernizr, {
      src: [
        '<%= paths.src.root %>/<%= paths.scripts %>/**/*.js',
        '<%= paths.src.root %>/<%= paths.styles %>/**/*.{sass,scss}',
      ],
      dest: '<%= paths.dist.root %>/<%= paths.dist.vendors %>/modernizr/',
      options: ['setClasses', 'addTest', 'testProp'],
    })
    .set('views', views)
    .hook('views:engines', 'nunjucks', require('plugin-render-nunjucks'))
    .hook('views:post', 'useref', require('plugin-useref'))
    .params('views', {
      src: ['<%= paths.src.views %>/**/*.*', '!<%= paths.src.views %>/**/_*.*'],
      dest: '<%= paths.dist.root %>',
      data: '<%= paths.src.fixtures %>/**/*.*',
      'hooks:engines': {
        nunjucks: {
          root: ['<%= paths.src.views %>', '<%= paths.src.fixtures %>'],
        },
      },
      'hooks:post': {
        useref: {
          searchPath: ['<%= paths.dist.root %>', '<%= paths.tmp %>'],
          // we need this to be inline to prevent the generation of multiple map files
          sourcemaps: true,
        },
      },
    })
    .set('rev', rev, {
      pattern: [
        '<%= paths.dist.root %>/assets/**/*',
        '<%= paths.dist.root %>/<%= paths.dist.vendors %>/modernizr/*.*',
      ],
      dest: '<%= paths.dist.root %>',
      manifest: '<%= paths.dist.root %>/<%= paths.dist.revmap %>',
    })
    .hook('rev:before', 'minify', minifyJS)
    .set('cleanup', clean, {
      pattern: ['<%= paths.tmp %>'],
    })
    .set('server', serve, {
      baseDir: ['<%= paths.dist.root %>', '<%= paths.static %>'],
    })
    .default(
      ({ clean, copy, styles, scripts, modernizr, views, cleanup, rev }) => {
        return config.series(
          clean,
          config.parallel(
            // runif(() => env.$$isServe !== true, copy),
            styles,
            scripts,
            modernizr,
          ),
          views,
          runif(() => env.production, rev),
          cleanup,
        );
      },
    )
    .hook('styles:complete', 'reload', (stream, env) => {
      if (env.$$isServe && env.livereload !== false) {
        const bs = serve.getServer(env);
        return stream.pipe(
          bs.stream,
          { match: '**/*.css' },
        );
      }
      return stream;
    })
    .compose(
      'watch',
      ({ styles, scripts, server, views }, _, params) => {
        return function watch(done) {
          const reload = server.reload();

          [
            {
              patterns: preset.params('styles').get('src'),
              task: styles,
            },
            {
              patterns: preset.params('scripts').get('src'),
              task: config.series(scripts, reload),
            },
            {
              patterns: [
                '<%= paths.src.views %>/**/*.*',
                '<%= paths.src.fixtures %>/**/*.*',
              ],
              task: config.series(views, reload),
            },
            {
              id: 'static',
              patterns: ['<%= paths.static %>/**/*'],
              task: reload,
            },
          ].map((cfg) => config.watcher(cfg, params));
          done();
        };
      },
    )
    .compose(
      'serve',
      ({ default: def, server, watch }) => {
        function setup() {
          env.$$isServe = true;
          return Promise.resolve();
        }
        return config.series(setup, def, config.parallel(server, watch));
      },
    );

  if (env.production) {
    preset
      .params('scripts')
      .set('dest', '<%= paths.tmp %>/<%= paths.scripts %>');
    preset
      .params('modernizr')
      .set('dest', '<%= paths.tmp %>/<%= paths.dist.vendors %>/modernizr');
    preset.params('styles').set('dest', '<%= paths.tmp %>/<%= paths.styles %>');

    preset.params('server').set('baseDir', ['<%= paths.dist.root %>']);
  }

  return preset;
};
