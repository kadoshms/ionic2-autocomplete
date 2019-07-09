/* eslint-disable */
const gulp = require('gulp');
const path = require('path');
const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript');
const del = require('del');
const inlineResources = require('gulp-inline-source');
const inlineTemplate = require('gulp-inline-ng2-template');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');
const tslint = require('gulp-tslint');

const rootFolder = path.join(__dirname);
const srcFolder = path.join(rootFolder, 'src');
const tmpFolder = path.join(rootFolder, '.tmp');
const buildFolder = path.join(rootFolder, 'build');
const distFolder = path.join(rootFolder, 'dist');

/**
 * 1. Clean
 */

/**
 * Delete /build folder
 */
gulp.task(
  'clean:build',
  () => {
    return del(
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
  async () => {
    // return del(
    //   [
    //     distFolder
    //   ]
    // );
      return;
  }
);

/**
 * Delete /.tmp folder
 */
gulp.task(
  'clean:tmp',
  async function() {
    return del(
      [
        tmpFolder
      ]
    );
  }
);

gulp.task(
  'clean',
  gulp.series(
    'clean:tmp',
    'clean:build'
  )
);

/**
 * 2. Clone the /src folder into /.tmp. If an npm link inside /src has been made,
 *    then it's likely that a node_modules folder exists. Ignore this folder
 *    when copying to /.tmp.
 */
gulp.task(
  'copy:source',
  () => {
    return gulp.src(
      [
        `${srcFolder}/**/*`,
        `!${srcFolder}/node_modules`
      ]
    ).pipe(
      gulp.dest(`${tmpFolder}/`)
    );
  }
);

/**
 * 3. Run linting on source folder
 */
gulp.task(
  'tslint',
  () => {
    return gulp.src(
      `${srcFolder}/**/*.ts`
    ).pipe(
      tslint()
    ).pipe(
      tslint.report()
    );
  }
);

/**
 * 4. Inline template (.html) and style (.css) files into the the component .ts files.
 *    We do this on the /.tmp folder to avoid editing the original /src files
 */
gulp.task(
  'inline-resources',
  async () => {
    return Promise.resolve().then(
      () => inlineResources(tmpFolder)
    );
  }
);

gulp.task(
  'inline-templates',
  () => {
    return gulp.src(
      `${srcFolder}/**/*.ts`
    ).pipe(
      inlineTemplate(
        {
          base: 'src/auto-complete'
        }
      )
    ).pipe(
      gulp.dest(`${tmpFolder}/`)
    );
  }
);

gulp.task(
  'inline',
  gulp.series(
    'inline-resources',
    'inline-templates'
  )
);

/**
 * 5. Run the Angular compiler, ngc, on the /.tmp folder. This will output all
 *    compiled modules to the /build folder.
 */
gulp.task(
  'copy:typescript',
  () => {
    return gulp.src(
      [
        `${tmpFolder}/**/*.ts`,
        `!${tmpFolder}/index.ts`
      ]
    ).pipe(
      gulp.dest(`${buildFolder}/`)
    );
  }
);

gulp.task(
  'typescript:compile',
  gulp.series(
    'copy:typescript',
    () => {
      return gulp.src(
        `${tmpFolder}/index.ts`
      ).pipe(
        sourcemaps.init()
      ).pipe(
        typescript(tscConfig.compilerOptions)
      ).pipe(
        sourcemaps.write('.')
      ).pipe(
        gulp.dest(`${buildFolder}/`)
      );
    }
  )
);

/**
 * 6. Run rollup inside the /build folder to generate our Flat ES module and our UMD module which is
 *    placed into the /dist folder
 */
gulp.task(
  'rollup:fesm',
  () => {
    return rollup.rollup(
      {
        input: `${buildFolder}/index.js`,
        plugins: [
          rollupTypescript()
        ]
      }
    ).then(
      bundle => {
        return bundle.write(
          {
            file: `${distFolder}/index.js`,
            format: 'es',
            sourcemap: true,
            external: [
              '@angular/core',
              '@angular/common'
            ]
          }
        );
      }
    );
  }
);

gulp.task(
  'rollup:umd',
  () => {
    return rollup.rollup(
      {
        input: `${buildFolder}/index.js`,
        plugins: [
          rollupTypescript()
        ]
      }
    ).then(
     bundle => {
       return bundle.write(
         {
           file: `${buildFolder}/index.js`,
           format: 'umd',
           name: 'ionic4-auto-complete',
           sourcemap: true,
           external: [
             '@angular/core',
             '@angular/common'
           ]
         }
       );
      }
    );
  }
);

gulp.task(
  'rollup',
  gulp.series(
    'rollup:fesm',
    'rollup:umd'
  )
);

/**
 * 8. Copy all the files from /build to /dist, except .js files. We ignore all .js from /build
 *    because with don't need individual modules anymore, just the Flat ES module generated
 *    on step 5.
 */
gulp.task(
  'copy:build',
  () => {
    return gulp.src(
      [
        `${buildFolder}/**/*`,
        `!${buildFolder}/**/*.js`
      ]
    ).pipe(
      gulp.dest(`${distFolder}/`)
    );
  }
);

/**
 * Copy assets to /dist
 */
gulp.task(
  'copy:assets',
  () => {
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
  () => {
    return gulp.src(
      [
        `${srcFolder}/package.json`
      ]
    ).pipe(
     gulp.dest(`${distFolder}/`)
    );
  }
);

/**
 * Copy README.md from / to /dist
 */
gulp.task(
  'copy:readme',
  () => {
    return gulp.src(
      [
        path.join(rootFolder, 'README.MD')
      ]
    ).pipe(
      gulp.dest(`${distFolder}/`)
    );
  }
);

gulp.task(
  'copy:dist',
  gulp.series(
    'copy:build',
    'copy:assets',
    'copy:manifest',
    'copy:readme'
  )
);

/**
 * 9. Scss
 */
gulp.task(
  'scss',
  async () => {
    return gulp.src(
      [
        `${srcFolder}/auto-complete.scss`
      ]
    ).pipe(
      gulp.dest(`${distFolder}/`)
    )
  }
);

gulp.task(
  'compile',
  gulp.series(
    'clean',
    'clean:dist',
    'copy:source',
    'tslint',
    'inline',
    'typescript:compile',
    'rollup',
    'copy:dist',
    'scss',
    'clean',
    async (err) => {
      if (err) {
        console.log('ERROR:', err.message);

        return del(
          [
            tmpFolder,
            buildFolder
          ]
        );
      } else {
        console.log('Compilation finished successfully');
      }
    }
  )
);

/**
 * Watch for any change in the /src folder and compile files
 */
gulp.task(
  'watch',
  async () => {
    gulp.watch(
      `${srcFolder}/**/*`,
      gulp.series(
        'compile'
      )
    );
  }
);

gulp.task(
  'build',
  gulp.series(
    'clean',
    'compile',
    'scss'
  )
);

gulp.task(
  'build:watch',
  gulp.series(
    'build',
    'watch'
  )
);

gulp.task(
  'default',
  gulp.series(
    'build:watch'
  )
);
