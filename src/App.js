import _ from 'lodash';
import React, { Component } from 'react';
import ButtonSpace from './ButtonSpace';
import TouchBar from './TouchBar';
import { Link } from 'react-router-dom';
import { Howl } from 'howler';
import './css/App.css';
import './css/Led.css';

const TOUCH_BAR_LENGTH = 12;

const KnobType = {
  C_VOLUME: 'chord_volume',
  H_VOLUME: 'harp_volume',
  R_VOLUME: 'rhythm_volume',
  R_TEMPO: 'rhythm_tempo',
}

class App extends Component {
  constructor() {
    super();

    // Key events
    window.onkeydown = e => this.handleDown(e);
    window.onkeyup = e => this.handleUp(e);

    // Needed to initialize the sounds
    const keys = 'qwertyuioasdfghjklzxcvbnm,.';
    const chords = ['eb', 'bb', 'f', 'c', 'g', 'd', 'a', 'e', 'b',
      'ebm', 'bbm', 'fm', 'cm', 'gm', 'dm', 'am', 'em', 'bm',
      'eb7', 'bb7', 'f7', 'c7', 'g7', 'd7', 'a7', 'e7', 'b7'];
    const pathToAudio = require.context('./audio', true);
    const rhythmStartVolume = 0;

    // Initialize all the sound stuff
    this.initChords(keys, chords, pathToAudio);
    this.initTouchBar(chords, pathToAudio);
    this.initRhythms(rhythmStartVolume, pathToAudio);

    // Initialize non-state variables
    this.currentChord = undefined;
    this.barAudio = [];
    this.memory = true;
    this.chordVolume = 1.0;
    this.harpVolume = 1.0;
    this.rhythmVolume = rhythmStartVolume;
    this.rhythmTempo = 1.0;
    this.currentRhythm = this.rhythms[0];

    // Only put stuff in the state if it affects rendering.
    this.state = {
      chords: _.zipObject(keys, Array(keys.length).fill(0)),
      barSelect: Array(TOUCH_BAR_LENGTH).fill(0),
    };
  }

  /*** Init functions ***/
  initChords(keys, chords, pathToAudio) {
    // Map from key to chord
    this.keyChordMap = _.zipObject(keys, chords);

    // Map each chord to its corresponding audio file, and add an event listener
    // to each audio object to make it loop.
    this.chordSoundMap = _.zipObject(chords, chords.map(c => {
      const a = new Howl({
        src: pathToAudio(this.chordPath(c)),
        loop: true,
        onfade: function(songid) {
          if (this.volume() === 0) {
            this.stop(songid);
          }
        }
      });
      return a;
    }));
  }

  initTouchBar(chords, pathToAudio) {
    // NOTE: unlike initChords, we have too many sounds to immediately load
    // Looks like
    // {
    //   c: {1: howl, 2: howl...}
    //   g: {1: howl, 2: howl...}
    //   ...
    // }
    this.touchBarMap = _.zipObject(chords, chords.map(c => {
      return _.zipObject(_.range(12), this.notePaths(c).map(p => pathToAudio(p)));
    }));
  }

  initRhythms(startVolume, pathToAudio) {
    // Initialize rhythm array
    const rhythmNames = ['rock', 'waltz', 'slowrock', 'latin', 'foxtrot', 'swing'];
    const rhythmPaths = rhythmNames.map(s => `./rhythm/${s}.ogg`);
    this.rhythms = rhythmPaths.map(p => {
      const a = new Howl({
        src: pathToAudio(p),
        loop: true,
      });
      a.volume(startVolume);
      return a;
    });
    this.rhythms[0].play();
  }

  /*** Random ***/
  // Make background random pastel color
  componentDidMount() {
    const color = ranCol();
    document.getElementById('top').style.backgroundColor = color;
    document.title = 'Online Omnichord';
  }

  // when we switch to the info page, we need to stop all the sounds
  componentWillUnmount() {
    this.handleStopButton();
  }

  /*** Setup functions ***/
  chordPath(chord) {
    return `./${chord}/${chord}-chord.ogg`;
  }

  notePaths(note) {
    return _.range(12).map(num => `./${note}/${note}${num}.ogg`);
  }

  /*** Helper functions ***/
  /* Helper method that determines if a key is a valid chord key (one of 27 chord keys) */
  isValidChordKey(key) {
    return (key in this.keyChordMap);
  }

  /* Helper function that determines if a key is a valid touch bar key */
  isValidTouchKey(key) {
    return (key in _.range(10) || key === '-' || key === '=');
  }

  getNewChords(newKey) {
    // Make new chord array
    const newChords = _.mapValues(this.state.chords, (value, key) => {
      if (key === newKey) {
        return 1;
      } else {
        return 0;
      }
    });
    return newChords;
  }

  getCurrentKey() {
    return _.findKey(this.state.chords, x => x === 1);
  }

