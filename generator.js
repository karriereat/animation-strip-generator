const jimp = require('jimp');

const fs = require('fs');
const path = require('path');

const colors = require('colors');

const handlebars = require('handlebars');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

module.exports = function (source, _destination, _name, _fps, callback) {
    fs.readdir(source, (err, _files) => {
        if (err) throw err;

        let files = _files.filter((file) => {
            return path.extname(file) === '.png' || path.extname(file) === '.jpg' || path.extname(file) === '.gif';
        }).map((file) => {
            return `${source}/${file}`;
        });
        console.log(colors.gray(files.join('\n')));

        let destination = _destination || __dirname;
        let name = _name || 'animation';
        let fps = parseInt(_fps) || 24;


        let promises = files.map((file) => {
            return jimp.read(file);
        });


        let fileName = name + path.extname(files[0]);
        let filePath = destination + '/' + fileName;

        Promise.all(promises).then(function (images) {

            let bucket = images[0].clone();
            bucket.resize(bucket.bitmap.width * images.length, bucket.bitmap.height);
            for (let i = 0; i < images.length; i++) {
                bucket.blit(images[i], images[i].bitmap.width * i, 0);
            }


            bucket.write(filePath, (err) => {
                if (err) throw err;

                imagemin([filePath], destination, {
                    plugins: [
                        imageminMozjpeg({
                            quality: 75
                        }),
                        imageminPngquant({
                            quality: '50-75'
                        })
                    ]
                }).then(() => {
                    console.log(colors.green(`${filePath} created.`));
                    callback();
                });

            });

        }).catch(function (err) {
            console.log(err);
        });


        jimp.read(files[0]).then(function (image) {
            let width = image.bitmap.width;
            let height = image.bitmap.height;

            // @todo promise errors?

            fs.readFile(`${__dirname}/template.hbs`, 'utf8', (err, data) => {
                if (err) throw err;

                let template = handlebars.compile(data);
                let view = {
                    frameWidth: width,
                    frameHeight: height,
                    frameCount: files.length,
                    file: fileName,
                    animationName: name,
                    animationDuration: files.length / fps,
                    spriteWidth: width * files.length
                };
                let html = `${destination}/${name}.html`;

                fs.writeFile(html, template(view), (err) => {
                    if (err) throw err;

                    console.log(colors.green(`${html} created.`));

                });
            });

        });
    });
};

