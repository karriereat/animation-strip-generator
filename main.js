#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');

const generator = require('./generator');

program
    .arguments('<source> <destination>')
    .description('A tool for creating sprite animations from image sequences.')
    .option('-n, --name <name>', 'specify animation identifier')
    .option('-f, --fps <fps>', 'specify frame rate')
    .action((source, destination) => {
        generator(source, destination, program.name, program.fps).then(
            (success) => console.log(colors.green(success)),
            (error) => console.log(colors.red(error))
        );
    })
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
