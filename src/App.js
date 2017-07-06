import _ from 'lodash';
import React, { Component } from 'react';
import ButtonSpace from './ButtonSpace';
import TouchBar from './TouchBar';
import './css/App.css';
import './css/Led.css';

const TOUCH_BAR_LENGTH = 12;

// TODO: use ogg instead of wav
class App extends Component {
  constructor() {
    super();

    // Key events
    window.onkeydown = e => this.handleDown(e);
    window.onkeyup = e => this.handleUp(e);

    // Arrays to be used for object (map) creation
    const keys = 'qwertyuioasdfghjklzxcvbnm,.';
    const chords = ['eb', 'bb', 'f', 'c', 'g', 'd', 'a', 'e', 'b',
      'ebm', 'bbm', 'fm', 'cm', 'gm', 'dm', 'am', 'em', 'bm',
      'eb7', 'bb7', 'f7', 'c7', 'g7', 'd7', 'a7', 'e7', 'b7'];

    // Map from key to chord
    this.keyChordMap = _.zipObject(keys, chords);

    const pathToAudio = require.context('./audio', true);
    // Map each chord to its corresponding audio file, and add an event listener
    // to each audio object to make it loop.
    // TODO: right now, only the g-chord is supported
    this.chordSoundMap = _.zipObject(chords, chords.map(c => {
      const a = new Audio(pathToAudio(this.chordPath('g'))) // TODO: remove hardcoded g
      return this.loopAudio(a);
    }));

    // TODO: add other notes using zipobject and map
    this.touchBarMap = {
      g: _.zipObject(_.range(12), this.notePaths('g').map(p => pathToAudio(p))),
    };

    // Initialize rhythm array
    // TODO: use different rhythms
    const rhythmStartVolume = 0.0;
    const rhythmNames = ['rock', 'rock', 'rock', 'rock', 'rock', 'rock'];
    const rhythmPaths = rhythmNames.map(s => `./rhythm/${s}.wav`);
    this.rhythms = rhythmPaths.map(p => {
      const a = new Audio(pathToAudio(p));
      a.volume = rhythmStartVolume;
      return this.loopAudio(a);
    });
    this.rhythms[0].play();

    // Some non-state variables
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

  // Make background random pastel color
  componentDidMount() {
    const color = ranCol();
    document.getElementById('top').style.backgroundColor = color;
  }

  /*** Setup functions ***/
  chordPath(chord) {
    return `./${chord}/${chord}-chord.wav`;
  }

  notePaths(note) {
    return _.range(12).map(num => `./${note}/${note}${num}.wav`);
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

  stopSound(a) {
    a.pause();
    a.currentTime = 0;
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
    // Stop chord
    if (this.currentChord) {
      this.stopSound(this.currentChord);
    }
    this.setState({ chords: this.getNewChords('invalid key')}); // pass in an invalid key to deselect everything
  }

  stopBar() {
    _.forEach(this.barAudio, a => a.pause());
  }

  stopRhythm() {
    if (this.currentRhythm) {
      this.stopSound(this.currentRhythm);
    }
    // Don't change the current rhythm
  }

  changeVolume(volume, change) {
    const newVolume = volume + change;
    if (newVolume > 1) {
      return 1;
    }
    if (newVolume < 0) {
      return 0;
    }
    return newVolume;
  }

  changeTempo(tempo, change) {
    const newTempo = tempo + change;
    if (newTempo > 3) {
      return 3;
    }
    if (newTempo < .25) {
      return .25;
    }
    return newTempo;
  }

  loopAudio(a) {
    a.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    return a;
  }

  /*** Handler functions ***/
  handleUp(e) {
    const upPosition = '1234567890-='.split('').indexOf(e.key);
    const currentPosition = this.state.barSelect.indexOf(1);
    // Last boolean handles case where
    // 1) User plays chord 'g' (WLOG)
    // 2) User, while still playing chord 'g', plays chord 'c'
    // 3) When chord 'c' is played, chord 'g' is stopped. So we don't want to
    //    double stop it here.
    if (this.isValidChordKey(e.key) && !this.memory && this.getCurrentKey() === e.key) {
      this.stopChord();
    } else if (this.isValidTouchKey(e.key) && upPosition === currentPosition) { // again, second boolean handles double stopping
      this.setState({
        barSelect: Array(TOUCH_BAR_LENGTH).fill(0),
      });
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
    newAudio.volume = this.chordVolume;
    newAudio.play();

    // Update state and other variables
    this.currentChord = newAudio;
    this.setState({ chords: this.getNewChords(newKey) });
  }

  handleTouch(touchKey) {
    // Get new bar position
    const position = '1234567890-='.split('').indexOf(touchKey);
    const newBarSelect = Array(TOUCH_BAR_LENGTH).fill(0);
    newBarSelect[position] = 1;

    // Play new bar sound
    const newAudio = new Audio(this.touchBarMap.g[position]);
    newAudio.volume = this.harpVolume;
    newAudio.play();

    // Update state and other variables
    this.barAudio.push(newAudio);
    if (this.barAudio.length > TOUCH_BAR_LENGTH * 2) {
      this.barAudio.shift(); // enforce max length
    }
    this.setState({ barSelect: newBarSelect })
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

  // Note: we don't do live adjustments for harp volume, because the notes
  handleChordVolume(change) {
    const newVolume = this.changeVolume(this.chordVolume, change);
    if (this.currentChord) {
      this.currentChord.volume = newVolume; // mutable, but it's not part of state
    }
    this.chordVolume = newVolume;
  }

  handleRhythmChange(index) {
    if (index >= 6) {
      return;
    }
    this.stopRhythm(); // stop current rhythm
    const newRhythm = this.rhythms[index];
    newRhythm.volume = this.rhythmVolume;
    newRhythm.play();
    this.currentRhythm = newRhythm;
  }

  // TODO: cut down on duplicate code
  handleRhythmVolume(change) {
    const newVolume = this.changeVolume(this.rhythmVolume, change);
    if (this.currentRhythm) {
      this.currentRhythm.volume = newVolume;
    }
    this.rhythmVolume = newVolume;
  }

  handleRhythmTempo(change) {
    const newTempo = this.changeTempo(this.rhythmTempo, change);
    let newRhythm  = {};
    if (this.currentRhythm) {
      this.currentRhythm.playbackRate = newTempo;
    }
    this.rhythmTempo = newTempo;
  }

  render() {
    // Some constants to cut down on repeated properties
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
                    onClick={() => this.harpVolume = this.changeVolume(this.harpVolume, -0.1)}>
                    -
                  </button>
                  <button
                    className='leftButton upButton greyBg'
                    onClick={() => this.harpVolume = this.changeVolume(this.harpVolume, 0.1)}>
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
            <div id='buttonSpace'><ButtonSpace keys={_.keys(this.keyChordMap)} chords={this.state.chords} /></div>
            <div id='oLogo'></div>
          </div>
          <div id='barContainer'>
            <div id='barSpace' className='clearBg'><TouchBar barSelect={this.state.barSelect} /></div>
            <div className='stopBar clearBg'><button className='stopButton' onClick={() => this.handleStopButton()}></button></div>
          </div>
          <div id='speaker'></div>
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
