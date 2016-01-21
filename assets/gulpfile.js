var gulp = require('gulp'),
	// Common
	notify = require('gulp-notify'),
	// SCSS
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	// App JS
	babel = require('gulp-babel'),
	browserify = require('gulp-browserify'),
	uglify = require('gulp-uglify'),
	// JS Common
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	strip = require('gulp-strip-comments'),
	// Build variables
	devBuild = true; //process.argv.indexOf('dev') >= 0;

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
	var scripts;
	if(!devBuild)
		// Minified production libraries
		scripts = [
			'bower_components/react/react.min.js',
			'bower_components/react/react-dom.min.js',
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/tether/dist/js/tether.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
			'bower_components/openpgp/dist/openpgp.min.js',
			'bower_components/sjcl/sjcl.js',
			'bower_components/entropizer/dist/entropizer.min.js',
			'bower_components/js-cookie/src/js.cookie.js',
		];
	else
		// Full development libraries
		scripts = [
			'bower_components/react/react.js',
			'bower_components/react/react-dom.js',
			'bower_components/jquery/dist/jquery.js',
			'bower_components/tether/dist/js/tether.js',
			'bower_components/bootstrap/dist/js/bootstrap.js',
			'bower_components/openpgp/dist/openpgp.js',
			'bower_components/sjcl/sjcl.js',
			'bower_components/entropizer/dist/entropizer.js',
			'bower_components/js-cookie/src/js.cookie.js',
		];

	var stream = gulp.src(scripts)
		.pipe(concat('vendor.min.js', {newLine: '\n'}));

	if(!devBuild)
		stream.pipe(strip());

	stream.pipe(gulp.dest('js'));
});

gulp.task('app_js', function() {
	gulp.src('js/src/app.js')
		.pipe(
			babel({
				presets: ['es2015']
			}).on('error', notify.onError(function(error) {
				return 'Error compiling JS: ' + error.message;
			}))
		)
		.pipe(
			browserify().on('error', notify.onError(function(error) {
				return 'Error compiling JS: ' + error.message;
			}))
		)
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('js'))
		.pipe(notify({
			message: 'App JS compiled!'
		}));
});

gulp.task('default', ['scss', 'vendor_js', 'app_js']);

gulp.task('dev', ['scss', 'vendor_js', 'app_js', 'watch']);

gulp.task('watch', function() {
	gulp.watch('scss/*.scss', ['scss']);
	gulp.watch('bower_components/**.js', ['vendor_js']);
	gulp.watch('js/src/**.js', ['app_js']);
});
