const jimp = require('jimp');

const fs = require('fs');
const path = require('path');

const handlebars = require('handlebars');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

module.exports = function (source, _destination, _name, _fps) {
    return new Promise((resolve, reject) => {

        fs.readdir(source || __dirname, (error, _files) => {
            if (error) {
                reject(error);
            }

            // Filter the folder for images and prepend the path to all files.
            let files = _files.filter((file) => {
                return path.extname(file) === '.png' || path.extname(file) === '.jpg' || path.extname(file) === '.gif';
            }).map((file) => {
                return `${source}/${file}`;
            });

            // Sanitize input or add missing options.
            let destination = _destination || __dirname;
            let name = _name || 'animation';
            let fps = parseInt(_fps) || 24;

            // What are our output files called?
            let fileName = name + path.extname(files[0]);
            let filePath = destination + '/' + fileName;

            // Load all images in JavaScript Image Manipulation Program and return a promise for each.
            let promises = files.map((file) => {
                return jimp.read(file);
            });

            // Start image manipulation as soon as all promises are resolved.
            Promise.all(promises).then((images) => {

                // Information needed for various purposes.
                let width = images[0].bitmap.width;
                let height = images[0].bitmap.height;
                let frames = images.length;

                // This is the pixel bucket for our result.
                let bucket = images[0].clone();
                bucket.resize(width * frames, height);

                let strip = new Promise((resolve, reject) => {
                    for (let i = 0; i < images.length; i++) {
                        bucket.blit(images[i], images[i].bitmap.width * i, 0);
                    }

                    bucket.write(filePath, (error) => {
                        if (error) {
                            reject(error);
                        }

                        // Compress the resulting animation.
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
                            resolve(`${filePath} created.`);
                        }).catch((error) => {
                            reject(error);
                        });
                    });
                });

                let styles = new Promise((resolve, reject) => {
                    fs.readFile(`${__dirname}/template.hbs`, 'utf8', (error, data) => {
                        if (error) {
                            reject(error);
                        }

                        let template = handlebars.compile(data);
                        let view = {
                            frameWidth: width,
                            frameHeight: height,
                            frameCount: frames,
                            file: fileName,
                            animationName: name,
                            animationDuration: frames / fps,
                            spriteWidth: width * frames
                        };
                        let html = `${destination}/${name}.html`;

                        fs.writeFile(html, template(view), (error) => {
                            if (error) {
                                reject(error);
                            }
                            resolve(`${html} created.`);
                        });
                    });
                });

                Promise
                    .all([strip, styles])
                    .then(messages => resolve(messages.join('\n')))
                    .catch(errors => reject(errors.join('\n')));

            }).catch((error) => {
                reject(error);
            });

        });
    });
};
