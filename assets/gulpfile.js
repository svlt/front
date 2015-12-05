var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify');

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
	var scripts = [
		'bower_components/jquery/dist/jquery.min.js',
		'bower_components/tether/dist/js/tether.min.js',
		'bower_components/bootstrap/dist/js/bootstrap.min.js',
		'bower_components/openpgp/dist/openpgp.min.js',
		'bower_components/sjcl/sjcl.js',
		'bower_components/entropizer/dist/entropizer.min.js',
	];
	gulp.src(scripts)
		.pipe(concat('vendor.min.js', {newLine: '\n'}))
		.pipe(gulp.dest('js'));
});

gulp.task('app_js', function() {
	gulp.src('js/src/**.js')
		.pipe(concat('app.min.js', {newLine: '\n'}))
		.pipe(uglify().on('error', notify.onError(function(error) {
				return 'Error compiling JS: ' + error.message;
			})))
		.pipe(gulp.dest('js'))
		.pipe(notify({
			message: 'App JS compiled!'
		}));
});

gulp.task('default', ['scss', 'vendor_js', 'app_js', 'watch']);

gulp.task('watch', function() {
	gulp.watch('scss/*.scss', ['scss']);
	gulp.watch('bower_components/**.js', ['vendor_js']);
	gulp.watch('js/src/**.js', ['app_js']);
});
