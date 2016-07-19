const test = require('tape');

const fs = require('fs');
const generator = require('../generator');

test('generator.js', (t) => {
    t.plan(2);
    generator('test/animation', 'test/output', 'bell', 30, () => {
        t.equal(
            fs.readFileSync('test/output/bell.png').length,
            fs.readFileSync('test/fixtures/bell.png').length,
            '.png files are alright'
        );
        t.equal(
            fs.readFileSync('test/output/bell.html').length,
            fs.readFileSync('test/fixtures/bell.html').length,
            '.html files are alright'
        );
    });
});
