"use strict";
const through = require('through2');
const gulp    = require('gulp');
const path    = require('path');

/**
 * 提取文件中引用的文件
 * @param rootPath 引用文件的根目录
 *
 * @example
 * .pipe(extractPath('./src'))
 * @returns {*}
 */
module.exports = function (rootPath) {
    return through.obj(function (file, enc, cb) {
        let that = this;

        if (file.isNull()) {
            cb(null, file);
        }

        let content  = file.contents.toString();
        let filesDir = content.match(/[^"'\s)]*\.(css|js)/g)
            .filter(v => {
                return !(v.startsWith('http') || v.startsWith('//'));
            }).map(v => path.join(rootPath, v));


        console.log(filesDir);
        that.push(file);

        gulp.src(filesDir, {read: file, base: rootPath}).pipe(through.obj((file, enc, cb)=> {
            that.push(file);
            cb();
        })).on('finish', cb)
    });
};