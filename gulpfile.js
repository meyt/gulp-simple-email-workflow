var gulp = require('gulp')
var del = require('del')
var sass = require('gulp-sass')
var juice = require('gulp-juice')
var data = require('gulp-data')
var nunjucksRender = require('gulp-nunjucks-render')
var autoprefixer = require('gulp-autoprefixer')
var inlinesource = require('gulp-inline-source')
var runSequence = require('run-sequence')

var config = {
  cssDir: './src/css',
  sassDir: './src/scss',
  htmlDir: './src/html',
  outputDir: './output',
  templatesDir: './src/templates',
  imagesDir: './src/images'
}

gulp.task('cleanHTML', function () {
  return del([config.htmlDir])
})

gulp.task('cleanCSS', function () {
  return del([config.cssDir])
})

gulp.task('cleanOutput', function () {
  return del(config.outputDir)
})

gulp.task('compileSASS', function () {
  return gulp.src(config.sassDir + '/*.scss')
  .pipe(sass({errLogToConsole: true}))
  .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
  .pipe(gulp.dest(config.cssDir))
})

gulp.task('compileTemplates', function () {
  return gulp.src(config.templatesDir + '/emails/**/*.+(html|nunjucks|nunjs)')
  .pipe(data(function () {
    return require(config.templatesDir + '/data.js')
  }))
  .pipe(nunjucksRender({
    path: [config.templatesDir]
  }))
  .pipe(gulp.dest(config.htmlDir))
})

gulp.task('buildHTML', function () {
  return gulp.src(config.htmlDir + '/*.html')
  .pipe(inlinesource({
    attribute: 'inline',
    compress: true,
    ignore: [],
    pretty: false,
    swallowErrors: true,
    svgAsImage: true,
    rootpath: config.htmlDir
  }))
  .pipe(juice({
    extraCss: '',
    insertPreservedExtraCss: true,
    applyStyleTags: true,
    removeStyleTags: true,
    preserveMediaQueries: true,
    preserveFontFaces: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
    url: '',
    webResources: {
      relativeTo: config.htmlDir
    }
  }))
  .pipe(gulp.dest(config.outputDir))
})

var build = function () {
  runSequence(
    ['compileSASS', 'compileTemplates', 'cleanOutput'],
    'buildHTML',
    ['cleanHTML', 'cleanCSS']
  )
}

gulp.task('default', function () {
  build()
  gulp.watch(config.sassDir + '/*', build)
  gulp.watch(config.templatesDir + '/*', build)
  gulp.watch(config.imagesDir + '/*', build)
})
