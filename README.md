ECMAScript Function Generator for node.js
====

This thing generates an array of numbers in waveforms. Written by Karl Westin, now horribly rewritten by mo-g. Though this version is faster!

## Generating Tones:

```javascript
import {FixedPitch, Silence, Tones, Generators, LinearBend} from 'ecma-tonegenerator'

var fixed = new FixedPitch({frequency:Tones["E♭6"],
                            bitDepth: 16,
                            sampleRate: 16000,
                            duration: 1000});
var fixedData = fixed.tone();

var bend = new LinearBend({startFrequency: Tones["B5"],
                           endFrequency: Tones["D6"],
                           bitDepth: 32,
                           sampleRate: 96000,
                           duration: 1000});
var bendData = bend.timedScale();

var silence = new Silence({bitDepth: 16,
                           duration: 1000});
var silenceData = silence.tone();
```

- `frequency` (or startFrequency and endFrequency for bends) frequency in Hz, or pass in a predefined note.
- `sampleRate` defaults to 16000, you do you.
- `bitDepth` defaults to 16, you do you.
- `duration` in milliseconds, defaults to 200.
- `volume` A number between 0 and 1. 1 is max volume, 0 is silence.
- `generator` controls the wave shape. Options are *'triangle', 'square', 'sine', 'saw'*. You can also pass in a custom function.
- `exactDuration` If set, will cut off at the exact duration, otherwise will default to the smallest whole number of oscillations larger than `duration` to avoid clipping.
- `exactTone` Currently, the generator is fast, but approximate. Not yet implemented, but will return a more accurate pitch.

The function will return the smallest Two's Complement Typed Array possible for your bit depth.

The above API is likely to change as this library is further rewritten. Expect changes like `tone(offset = 0)` with class variable `duration` to be replaced with a `FixedPitch.duration(milliseconds, offset = 0)` and a `FixedPitch.count(n-samples, offset = 0)`

The bend class is also very experimental and is barely usable for anything.