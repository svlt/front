var gulp = require('gulp'),
	// Common
	notify = require('gulp-notify'),

	// SCSS
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),

	// App JS
	browserify = require('gulp-browserify'),
	uglify = require('gulp-uglify'),

	// JS Common
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	strip = require('gulp-strip-comments'),

	// Build variables
	devBuild = process.argv.indexOf('dev') >= 0;

gulp.task('scss', function() {
	gulp.src('scss/style.scss')
		.pipe(sass().on('error', notify.onError(function(error) {
				return 'Error compiling SCSS: ' + error.message;
			})))
		.pipe(autoprefixer())
		.pipe(gulp.dest('css'))
		.pipe(rename({suffix: '.min'}))
		.pipe(minifycss({keepSpecialComments: 0, processImport: false}))
		.pipe(gulp.dest('css'))
		.pipe(notify({
			message: 'SCSS compiled!'
		}));
});

gulp.task('vendor_js', function() {
	gulp.src([
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/tether/dist/js/tether.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
		])
		.pipe(concat('vendor.min.js', {newLine: '\n'}))
		.pipe(gulp.dest('js'));
});

gulp.task('async_js', function() {
	var scripts = [
			'bower_components/openpgp/dist/openpgp.min.js',
			'bower_components/sjcl/sjcl.js',
			'bower_components/js-cookie/src/js.cookie.js',
			'bower_components/zxcvbn/dist/zxcvbn.js',
			'js/src/app_init.js'
		];

	// Add OpenPGP.js web worker to dev builds
	if(devBuild)
		scripts.push('js/src/app_init_dev.js');

	gulp.src(scripts)
		.pipe(concat('async.min.js', {newLine: '\n'}))
		.pipe(gulp.dest('js'));
});

gulp.task('app_js', function() {
	var stream = gulp.src('js/src/app.js')
		.pipe(
			browserify().on('error', notify.onError(function(error) {
				return 'Browserify JS error: ' + error.message;
			}))
		);

	if(!devBuild)
		stream.pipe(uglify());

	stream
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('js'))
		.pipe(notify({
			message: 'App JS compiled!'
		}));
});

gulp.task('default', ['scss', 'vendor_js', 'async_js', 'app_js']);

gulp.task('dev', ['scss', 'vendor_js', 'async_js', 'app_js', 'watch']);

gulp.task('watch', function() {
	gulp.watch('scss/*.scss', ['scss']);
	gulp.watch('bower_components/**.js', ['vendor_js']);
	gulp.watch('js/src/**.js', ['app_js']);
});
