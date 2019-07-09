/* eslint-disable */
const gulp = require('gulp');
const path = require('path');
const rollup = require('gulp-rollup');
const rename = require('gulp-rename');
const del = require('del');
const runSequence = require('run-sequence');
const inlineResources = require('gulp-inline-source');
const inlineTemplate = require('gulp-inline-ng2-template');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');

const rootFolder = path.join(__dirname);
const srcFolder = path.join(rootFolder, 'src');
const tmpFolder = path.join(rootFolder, '.tmp');
const buildFolder = path.join(rootFolder, 'build');
const distFolder = path.join(rootFolder, 'dist');

/**
 * 1. Clean
 */
gulp.task(
  'clean',
  [
    'clean:tmp',
    'clean:build'
  ]
);

/**
 * Delete /build folder
 */
gulp.task(
  'clean:build',
  function() {
    return deleteFolders(
      [
        buildFolder
      ]
    );
  }
);

/**
 * Delete /dist folder
 */
gulp.task(
  'clean:dist',
  function() {
    return deleteFolders([distFolder]);
  }
);

/**
 * Delete /.tmp folder
 */
gulp.task(
  'clean:tmp',
  function() {
    return deleteFolders([tmpFolder]);
  }
);

/**
 * 2. Clone the /src folder into /.tmp. If an npm link inside /src has been made,
 *    then it's likely that a node_modules folder exists. Ignore this folder
 *    when copying to /.tmp.
 */
gulp.task(
  'copy:source',
  function() {
    return gulp.src(
      [
        `${srcFolder}/**/*`,
        `!${srcFolder}/node_modules`
      ]
    ).pipe(gulp.dest(tmpFolder));
  }
);

/**
 * 3. Inline template (.html) and style (.css) files into the the component .ts files.
 *    We do this on the /.tmp folder to avoid editing the original /src files
 */
gulp.task(
  'inline',
  [
    'inline-resources',
    'inline-templates'
  ]
);

gulp.task(
  'inline-resources',
  function() {
    return Promise.resolve().then(
      () => inlineResources(tmpFolder)
    );
  }
);

gulp.task(
  'inline-templates',
  function() {
    return gulp.src(srcFolder + '/**/*.ts').pipe(
      inlineTemplate(
        {
          base: 'src/auto-complete'
        }
      )
    ).pipe(
      gulp.dest(tmpFolder)
    );
  }
);

/**
 * 4. Run the Angular compiler, ngc, on the /.tmp folder. This will output all
 *    compiled modules to the /build folder.
 */

gulp.task(
  'typescript:compile',
  function() {
    return gulp.src(
      `${tmpFolder}/**/*.ts`
    ).pipe(
      typescript(tscConfig.compilerOptions)
    ).pipe(
        gulp.dest(`${buildFolder}/`)
    );
  }
);

/**
 * 5. Run rollup inside the /build folder to generate our Flat ES module and place the
 *    generated file into the /dist folder
 */
gulp.task(
  'rollup',
  [
    'rollup:fesm',
    'rollup:umd'
  ]
);

gulp.task(
  'rollup:fesm',
  function() {
    return gulp.src(`${buildFolder}/**/*.js`)
      // transform the files here.
      .pipe(
        rollup(
          {
            // Bundle's entry point
            // See https://github.com/rollup/rollup/wiki/JavaScript-API#entry
            input: `${buildFolder}/index.js`,

            // A list of IDs of modules that should remain external to the bundle
            // See https://github.com/rollup/rollup/wiki/JavaScript-API#external
            external: [
              '@angular/core',
              '@angular/common'
            ],

            // Format of generated bundle
            // See https://github.com/rollup/rollup/wiki/JavaScript-API#format
            output: {
              format: 'es',
              sourcemap: true
            }
          }
        )
      ).pipe(
          gulp.dest(distFolder)
      );
  }
);

/**
 * 6. Run rollup inside the /build folder to generate our UMD module and place the
 *    generated file into the /dist folder
 */
