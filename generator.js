const jimp = require('jimp');

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const handlebars = require('handlebars');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

function generator(source, _destination, _name, _fps) {
    return new Promise((resolveGenerator, rejectGenerator) => {
        fs.readdir(source || __dirname, (error, _files) => {
            if (error) {
                rejectGenerator(error.toString());
                return;
            }

            // Filter the folder for images and prepend the path to all files.
            const files = _files.filter(file => {
                const type = path.extname(file);
                return type === '.png' || type === '.jpg' || type === '.gif';
            }).map(file => `${source}/${file}`);

            if (!files.length) {
                rejectGenerator('The specified directory does not contain an image sequence.');
                return;
            }

            // Sanitize input or add missing options.
            const destination = _destination || __dirname;
            const name = _name || 'animation';
            const fps = parseInt(_fps, 10) || 24;

            // What are our output files called?
            const fileName = name + path.extname(files[0]);
            const filePath = `${destination}/${fileName}`;

            // Create some folders...
            mkdirp.sync(destination);

            // Load all images in jimp and return a promise for each.
            const promises = files.map(file => jimp.read(file));

            // Start image manipulation as soon as all promises are resolved.
            Promise.all(promises).then(images => {
                const width = images[0].bitmap.width;
                const height = images[0].bitmap.height;
                const frames = images.length;

                // This is the pixel bucket for our result.
                const bucket = images[0].clone();
                bucket.resize(width * frames, height);

                const strip = new Promise((resolve, reject) => {
                    for (let i = 0; i < images.length; i++) {
                        bucket.blit(images[i], images[i].bitmap.width * i, 0);
                    }

                    bucket.write(filePath, error => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        // Compress the resulting animation.
                        imagemin([filePath], destination, {
                            plugins: [
                                imageminMozjpeg({
                                    quality: 75,
                                }),
                                imageminPngquant({
                                    quality: '50-75',
                                }),
                            ],
                        }).then(
                            () => resolve(`${filePath} created.`),
                            error => reject(error)
                        );
                    });
                });

                const styles = new Promise((resolve, reject) => {
                    fs.readFile(`${__dirname}/template.hbs`, 'utf8', (error, data) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        const template = handlebars.compile(data);
                        const view = {
                            frameWidth: width,
                            frameHeight: height,
                            frameCount: frames,
                            file: fileName,
                            animationName: name,
                            animationDuration: frames / fps,
                            spriteWidth: width * frames,
                        };
                        const html = `${destination}/${name}.html`;

                        fs.writeFile(html, template(view), error => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(`${html} created.`);
                        });
                    });
                });

                // The generator succeeds when both asynchonous tasks are resolved.
                Promise
                    .all([strip, styles])
                    .then(
                        messages => resolveGenerator(messages.join('\n')),
                        messages => rejectGenerator(messages.join('\n'))
                    );
            });
        });
    });
}

module.exports = generator;
