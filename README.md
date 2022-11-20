ECMAScript Function Generator for node.js
====

This thing generates an array of numbers in waveforms. Written by Karl Westin, now horribly rewritten by mo-g. Though this version is faster!

## Usage example:

```javascript
import {FixedPitch, Silence, Tones, Generators, LinearBend} from 'ecma-tonegenerator'

var fixed = new FixedPitch({frequency:1701,
                            volume: 0.4});
var fixedData = fixed.approximate({duration: 3000});

var bend = new LinearBend({startFrequency: Tones["B5"],
                           endFrequency: Tones["D6"],
                           bitDepth: 32,
                           sampleRate: 96000,
                           generator: Generators.square);
var bendData = bend.approximate({duration: 3000});

var silence = new Silence({bitDepth: 16});
var silenceData = silence.accurate({samples: 24000});
```

## Constructor parameters
- `frequency` (or startFrequency and endFrequency for bends) frequency in Hz, or pass in a predefined note.
- `sampleRate` defaults to 16000, you do you.
- `bitDepth` defaults to 16, you do you.
- `volume` A number between 0 and 1. 1 is max volume, 0 is silence.
- `generator` controls the wave shape. Options are *'triangle', 'square', 'sine', 'saw'*. You can also pass in a custom function.

`volume` and `generator` are unsupported on `Silence`.

## Output Functions

There are two rendering functions, `class.accurate()` and `class.approximate()`. `Silence` only supports `accurate()`, `LinearBend` only supports `approximate()` and `FixedPitch` supports both.

The function will return the smallest Two's Complement Typed Array possible for your bit depth.

## Output Function Parameters
- `duration` in milliseconds. This will return the shortest number of complete waveforms equal to or greater than the specified duration, in order to prevent clipping.
- `samples` will provide the exact number of samples requested, regardless of whether it's the middle of a wave or not.
- `offset` offsets the wave by the specified number of samples. This will typically cause clipping.

Only one size parameter (`duration` or `samples`) may be specified at once.

## Known Issues
- The `LinearBend` class is very experimental and is barely usable for anything.
- the `toString()` override is not supported on all versions of nodejs.