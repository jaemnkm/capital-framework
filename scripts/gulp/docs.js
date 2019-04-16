const gulp = require( 'gulp' );
const gulpRename = require( 'gulp-rename' );
const mergeStream = require( 'merge-stream' );

/**
 * Copies the usage docs into their appropriate spot in the doc site structure.
 * @returns {PassThrough} A source stream.
 */
function _copyUsageDocs() {
  return gulp.src( './packages/**/usage.md' )
    .pipe( gulpRename( path => {
      path.basename = 'index';
    } ) )
    .pipe( gulp.dest( './docs/components/' ) );
}

/**
 * Copies the compiled Capital Framework (CF) JS into the doc site structure.
 * TODO: This is different from how the CSS is handled,
 * which includes CF source less files and compiles the docs CSS.
 * The JavaScript should probably work this way to, to ensure that CF
 * works when it is initialized via another project's entry file.
 * @returns {PassThrough} A source stream.
 */
function _copyCFJs() {
  return gulp.src( './packages/capital-framework/capital-framework.min.js' )
  .pipe( gulp.dest( './docs/dist/js/' ) );
}

/**
 * Copies the SVG icons into the doc site structure.
 * @returns {PassThrough} A source stream.
 */
function _copyIcons() {
  return gulp.src( './packages/cf-icons/src/icons/*.svg' )
    .pipe( gulp.dest( './docs/_includes/icons/' ) );
}

/**
 * Move documentation files into /docs.
 * @returns {ChildProcess} A spawned process.
 */
function docs() {
  const streams = [ _copyUsageDocs(), _copyCFJs(), _copyIcons() ];
  return mergeStream( ...streams );
}

gulp.task( 'docs', docs );
