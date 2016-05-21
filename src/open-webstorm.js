/**
 * Module dependencies.
 */

const
  fs              = require('fs'),
  net             = require('net'),
  path            = require('path'),
  Promise         = require('bluebird'),
  opn             = require('opn'),
  expandHomeDir   = require('expand-home-dir');


function ensurePath(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (e) => {
      if (e) { return reject(e); }

      resolve(filePath);
    });
  });
}


function readFile(tokenPath) {
  return new Promise((resolve, reject) => {
    fs.readFile(tokenPath, { encoding: 'utf8' }, (e, data) => {
      if (e) { return reject(e); }

      resolve(data);
    });
  });
}

function statFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(path.join(filePath), (e, stat) => {
      if (e) { return reject(e); }

      resolve({
        path: filePath,
        stat
      });
    });
  });
}

function findLatestVersion(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (e, entries) => {
      if (e) { return reject(e); }

      const webstormEntries = entries.filter((entry) => entry.indexOf('WebStorm') === 0)
        .map((entry) => path.join(dir, entry));

      if (!webstormEntries.length) {
        return reject(new Error('WebStorm configuration directory was not found'));
      }

      Promise.map(webstormEntries, (entry) => statFile(entry))
      .then((files) => {
        const sortedVersions = files
          .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

        return resolve(sortedVersions[0].path);
      }).catch(reject);
    });
  });
}

function findPort() {
  return findLatestVersion(expandHomeDir('~/Library/Preferences'))
    .then((latest) => readFile(path.join(latest, 'port')));
}

function findToken() {
  return findLatestVersion(expandHomeDir('~/Library/Caches/'))
    .then((latest) => readFile(path.join(latest, 'token')));
}

function openWithWebStorm(workspacePath) {
  return findLatestVersion('/Applications')
    .then((webstormPath) => opn(workspacePath, { app: webstormPath }));
}


function buildLaunchPacket(token, cwdPath, workspacePath) {
  const
    bufCommand = new Buffer([
      `activate ${token}`,
      cwdPath,
      '\0',
      workspacePath
    ].join('\0'), 'utf8'),
    bufCommandSize = new Buffer(2);

  bufCommandSize.writeInt16BE(bufCommand.length, 0);

  return Buffer.concat([
    bufCommandSize,
    bufCommand
  ]);
}

function sendPacket(port, bufPacket) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, () => {
      socket.end(bufPacket);
    }).on('end', () => {
      resolve();
    }).on('error', (e) => {
      reject(e);
    });
  });
}

// eslint-disable-next-line arrow-body-style
module.exports = exports = (workspaceDir, options = {}) => {
  return new Promise((resolve, reject) => {
    Promise.props({
      port: options.port ? Promise.resolve(options.port) : findPort(),
      token: options.token ? Promise.resolve(options.token) : findToken(),
      cwd: options.cwd ? ensurePath(options.cwd) : Promise.resolve(process.cwd())
    }).then((config) => {
      const
        port = config.port,
        bufPacket = buildLaunchPacket(config.token, config.cwd, workspaceDir);

      sendPacket(port, bufPacket)
        .then(() => resolve(true))
        .catch(() => { // failed to send packet, maybe webstorm is offline? start it.
          openWithWebStorm(workspaceDir).then(resolve).catch(reject);
        });
    }).catch(reject);
  });
};

