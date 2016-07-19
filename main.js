#!/usr/bin/env node
'use strict';

const program = require('commander');
const generator = require('./generator');

program
    .arguments('<source> <destination>')
    .description('A tool for creating sprite animations from image sequences.')
    .option('-n, --name <name>', 'specify animation identifier')
    .option('-f, --fps <fps>', 'specify frame rate')
    .action((source, destination) => {
        generator(source, destination, program.name, program.fps);
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
