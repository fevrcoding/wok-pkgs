module.exports = (baseConfig) => {
  const config = require('@wok-cli/preset-wok/config')(baseConfig);

  const targets = {
    staging: {
      host: '192.168.1.57',
      username: 'ftpuser',
      password: 'ftpuser',
      path: '/home/ftpuser/ftp/ssh_files',
      deployStrategy: 'rsync',
      backup: '/home/ftpuser/ftp/backups',
    },
    production: {
      host: '192.168.1.57',
      username: 'ftpuser',
      password: 'ftpuser',
      path: 'files',
      deployStrategy: 'ftp',
    },
  };

  return {
    ...config,
    targets,
  };
};
