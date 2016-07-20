const test = require('tape');

const fs = require('fs');
const generator = require('../generator');

test('generator.js', (t) => {
    t.plan(2);
    generator('test/animation', 'test/output', 'bell', 30).then(() => {
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

test('What if the source directory is unavailable?', (t) => {
    t.plan(3);
    generator().then(null, message => t.ok(message.length > 42));
    generator('').then(null, message => t.ok(message.length > 42));
    generator('yolo').then(null, message => t.ok(message.length > 42));
});

test('mkdir -p', (t) => {
    t.plan(2);
    generator('test/animation', 'test/output/directory').then(() => {
        t.ok(fs.readFileSync('test/output/directory/animation.html'));
        t.ok(fs.readFileSync('test/output/directory/animation.png'));
    });
});