  stopChord() {
    // Last boolean: we don't want to double stop when we quickly release a key
    // and press a new one
    if (this.currentChord && this.currentChord.volume() > 0 && this.getCurrentKey()) {
      this.currentChord.fade(this.chordVolume, 0.0, 10);
    }
    this.setState({ chords: this.getNewChords('invalid key')}); // pass in an invalid key to deselect everything
  }

  stopBar() {
    _.forEach(this.barAudio, a => a.stop());
  }

  stopRhythm() {
    if (this.currentRhythm) {
      this.currentRhythm.stop();
    }
  }

  changeParam(param, change, knobType, min=0.0, max=1.0) {
    if (knobType === KnobType.R_TEMPO) {
      min = .5;
      max = 4.0;
    }
    let newParam = param + change;
    newParam = newParam > max ? max : newParam;
    return newParam < min ? min : newParam;
  }

  /*** Handler functions ***/
  handleUp(e) {
    const upPosition = '1234567890-='.split('').indexOf(e.key);
    if (this.isValidChordKey(e.key)) {
      this.handleChordUp(e.key);
    } else if (this.isValidTouchKey(e.key)) {
      this.deactivateNoteVisualState(upPosition)
    }
  }

  /*
   * Delegate functionality to handleChord and handleTouch.
   */
  handleDown(e) {
    if (this.isValidChordKey(e.key)) {
      this.handleChord(e.key);
    } else if (this.isValidTouchKey(e.key)) {
      this.handleTouch(e.key);
    }
    // don't do anything if an invalid key was pressed
  }

  handleChordUp(key) {
    // Last boolean handles case where
    // 1) User plays chord 'g' (WLOG)
    // 2) User, while still playing chord 'g', plays chord 'c'
    // 3) When chord 'c' is played, chord 'g' is stopped. So we don't want to
    //    double stop it here.
    if (!this.memory && this.getCurrentKey() === key) {
      this.stopChord();
    }
  }

  handleChord(newKey) {
    const currentKey = this.getCurrentKey();
    if (currentKey === newKey) {
      return; // If current key is pressed again, don't pause/stop the sound
    }

    // Stop currently playing chord
    this.stopChord();

    // Play new chord
    const newChord = this.keyChordMap[newKey]
    const newAudio = this.chordSoundMap[newChord];

    // Update state and other variables
    this.currentChord = newAudio;
    this.setState({ chords: this.getNewChords(newKey) });

    newAudio.volume(0.01); // start at zero to fade in
    newAudio.play();
    newAudio.fade(0.01, this.chordVolume, 10);
  }

  handleTouchIdx(position) {
    const currentKey = this.getCurrentKey();
    // Touch bar is enabled after first chord press
    if (!currentKey) {
      return;
    }

    // Play new bar sound. We don't need to loop, so just use regular audio
    // const newAudio = new Audio(this.touchBarMap[this.keyChordMap[currentKey]][position]);
    const newAudio = new Howl({
      src: this.touchBarMap[this.keyChordMap[currentKey]][position],
    });
    newAudio.volume(0.05);
    newAudio.play();
    newAudio.fade(0.05, this.harpVolume, 5);

    // Update state and other variables
    this.barAudio.push(newAudio);
    if (this.barAudio.length > TOUCH_BAR_LENGTH * 2) {
      this.barAudio.shift(); // enforce max length
    }
    this.setActiveNoteVisualState(position);
  }

  handleTouch(touchKey) {
    // Get new bar position
    const position = '1234567890-='.split('').indexOf(touchKey);
    this.handleTouchIdx(position);
  }

  setActiveNoteVisualState(index) {
    const newBarSelect = Array(TOUCH_BAR_LENGTH).fill(0);
    newBarSelect[index] = 1;
    this.setState({ barSelect: newBarSelect })
  }

  deactivateNoteVisualState(keyIndex) {
    const currentPosition = this.state.barSelect.indexOf(1);
    // Avoid double stopping.
    if (keyIndex === currentPosition) {
      const newBarSelect = Array(TOUCH_BAR_LENGTH).fill(0);
      this.setState({ barSelect: newBarSelect })
    }
  }

  handleStopButton() {
    this.stopChord();
    this.stopBar();
    this.stopRhythm();
  }

  handleMemoryButton() {
    this.memory = !this.memory;
    if (!this.memory) { // if memory was switched off, stop chord
      this.stopChord();
    }
  }

  // Slightly confusing function name. It's because the actual omnichord has knobs,
  // not p/minus buttons.
  handleKnobChange(param, change, knobType) {
    const newParam = this.changeParam(param, change, knobType);
    switch (knobType) {
      case KnobType.C_VOLUME:
        if (this.currentChord) {
          this.currentChord.volume(newParam);
        }
        this.chordVolume = newParam;
        break;
      case KnobType.R_VOLUME:
        if (this.currentRhythm) {
          this.currentRhythm.volume(newParam);
        }
        this.rhythmVolume = newParam;
        break;
      case KnobType.R_TEMPO:
        if (this.currentRhythm) {
          this.currentRhythm.rate(newParam);
        }
        this.rhythmTempo = newParam;
        break;
      default:
        console.warn('Unhandled case in handleKnobChange()');
    }
    return newParam; // not currently used
  }