gulp.task(
  'rollup:umd',
  function() {
    return gulp.src(
      `${buildFolder}/**/*.js`
    ).pipe(
      rollup(
        {
          // Bundle's entry point
          // See https://github.com/rollup/rollup/wiki/JavaScript-API#entry
            input: `${buildFolder}/index.js`,

          // A list of IDs of modules that should remain external to the bundle
          // See https://github.com/rollup/rollup/wiki/JavaScript-API#external
          external: [
            '@angular/core',
            '@angular/common'
          ],

          output: {
            // Export mode to use
            // See https://github.com/rollup/rollup/wiki/JavaScript-API#exports
            exports: 'named',

            // Format of generated bundle
            // See https://github.com/rollup/rollup/wiki/JavaScript-API#format
            format: 'umd',

            // See https://github.com/rollup/rollup/wiki/JavaScript-API#globals
            globals: {
              typescript: 'ts'
            },

            // The name to use for the module for UMD/IIFE bundles
            // (required for bundles with exports)
            // See https://github.com/rollup/rollup/wiki/JavaScript-API#modulename
            name: 'ionic4-auto-complete',
          }
        }
      )
    ).pipe(
      rename('ionic4-auto-complete.umd.js')
    ).pipe(
        gulp.dest(distFolder)
    );
  }
);

/**
 * 7. Copy all the files from /build to /dist, except .js files. We ignore all .js from /build
 *    because with don't need individual modules anymore, just the Flat ES module generated
 *    on step 5.
 */
gulp.task(
  'copy:dist',
  [
    'copy:build',
    'copy:assets',
    'copy:manifest',
    'copy:readme'
  ]
);

gulp.task(
  'copy:build',
  function() {
    return gulp.src(
      [
        `${buildFolder}/**/*`,
        `!${buildFolder}/**/*.js`
      ]
    ).pipe(
      gulp.dest(distFolder)
    );
  }
);

/**
 * Copy assets to /dist
 */
gulp.task(
  'copy:assets',
  function() {
    return gulp.src(
      [
        `${srcFolder}/assets/*`
      ]
    ).pipe(
      gulp.dest(`${distFolder}/assets/`)
    );
  }
);

/**
 * Copy package.json from /src to /dist
 */
gulp.task(
  'copy:manifest',
  function() {
    return gulp.src(
      [
        `${srcFolder}/package.json`
      ]
    ).pipe(
      gulp.dest(distFolder)
    );
  }
);

/**
 * Copy README.md from / to /dist
 */
gulp.task(
  'copy:readme',
  function() {
    return gulp.src(
      [
        path.join(rootFolder, 'README.MD')
      ]
    ).pipe(
      gulp.dest(distFolder)
    );
  }
);

/**
 * 8. Scss
 */

gulp.task(
  'scss',
  function() {
    return gulp.src(
      [
        'src/auto-complete.scss',
        `dist/auto-complete.scss`
      ]
    ).pipe(
      gulp.dest(distFolder)
    )
  }
);

gulp.task(
  'compile',
  function() {
    runSequence(
      'clean',
      'clean:dist',
      'copy:source',
      'inline',
      'typescript:compile',
      'rollup',
      'copy:dist',
      'scss',
      'clean',
      function(err) {
        if (err) {
          console.log('ERROR:', err.message);

          deleteFolders(
            [
              distFolder,
              tmpFolder,
              buildFolder
            ]
          );
        } else {
          console.log('Compilation finished successfully');
        }
      }
    );
  }
);

/**
 * Watch for any change in the /src folder and compile files
 */
gulp.task(
  'watch',
  function() {
    gulp.watch(
      `${srcFolder}/**/*`,
      [
          'compile'
      ]
    );
  }
);

gulp.task(
  'build',
  [
    'clean',
    'compile',
    'scss'
  ]
);

gulp.task(
  'build:watch',
  [
    'build',
    'watch'
  ]
);

gulp.task(
  'default',
  [
    'build:watch'
  ]
);

/**
 * Deletes the specified folder
 */
function deleteFolders(folders) {
  return del(folders);
}
