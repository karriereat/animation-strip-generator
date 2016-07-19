# karriere.at Animation Strip Generator

A tool for creating sprite animations from image sequences.

## Installation

```sh
git clone https://github.com/karriereat/animation-strip-generator
npm install
npm link
```

The tool has not yet been published to npm and is still under development, so you can either link the binary via `npm link` or directly execute the `main.js` file from this repository.

## Usage

```sh
animation-strip-generator test/input test/output --name bell --fps 30
```

The above command will read the image sequence from `test/input` and create a strip at `test/input/bell.png`. The strip is then pushed through [pngquant](https://pngquant.org/) for great compression. You also get the necessary CSS styles for the sprite animation.

![Strip](https://github.com/karriereat/animation-strip-generator/blob/master/test/output/bell.png)

```css
.animation {
    width: 109px;
    height: 75px;
    background: url(bell.png) left center;
    animation: play 1.4666666666666666s steps(44) infinite;
}
@keyframes play {
    100% { background-position: -4796px; }
}
```

![karriere.at](http://kcdn.at/company/136/489020/logo-karriere-at-gmbh.companybig.gif)
