#!/usr/bin/env node
'use strict';

const gm = require('gm');

const fs = require('fs');
const path = require('path');

const colors = require('colors');
const program = require('commander');

const handlebars = require('handlebars');

const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

program
    .arguments('<source> <destination>')
    .description('A tool for creating sprite animations from image sequences.')
    .option('-n, --name <name>', 'specify animation identifier')
    .option('-f, --fps <fps>', 'specify frame rate')
    .action((source, destination) => {
        run(source, destination, program.name, program.fps);
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}

function run(source, _destination, _name, _fps) {
    fs.readdir(source, (err, _files) => {
        if (err) throw err;

        let files = _files.map((file) => `${source}/${file}`);
        console.log(colors.gray(files.join('\n')));

        let destination = _destination || '.';
        let name = _name || 'animation';
        let fps = parseInt(_fps) || 24;

        let image = gm(files.shift());

        files.forEach((file) => {
            image.append(file, true);
        });

        let fileName = name + path.extname(files[0]);
        let filePath = destination + '/' + fileName;

        image.write(filePath, (err) => {
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
            });

        });

        image.size((err, size) => {
            if (err) throw err;

            fs.readFile('./template.hbs', 'utf8', (err, data) => {
                if (err) throw err;

                let template = handlebars.compile(data);
                let view = {
                    frameWidth: size.width,
                    frameHeight: size.height,
                    frameCount: files.length + 1,
                    file: fileName,
                    animationName: name,
                    animationDuration: (files.length + 1) / fps,
                    spriteWidth: size.width * (files.length + 1)
                };
                let html = `${destination}/${name}.html`;

                fs.writeFile(html, template(view), (err) => {
                    if (err) throw err;

                    console.log(colors.green(`${html} created.`));
                });
            });

        });
    });
}
