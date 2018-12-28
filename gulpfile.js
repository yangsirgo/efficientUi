var gulp = require('gulp');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifycss = require('gulp-clean-css');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer')
var watch = require('gulp-watch');
var header = require('gulp-header');
var pkg = require('./package.json');

var banner = [
	'/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @Version v<%= pkg.version %>',
	' * @Author <%= pkg.author %>',
	' * @Link <%= pkg.homepage %>',
	' * @License <%= pkg.license %>',
	' * @Date <%= new Date() %>',
	' */',
	''
].join('\n');

//编译less并压缩css
gulp.task('lessminifycss', function () {
	return (
		gulp
		.src(['./dist/gdui/src/*.less', './dist/gdui/src/normalize.css', './dist/gdui/src/iconfont/iconfont.css'])
		.pipe(less())
		.pipe(autoprefixer({
            browsers: ['last 2 versions','Firefox >= 50','Chrome >= 49','Explorer >= 10'],
            cascade: true,//是否美化属性值 默认：true
			remove:true //是否去掉不必要的前缀 默认：true 
        }))
		.pipe(concat('gdui.css'))
		//.pipe(gulp.dest('./dist/gdui/css/'))
		.pipe(minifycss())
		.pipe(rename({
				suffix: '.min'
			}))
		.pipe(header(banner, {
				pkg: pkg
			}))
		.pipe(gulp.dest('./dist/gdui/css/')));
});
//编译less
gulp.task('lesstocss', function () {
	return (
		gulp
		.src(['./dist/gdui/src/*.less'])
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(autoprefixer({
            browsers: ['last 2 versions','Firefox >= 50','Chrome >= 49','Explorer >= 10'],
            cascade: true,//是否美化属性值 默认：true
			remove:true //是否去掉不必要的前缀 默认：true 
        }))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(function (file) {
				return file.base;
			})));
});
//压缩js
gulp.task('jsminify', function () {
	return gulp
	.src(['./dist/gdui/js/gdui.min.js'])
	.pipe(uglify({
			mangle: false
		}))
	.pipe(header(banner, {
			pkg: pkg
		}))
	.pipe(gulp.dest('./dist/gdui/js/'));
});

//默认命令
gulp.task('default', [], function () {
	//[]中可以定义先执行的模块
	gulp.start(['lessminifycss', 'jsminify']); //执行相应模块
});
//编译less
gulp.task('less', [], function () {
	//[]中可以定义先执行的模块
	gulp.start(['lesstocss']); //执行相应模块
});
