"use strict";
const through   = require('through2')
const fs        = require('fs')
const path      = require('path')
const vinylFile = require('vinyl-file')

/**
 * 提取文件中引用的文件
 * @param options
 * @param options.base
 * @param [options.exts]
 *
 * @example
 * .pipe(extractPath('./src'))
 * @returns {*}
 */
module.exports = function (options) {
    options = Object.assign({
        exts: ['css', 'js', 'less']
    }, options)

    return through.obj(function (file, enc, cb) {
        let that    = this
        let content = file.contents.toString()
        let reg     = new RegExp('[^"\')]*\.(css|js|less)(?:\'|")', 'g')
        let match   = content.match(reg)

        if (file.isNull() || !match) {
            return cb()
        }

        let files = match
            .filter(v => !(v.startsWith('http') || v.startsWith('//')))
            .map(v => {
                let filePath = path.join(options.base, v)
                filePath     = filePath.substr(filePath, filePath.length - 1)

                if (fs.existsSync(filePath)) {
                    let file  = vinylFile.readSync(filePath)
                    file.base = path.resolve(process.cwd(), options.base)

                    return file
                }

            })

        // console.log(files)
        files.forEach((item) => item && that.push(item))
        cb()
    });
};