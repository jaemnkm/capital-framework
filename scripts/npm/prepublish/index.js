var path = require('path'),
    fs = require('fs'),
    readdir = require('fs-readdir-promise'),
    Promise = require('bluebird');
    semver = require('semver'),
    util = require('./lib'),
    componentsDir = path.join(__dirname, '..', '..', '..', 'src');

// Check git's status.
util.getGitStatus('./')
  // Abort if the working directory isn't clean.
  .then(handleGitStatus)
  // Get a list of CF components from the components/ dir.
  .then(getComponents)
  // Filter the components that have been updated and need to be published.
  .then(filterComponents)
  // Confirm that the user wants to build them.
  .then(confirmBuild)
  // Build those components.
  .then(buildComponents)
  // Confirm that the user wants to publish them.
  .then(confirmPublish)
  // Publish those components.
  .then(publishComponents)
  // Report any errors that happen along the way.
  .catch(handleError);

function handleError(msg) {
  util.printLn.error(msg);
  process.exit(1);
}

function handleGitStatus(result) {
  if (!result.stdout && !result.stderr) {
    util.printLn.success('Git working directory is clean.');
  } else {
    util.printLn.error('Git working directory is not clean. Commit your work before publishing.');
    // process.exit(1);
  }
}

function getComponents() {
  return readdir(componentsDir);
}

function filterComponents(components) {
  // if (err) return console.log(err);
  util.printLn.info('Checking which components need to be published to npm...');
  return Promise.all(components.map(compareVersionNumber));
}

function compareVersionNumber(component) {
  if (component.indexOf('cf-') !== 0) return;
  var manifest = componentsDir + '/' + component + '/package.json',
      localVersion = JSON.parse(fs.readFileSync(manifest, 'utf8')).version;
  return util.getNpmVersion(component).then(function(data) {
  // return util.getNpmVersion('log-symbols').then(function(data) {
    var npmVersion = data['dist-tags'].latest;
    // var npmVersion = '2.0.0';
    if (semver.gt(localVersion, npmVersion)) {
      util.printLn.success(component + ': bumped from ' + npmVersion + ' to ' + localVersion, true);
      return component;
    } else if (semver.lt(localVersion, npmVersion)) {
      util.printLn.error('Error: ' + component + ' was bumped to ' + localVersion + ' locally but the latest version on npm is ' + npmVersion + '.', true);
    } else {
      util.printLn.info(component + ': still at ' + npmVersion, true);
    }
  }).catch(function(err) {
    util.printLn.error(err);
    process.exit(1);
  });
}

function confirmBuild(components) {
  components = components.filter(function(c) {
    return c !== undefined;
  }); 
  util.printLn.success('Components that will be built and published: ' +  components.join(', '));
  return util.confirm({
    prompt: '    Look good? Are you ready to have gulp build them?',
    yes: 'Building them now...',
    no: 'Aborting. See ya!',
    data: components
  });
}

function buildComponents(components) {
  return Promise.all(components.map(function(component) {
    return util.build(component);
  }));
}

function confirmPublish(components) {
  util.printLn.success('Components successfully built to tmp/.');
  return util.confirm({
    prompt: '    Would you like to publish them to npm?',
    yes: 'Publishing the components to npm...',
    no: 'Aborting. See ya!'
  });
}

function publishComponents(components) {
  // To do.
  process.exit(1);
}
