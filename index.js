"use strict";
const through   = require('through2')
const fs        = require('fs')
const path      = require('path')
const vinylFile = require('vinyl-file')

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
        let that    = this
        let content = file.contents.toString()
        let match   = content.match(/[^"'\s)]*\.(css|js)(?:'|")/g)

        if (file.isNull() || !match) {
            return cb(null, file)
        }

        let files = match
            .filter(v => !(v.startsWith('http') || v.startsWith('//')))
            .map(v => {
                let filePath = path.join(process.cwd(), rootPath, v)
                filePath     = filePath.substr(filePath, filePath.length - 1)

                if (fs.existsSync(filePath)) {
                    let file  = vinylFile.readSync(filePath)
                    file.base = path.join(process.cwd(), rootPath)

                    return file
                }

            })

        files.forEach((item) => item && that.push(item))
        cb()
    });
};