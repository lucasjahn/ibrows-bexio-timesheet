var gulp = require('gulp'),
    paths = require('./gulp.config.json'),
    plug = require('gulp-load-plugins')(),
    del = require('del'),
    glob = require('glob'),
    log = plug.util.log;

/**
 * List the available gulp tasks
 */
gulp.task('help', plug.taskListing);

/**
 * Compile SASS, auto prefix, minify, move and rename
 * @return {Stream}
 */
gulp.task('css', function () {
    return gulp.src('src/scss/main.scss')
        .pipe(plug.sass({errLogToConsole: true}))
        .pipe(gulp.dest('app/assets/css'))
        .pipe(plug.sourcemaps.init())
        .pipe(plug.cssnano())
        .pipe(plug.sourcemaps.write('.'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/assets/css'));
});


/**
 * Minify and bundle the Vendor CSS
 * @return {Stream}
 */
gulp.task('vendorcss', function() {
    log('Compressing, bundling, copying vendor CSS');

    var vendorFilter = plug.filter(['**/*.css']);

    return gulp.src(paths.vendorcss)
        .pipe(vendorFilter)
        .pipe(plug.concat('vendor.min.css'))
        .pipe(plug.bytediff.start())
        .pipe(plug.cssnano())
        .pipe(plug.bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build + 'assets/css/'));
});


/**
 * Minify and bundle the app's JavaScript
 * @return {Stream}
 */
gulp.task('js', function() {
    log('Bundling, minifying, and copying the app\'s JavaScript');

    var source = [].concat(paths.js, paths.build);
    return gulp
        .src(source)
        //.pipe(plug.sourcemaps.init()) // get screwed up in the file rev process
        .pipe(plug.concat('main.min.js'))
        .pipe(plug.ngAnnotate({
            add: true,
            single_quotes: true
        }))
        .pipe(plug.bytediff.start())
        .pipe(plug.uglify({
            mangle: true
        }))
        .pipe(plug.bytediff.stop(bytediffFormatter))
        //.pipe(plug.sourcemaps.write('./'))
        .pipe(gulp.dest(paths.build + 'assets/js/'));
});


/**
 * Copy the Vendor JavaScript
 * @return {Stream}
 */
gulp.task('vendorjs', function() {
    log('Bundling, minifying, and copying the Vendor JavaScript');

    return gulp.src(paths.vendorjs)
        .pipe(plug.concat('vendor.min.js'))
        .pipe(plug.bytediff.start())
        .pipe(plug.uglify())
        .pipe(plug.bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build + 'assets/js/'));
});


/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', function() {
    var dest = paths.build + 'assets/img';
    log('Compressing, caching, and copying images');
    return gulp
        .src(paths.images)
        .pipe(plug.cache(plug.imagemin({
            optimizationLevel: 3
        })))
        .pipe(gulp.dest(dest));
});


/**
 * JSHIN
 */
gulp.task('hint', function() {
    var dest = paths.js;
    log('Hinting your code');
    return gulp
        .src(dest)
        .pipe(plug.jshint('./.jshintrc'))
        .pipe(plug.jshint.reporter('jshint-stylish'));
});


/**
 * Inject all the files into the new index.html
 * rev, but no map
 * @return {Stream}
 */
gulp.task('rev-and-inject', ['js', 'vendorjs', 'css', 'vendorcss'], function() {
    log('Rev\'ing files and building index.html');

    var minified = paths.build + 'assets/**/*.min.*';
    var index = paths.build + 'index.html';
    var minFilter = plug.filter(['assets/**/*.min.*', '!assets/**/*.map'], {restore: true});
    var indexFilter = plug.filter(['index.html'], {restore: true});

    var stream = gulp
    // Write the revisioned files
        .src([].concat(minified, index)) // add all built min files and index.html
        .pipe(minFilter) // filter the stream to minified css and js
        .pipe(plug.rev()) // create files with rev's
        .pipe(gulp.dest(paths.build)) // write the rev files
        .pipe(minFilter.restore()) // remove filter, back to original stream

        // inject the files into index.html
        .pipe(indexFilter) // filter to index.html
        .pipe(inject('assets/css/main.min.css'))
        .pipe(inject('assets/js/vendor.min.js', 'inject-vendor'))
        .pipe(inject('assets/js/main.min.js'))
        .pipe(gulp.dest(paths.build)) // write the rev files
        .pipe(indexFilter.restore()) // remove filter, back to original stream

        // replace the files referenced in index.html with the rev'd files
        .pipe(plug.revReplace()) // Substitute in new filenames
        .pipe(gulp.dest(paths.build)) // write the index.html file changes
        .pipe(plug.rev.manifest()) // create the manifest (must happen last or we screw up the injection)
        .pipe(gulp.dest(paths.build)); // write the manifest

    function inject(path, name) {
        var pathGlob = paths.build + path;
        var options = {
            ignorePath: paths.build.substring(1),
            read: false
        };
        if (name) {
            options.name = name;
        }
        return plug.inject(gulp.src(pathGlob), options);
    }
});

/**
 * Watch files and build
 */
gulp.task('watch', function() {
    log('Watching all files');

    var css = ['gulpfile.js'].concat(paths.css, paths.vendorcss);
    var images = ['gulpfile.js'].concat(paths.images);
    var js = ['gulpfile.js'].concat(paths.js);

    gulp
        .watch(js, ['js', 'vendorjs'])
        .on('change', logWatch);

    gulp
        .watch(css, ['css'])
        .on('change', logWatch);

    gulp
        .watch(images, ['images'])
        .on('change', logWatch);

    function logWatch(event) {
        log('*** File ' + event.path + ' was ' + event.type + ', running tasks...');
    }
});


/**
 * Build the optimized app
 * @return {Stream}
 */
gulp.task('build', ['rev-and-inject', 'images'], function() {
    log('Building the optimized app');

    return gulp.src('').pipe(plug.notify({
        onLast: true,
        message: 'Deployed code!'
    }));
});


////////////////


/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
    var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
    return data.fileName + ' went from ' +
        (data.startSize / 1000).toFixed(2) + ' kB to ' + (data.endSize / 1000).toFixed(2) + ' kB' +
        ' and is ' + formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted percentage
 */
function formatPercent(num, precision) {
    return (num * 100).toFixed(precision);
}