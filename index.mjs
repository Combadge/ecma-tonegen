/*
 * ecma-tonegenerator, an audio function generator for NodeJS.
 * Copyright (C) 2013-2022 Karl Westin
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const Tones = {
    "C0": 16.35, "D♭0": 17.32, "D0": 18.35, "E♭0": 19.45, "E0": 20.60,
    "F0": 21.83, "G♭0": 23.12, "G0": 24.50, "A♭0": 25.96, "A0": 27.50,
    "B♭0": 29.14, "B0": 30.87, "C1": 32.70, "D♭1": 34.65, "D1": 36.71,
    "E♭1": 38.89, "E1": 41.20, "F1": 43.65, "G♭1": 46.25, "G1": 49.00,
    "A♭1": 51.91, "A1": 55.00, "B♭1": 58.27, "B1": 61.74, "C2": 65.41,
    "D♭2": 69.30, "D2": 73.42, "E♭2": 77.78, "E2": 82.41, "F2": 87.31,
    "G♭2": 92.50, "G2": 98.00, "A♭2": 103.83, "A2": 110.00, "B♭2": 116.54,
    "B2": 123.47, "C3": 130.81, "D♭3": 138.59, "D3": 146.83, "E♭3": 155.56,
    "E3": 164.81, "F3": 174.61, "G♭3": 185.00, "G3": 196.00, "A♭3": 207.65,
    "A3": 220.00, "B♭3": 233.08, "B3": 246.94, "C4": 261.63, "D♭4": 277.18,
    "D4": 293.66, "E♭4": 311.13, "E4": 329.63, "F4": 349.23, "G♭4": 369.99,
    "G4": 392.00, "A♭4": 415.30, "A4": 440.00, "B♭4": 466.16, "B4": 493.88,
    "C5": 523.25, "D♭5": 554.37, "D5": 587.33, "E♭5": 622.25, "E5": 659.25,
    "F5": 698.46, "G♭5": 739.99, "G5": 783.99, "A♭5": 830.61, "A5": 880.00,
    "B♭5": 932.33, "B5": 987.77, "C6": 1046.5, "D♭6": 1108.73, "D6": 1174.66,
    "E♭6": 1244.51, "E6": 1318.51, "F6": 1396.91, "G♭6": 1479.98,
    "G6": 1567.98, "A♭6": 1661.22, "A6": 1760.00, "B♭6": 1864.66,
    "B6": 1975.53, "C7": 2093.00, "D♭7": 2217.46, "D7": 2349.32,
    "E♭7": 2489.02, "E7": 2637.02, "F7": 2793.83, "G♭7": 2959.96,
    "G7": 3135.96, "A♭7": 3322.44, "A7": 3520.00, "B♭7": 3729.31,
    "B7": 3951.07, "C8": 4186.01, "D♭8": 4434.92, "D8": 4698.63,
    "E♭8": 4978.03, "E8": 5274.04, "F8": 5587.65, "G♭8": 5919.91,
    "G8": 6271.93, "A♭8": 6644.88, "A8": 7040, "B♭8": 7458.62,
    "B8": 7902.13
};

const Generators = {
    sine: function Sine (position, oscillationLength, volume) {
        return volume * Math.sin((position / oscillationLength) * Math.PI * 2);
    },
    triangle: function Triangle (position, oscillationLength, volume) {
        var halfWave = oscillationLength / 2;
        var level;
        if (position < halfWave) {
            level = (volume * 2) * (position / halfWave) - volume;
        } else {
            position = position - halfWave;
            level = -(volume * 2) * (position / halfWave) + volume;
        }
        return level;
    },
    saw: function Saw (position, oscillationLength, volume) {
        return (volume * 2) * (position / oscillationLength) - volume;
    },
    square: function Square (position, oscillationLength, volume) {
        if(position > oscillationLength / 2) {
            return volume;
        }
        return -volume;
    }
};


/**
 * Can pass either an array of indices or an integer length.
 */
function sizedArray (indices, depth) {
    switch (true) {
            case (depth <= 8):
                return new Int8Array(indices)
            case (depth <= 16):
                return new Int16Array(indices);
            case (depth <= 32):
                return new Int32Array(indices);
            case (depth <= 64):
                return new BigInt64Array(indices);
            default:
                throw `Bit depth ${depth} is greater than 64 bits.`;
    }
}


/**
 * We'll do duration in milliseconds and volume as a fraction of 1.
 * 
 */
class FixedPitch {
    constructor ({frequency = Tones["E♭6"],
                 sampleRate = 16000,
                 bitDepth = 16,
                 duration = 200,
                 volume = 1,
                 generator = Generators.sine,
                 exactDuration = false,
                 exactTone = false} = {}) {

        this.frequency = frequency;
        this.sampleRate = sampleRate;
        this.bitDepth = bitDepth;
        this.duration = duration;
        this._volume = Math.min(Math.max(volume, 0), 1);
        this.generator = generator;
        this.exactDuration = exactDuration;
        this.exactTone = exactTone;

        this.oscillationLength = sampleRate / frequency;
        this.targetSampleCount = Math.floor(this.duration / 1000 * this.sampleRate);
    }

    toString () {
        return `A waveform containing ${this.duration}ms of ${this.generator.name} of frequency ${this.frequency}Hz, at ${this.bitDepth}/${this.sampleRate/1000}KHz`;
    }

    get volume () {
        var depthMax = Math.pow(2,this.bitDepth)/2;
        return depthMax * this._volume;
    }

    tone (offset = 0) {
        if (this.exactTone) {
            var tone = this.preciseTone(offset);
        } else {
            var tone = this.approxTone(offset);
        }

        if (this.exactDuration) {
            return sizedArray(tone.slice(0, this.targetSampleCount), this.bitDepth);
        }

        return sizedArray(tone, this.bitDepth);
    }

