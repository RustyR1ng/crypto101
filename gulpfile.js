const gulp = require('gulp')
const browserSync = require('browser-sync')
const nodemon = require('gulp-nodemon')

// Sass compilation
// Nodemon task:
// Start nodemon once and execute callback (browser-sync)
gulp.task('nodemon', (cb) => {
    let started = false
    return nodemon({
        script: './app/bin/www'
    }).on('start', () => {
        if (!started) {
            cb()
            started = true
        }
    })
})

// BrowserSync task:
// calls nodemon tasks and pass itself as callback
gulp.task(
    'browser-sync',
    gulp.series('nodemon', () => {
        browserSync.init(null, {
            proxy: 'http://localhost:3000',
            files: ['./app/**/*'],
            port: 5000
        })
    })
)

// Dev Task:
// Parallel execution of browser-sync/nodemon
// and sass watching
gulp.task('default', gulp.parallel('browser-sync'))
