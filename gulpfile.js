var gulp = require('gulp');
var plumber = require('gulp-plumber');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const wait = require('gulp-wait');
const rename = require('gulp-rename');

gulp.task('scripts', function() {
    return gulp.src(['./js/game-mode.js', './js/main.js'])
        .pipe(concat('main.js'))
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(uglify({
            output: {
                comments: '/^!/'
            }
        }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./js'));
});

gulp.task('styles', function () {
    return gulp.src('./scss/styles.scss')
        .pipe(wait(100))
        .pipe(sass({
            style: 'expanded',
            sourceMap: true,
            sourceMapIncludeSources: true
        }).on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('build', gulp.parallel('styles', 'scripts'));

gulp.task('watch', function() {
    gulp.watch(['./js/game-mode.js', './js/main.js'], gulp.series('scripts'));
    gulp.watch('./scss/**/*.scss', gulp.series('styles'));
});