  // Note: we don't do live adjustments for harp volume, because the notes
  // are pretty short. Instead, we just set this.harpVolume to zero.
  handleChordVolume(change) {
    this.handleKnobChange(this.chordVolume, change, KnobType.C_VOLUME);
  }

  handleRhythmChange(index) {
    if (index >= 6) {
      return;
    }
    this.stopRhythm(); // stop current rhythm
    const newRhythm = this.rhythms[index];
    newRhythm.volume(this.rhythmVolume);
    newRhythm.play();
    this.currentRhythm = newRhythm;
  }

  handleRhythmVolume(change) {
    this.handleKnobChange(this.rhythmVolume, change, KnobType.R_VOLUME);
  }

  handleRhythmTempo(change) {
    this.handleKnobChange(this.rhythmTempo, change, KnobType.R_TEMPO);
  }

  render() {
    // Constant to cut down on repeated properties
    const rhythmClass = 'leftButton rhythmButton redBg'
    return (
      <div id='top'>
        <div id='parent'>
          <div id='leftSide'>
            <div id='topleft' className='leftComponent'>
              <ul className='hideUL'>
                <li>
                  <button id='memoryButton' className='leftButton' onClick={() => this.handleMemoryButton()}>
                  </button>
                </li>
                <li>
                  <button
                    className='leftButton firstDownButton greyBg'
                    onClick={() => this.harpVolume = this.changeParam(this.harpVolume, -0.1, KnobType.H_VOLUME)}>
                    -
                  </button>
                  <button
                    className='leftButton upButton greyBg'
                    onClick={() => this.harpVolume = this.changeParam(this.harpVolume, 0.1, KnobType.H_VOLUME)}>
                    +
                  </button>
                  <button
                    className='leftButton secondDownButton greyBg'
                    onClick={() => this.handleChordVolume(-0.1)}>
                    -
                  </button>
                  <button
                    className='leftButton upButton greyBg'
                    onClick={() => this.handleChordVolume(0.1)}>
                    +
                  </button>
                </li>
              </ul>
            </div>
            <div id='middleleft' className='leftComponent'>
              <ul className='hideUL'>
                <li>
                  <button id='firstRhythmButton' onClick={() => this.handleRhythmChange(0)} className={rhythmClass}></button>
                  <button onClick={() => this.handleRhythmChange(1)} className={rhythmClass}></button>
                  <button onClick={() => this.handleRhythmChange(2)} className={rhythmClass}></button>
                  <button onClick={() => this.handleRhythmChange(3)} className={rhythmClass}></button>
                  <button onClick={() => this.handleRhythmChange(4)} className={rhythmClass}></button>
                  <button onClick={() => this.handleRhythmChange(5)} className={rhythmClass}></button>
                </li>
                <li>
                  <button onClick={() => this.handleRhythmTempo(-0.1)} className='leftButton firstDownButton greyBg'>-</button>
                  <button onClick={() => this.handleRhythmTempo(0.1)} className='leftButton upButton greyBg'>+</button>
                  <button onClick={() => this.handleRhythmVolume(-0.1)} className='leftButton secondDownButton greyBg'>-</button>
                  <button onClick={() => this.handleRhythmVolume(0.1)} className='leftButton upButton greyBg'>+</button>
                </li>
              </ul>
            </div>
            <div id='bottomleft' className='leftComponent'>
              <div id='led-box'><div id='led-red'></div></div>
            </div>
          </div>
          <div id='oBody'>
            <div id='buttonSpace'>
              <ButtonSpace
                keys={_.keys(this.keyChordMap)}
                chords={this.state.chords}
                chordSelector={this.handleChord.bind(this)}
                chordDeselector={this.handleChordUp.bind(this)} />
            </div>
            <div id='oLogo'></div>
          </div>
          <div id='barContainer'>
            <div id='barSpace' className='clearBg'>
              <TouchBar
                barSelect={this.state.barSelect}
                activateBar={this.handleTouchIdx.bind(this)}
                deactivateBar={this.deactivateNoteVisualState.bind(this)} />
            </div>
            <div className='stopBar clearBg'><button className='stopButton' onClick={() => this.handleStopButton()}></button></div>
          </div>
          <div id='speaker'></div>
          <div id='info'><Link to='/info'>info/instructions</Link></div>
        </div>
      </div>
    );
  }
}

function ranCol() { //function name
  const hue = Math.floor(Math.random() * 360);
  return 'hsl(' + hue + ', 100%, 87.5%)';
}

export default App;
