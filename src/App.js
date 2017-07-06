import _ from 'lodash';
import React, { Component } from 'react';
import ButtonSpace from './ButtonSpace';
import TouchBar from './TouchBar';
import './App.css';

const TOUCH_BAR_LENGTH = 12;

// TODO: use mp3s instead of wavs
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

    // TODO: add other notes
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

    this.state = {
      chords: _.zipObject(keys, Array(keys.length).fill(0)),
      currentChord: undefined,
      barSelect: Array(TOUCH_BAR_LENGTH).fill(0),
      barAudio: [], // tracks last 12 bar audio objects, used for the stop button
      memory: true,
      chordVolume: 1.0,
      harpVolume: 1.0,
      rhythmVolume: rhythmStartVolume,
      rhythmTempo: 1.0,
      currentRhythm: this.rhythms[0], // Start with rock rhythm
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
    if (this.state.currentChord) {
      this.stopSound(this.state.currentChord);
    }
    this.setState({ chords: this.getNewChords('invalid key')}); // pass in an invalid key to deselect everything
  }

  stopBar() {
    _.forEach(this.state.barAudio, a => a.pause());
  }

  stopRhythm() {
    if (this.state.currentRhythm) {
      this.stopSound(this.state.currentRhythm);
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
    if (this.isValidChordKey(e.key) && !this.state.memory && this.getCurrentKey() === e.key) {
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
    newAudio.volume = this.state.chordVolume;
    newAudio.play();

    // Update state
    this.setState({ chords: this.getNewChords(newKey), currentChord: newAudio });
  }

  handleTouch(touchKey) {
    // Get new bar position
    const position = '1234567890-='.split('').indexOf(touchKey);
    const newBarSelect = Array(TOUCH_BAR_LENGTH).fill(0);
    newBarSelect[position] = 1;

    // Play new bar sound
    const newAudio = new Audio(this.touchBarMap.g[position]);
    newAudio.volume = this.state.harpVolume;
    newAudio.play();

    // Update state
    this.setState({
      barSelect: newBarSelect,
      barAudio: _.slice([newAudio,...this.state.barAudio], 0, TOUCH_BAR_LENGTH * 2),
    })
  }

  handleStopButton() {
    this.stopChord();
    this.stopBar();
    this.stopRhythm();
  }

  handleMemoryButton() {
    const currentMemory = this.state.memory;
    this.setState({ memory: !currentMemory});
    if (currentMemory) {
      this.stopChord();
    }
  }

  // Note: we don't do live adjustments for harp volume, because the notes
  handleChordVolume(change) {
    const newVolume = this.changeVolume(this.state.chordVolume, change);
    let newChord = {};
    if (this.state.currentChord) {
      newChord = this.state.currentChord;
      newChord.volume = newVolume;
    }
    this.setState({ chordVolume: newVolume, currentChord: newChord })
  }

  handleRhythmChange(index) {
    if (index >= 6) {
      return;
    }
    this.stopRhythm(); // stop current rhythm
    const newRhythm = this.rhythms[index];
    newRhythm.volume = this.state.rhythmVolume;
    newRhythm.play();
    this.setState({ currentRhythm: newRhythm });
  }

  // TODO: cut down on duplicate code
  handleRhythmVolume(change) {
    const newVolume = this.changeVolume(this.state.rhythmVolume, change);
    let newRhythm  = {};
    if (this.state.currentRhythm) {
      newRhythm = this.state.currentRhythm;
      newRhythm.volume = newVolume;
    }
    this.setState({ rhythmVolume: newVolume, currentRhythm: newRhythm })
  }

  handleRhythmTempo(change) {
    const newTempo = this.changeTempo(this.state.rhythmTempo, change);
    let newRhythm  = {};
    if (this.state.currentRhythm) {
      newRhythm = this.state.currentRhythm;
      newRhythm.playbackRate = newTempo;
    }
    this.setState({ rhythmTempo: newTempo , currentRhythm: newRhythm })
  }

  render() {
    return (
      <div id='top'>
        <div id='parent'>
          <div className='leftSide'>
            <div id='topleft'>
              <ul>
                <li>
                  <button className='leftButton' id='memoryButton' onClick={() => this.handleMemoryButton()}>
                  </button>
                </li>
                <li>
                  <button
                    className='leftButton firstDownButton'
                    onClick={() => this.setState({ harpVolume: this.changeVolume(this.state.harpVolume, -0.1)})}>
                    -
                  </button>
                  <button
                    className='leftButton upButton'
                    onClick={() => this.setState({ harpVolume: this.changeVolume(this.state.harpVolume, 0.1)})}>
                    +
                  </button>
                  <button
                    className='leftButton secondDownButton'
                    onClick={() => this.handleChordVolume(-0.1)}>
                    -
                  </button>
                  <button
                    className='leftButton upButton'
                    onClick={() => this.handleChordVolume(0.1)}>
                    +
                  </button>
                </li>
              </ul>
            </div>
            <div id='middleleft'>
              <ul>
                <li>
                  <button
                    id='firstRhythmButton'
                    onClick={() => this.handleRhythmChange(0)}
                  className='leftButton rhythmButton'>
                  </button>
                  <button
                    onClick={() => this.handleRhythmChange(1)}
                  className='leftButton rhythmButton'>
                  </button>
                  <button
                    onClick={() => this.handleRhythmChange(2)}
                  className='leftButton rhythmButton'>
                  </button>
                  <button
                    onClick={() => this.handleRhythmChange(3)}
                  className='leftButton rhythmButton'>
                  </button>
                  <button
                    onClick={() => this.handleRhythmChange(4)}
                  className='leftButton rhythmButton'>
                  </button>
                  <button
                    onClick={() => this.handleRhythmChange(5)}
                  className='leftButton rhythmButton'>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => this.handleRhythmTempo(-0.1)}
                  className='leftButton firstDownButton'>
                  -</button>
                  <button
                    onClick={() => this.handleRhythmTempo(0.1)}
                  className='leftButton upButton'>
                  +</button>
                  <button
                    onClick={() => this.handleRhythmVolume(-0.1)}
                  className='leftButton secondDownButton'>
                  -</button>
                  <button
                    onClick={() => this.handleRhythmVolume(0.1)}
                  className='leftButton upButton'>
                  +</button>
                </li>
              </ul>
            </div>
            <div id='bottomleft'></div>
          </div>
          <div id='oBody'>
            <div className='buttonSpace'>
              <ButtonSpace keys={_.keys(this.keyChordMap)} chords={this.state.chords} />
            </div>
            <div id='oLogo'></div>
          </div>
          <div id='barContainer'>
            <div className='barSpace'>
              <TouchBar barSelect={this.state.barSelect} />
            </div>
            <div className='stopBar'>
              <button className='stopButton' onClick={() => this.handleStopButton()}></button>
            </div>
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