    /**
     * Does not correct for the rounding error in oscillation().
     * 
     * Faster, but frequency will be slightly off.
     */
    approxTone(offset = 0) {
        var oscillation = this.oscillation(offset);
        if (oscillation.length > 1000) {
            var appender = function () {oscillation.forEach(function (sample) {rawWaveForm.push(sample)})};
        } else {
            var appender = function () {rawWaveForm.push(...oscillation)};
        }

        var rawWaveForm = [];
        while (rawWaveForm.length < this.targetSampleCount) {
            appender();
        }

        return rawWaveForm;
    }

    /**
     * WIP.
     */
    preciseTone(offset = 0) {
        throw "Sorry, Precise tone generator not yet implemented.";
    }

    /**
     * Generate a single oscillation at the desired sample rate, bit depth and frequency
     */
    oscillation(offset = 0) {
        var approxOscillationLength = Math.floor(this.oscillationLength);
        var volume = this.volume;

        var indices = [];
        for (var index = offset; indices.length < approxOscillationLength; index++) {
            if (index > approxOscillationLength ) {
                index = 0;
            }
            indices.push(index);
        }
        return indices.map(index => Math.round(this.generator(index, approxOscillationLength, volume)));
    }
}

/**
 * Move between two arbitrary frequencies.
 */
class LinearBend {
    constructor ({startFrequency = Tones["B5"],
                  endFrequency = Tones["D6"],
                  sampleRate = 16000,
                  bitDepth = 16,
                  duration = 200,
                  volume = 1,
                  generator = Generators.sine,
                  exactDuration = false,
                  exactTone = false} = {}) {

        this.startFrequency = startFrequency;
        this.endFrequency = endFrequency;
        this.sampleRate = sampleRate;
        this.bitDepth = bitDepth;
        this.duration = duration;
        this._volume = Math.min(Math.max(volume, 0), 1);
        this.generator = generator;
        this.exactDuration = exactDuration;
        this.exactTone = exactTone;
        this.targetSampleCount = Math.floor(this.duration / 1000 * this.sampleRate);
    }

    toString () {
        return `A waveform containing ${this.duration}ms of ${this.generator.name} bending from ${this.startFrequency}Hz to ${this.endFrequency}Hz, at ${this.bitDepth}/${this.sampleRate/1000}KHz`;
    }

    get volume () {
        var depthMax = Math.pow(2,this.bitDepth)/2;
        return depthMax * this._volume;
    }

    /**
     * Cheap function to make a bend between notes, but currently very unsmooth at low samplerate and duration is ignored
     * Sample rate issue is artifact of lazy approximaton in oscillation
     */
    fastScale () {
        var basicScale = [];

        if (this.startFrequency < this.endFrequency) {
            for (var frequency = this.startFrequency; frequency < this.endFrequency; frequency++ ) {
                var wavelength = this.oscillation(frequency);
                wavelength.forEach(function (sample) {basicScale.push(sample)});
            }
        } else {
            for (var frequency = this.startFrequency; frequency > this.endFrequency; frequency-- ) {
                var wavelength = this.oscillation(frequency);
                wavelength.forEach(function (sample) {basicScale.push(sample)});
            }
        }
        
        return sizedArray(basicScale, this.bitDepth)
    }

    timedScale () {
        var oscillations = [];
        var samples = [];

        if (this.startFrequency < this.endFrequency) {
            for (var frequency = this.startFrequency; frequency < this.endFrequency; frequency++ ) {
                var wavelength = this.oscillation(frequency);
                oscillations.push(wavelength);
                wavelength.forEach(function (sample) {samples.push(sample)});
            }
        } else {
            for (var frequency = this.startFrequency; frequency > this.endFrequency; frequency-- ) {
                var wavelength = this.oscillation(frequency);
                oscillations.push(wavelength);
                wavelength.forEach(function (sample) {samples.push(sample)});
            }
        }
        var count = Math.ceil(this.targetSampleCount/samples.length)

        var timedSamples = [];
        oscillations.forEach(function (oscillation) {
            var counter = 0;
            while (counter < count) {
                oscillation.forEach(function (sample) {timedSamples.push(sample)});
                counter++
            }
        });
        
        return sizedArray(timedSamples, this.bitDepth)
    }

    /**
     * Generate a single oscillation at the desired sample rate, bit depth and frequency
     */
    oscillation(frequency) {
        var approxOscillationLength = Math.floor(this.sampleRate / frequency);
        var volume = this.volume;
        var indices = [];
        for (var index = 0; indices.length < approxOscillationLength; index ++) {
            indices.push(index);
        }
        return indices.map(index => Math.round(this.generator(index, approxOscillationLength, volume)));
    }

}

/**
 * A specific case to generate a period of silence.
 */
class Silence {
    constructor ({sampleRate = 16000,
                  bitDepth = 16,
                  duration = 200} = {}) {
        this.sampleRate = sampleRate;
        this.bitDepth = bitDepth;
        this.duration = duration;
    }

    /**
     * We keep offset for consistency of API, but it does nothing.
     */
    tone (offset = 0) {
        var targetSampleCount = Math.floor(this.duration / 1000 * this.sampleRate);
        return sizedArray(targetSampleCount,this.bitDepth);
    }

    approxTone = this.tone;
    preciseTone = this.tone;

    toString () {
        return `A waveform containing ${this.duration}ms of silence at ${this.bitDepth}/${this.sampleRate/1000}KHz`;
    }
}

export { Tones, Generators, FixedPitch, LinearBend, Silence };
