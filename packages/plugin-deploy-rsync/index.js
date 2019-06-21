const { createPlugin, logger } = require('wok-core/utils');

function rsyncPlugin(
  promise,
  env,
  api,
  { src, exclude = [], ...options },
  cfg,
) {
  if (cfg.strategy !== 'rsync') {
    return promise;
  }

  const rsync = require('rsyncwrapper');
  const { username, port = 22, path, host } = cfg.target;

  const config = {
    src: api.resolve(src),
    dest: api.resolve(path),
    host: `${username}@${host}`,
    recursive: true,
    compareMode: 'checksum',
    delete: true,
    args: ['--verbose', '--progress', '--cvs-exclude'],
    exclude: api.pattern(exclude),
    port,
    ...options,
  };

  return promise.then(() => {
    new Promise((resolve, reject) => {
      rsync(config, (error, stdout, sterr, cmd) => {
        logger.msg('Running command ' + cmd);
        if (error) {
          // failed
          logger.error(error.message);
          reject(error);
        } else {
          logger.msg(stdout);
          resolve();
        }
      });
    });
  });
}

module.exports = createPlugin({
  name: 'rsync',
  plugin: rsyncPlugin,
});