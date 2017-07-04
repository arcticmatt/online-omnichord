import _ from 'lodash';
import React, { Component } from 'react';
import ButtonSpace from './ButtonSpace';
import TouchBar from './TouchBar';
import './App.css';
import MySong from './audio/lovestory.mp3';
import GChord from './audio/g/g-chord.wav';

const TOUCH_BAR_LENGTH = 12;

class App extends Component {
  constructor() {
    super();

    // Key events
    window.onkeydown = e => this.handleDown(e);

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
      a.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
      }, false);
      return a;
    }));

    // TODO: add other notes
    this.touchBarMap = {
      g: _.zipObject(_.range(12), this.notePaths('g').map(p => pathToAudio(p))),
    };

    this.state = {
      chords: _.zipObject(keys, Array(keys.length).fill(0)),
      barSelect: Array(TOUCH_BAR_LENGTH).fill(0),
      barAudio: [], // tracks last 12 bar audio objects, used for the stop button
    };
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

  /* Helper method that determines if a key is a valid touch bar key */
  isValidTouchKey(key) {
    return (key in _.range(10) || key === '-' || key === '=');
  }

  stopSound(audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  stopChord(currentKey) {
    if (currentKey) {
      const currentChord = this.keyChordMap[currentKey];
      this.stopSound(this.chordSoundMap[currentChord]);
    }
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

  /*** Handler functions ***/
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
    // Get key of chord that is currently playing
    const currentKey = _.findKey(this.state.chords, x => x === 1);
    if (currentKey === newKey) {
      return; // If current key is pressed again, don't pause/stop the sound
    }

    // Stop currently playing chord
    this.stopChord(currentKey);

    // Play new chord
    const newChord = this.keyChordMap[newKey]
    const newAudio = this.chordSoundMap[newChord];
    newAudio.play();

    // Update state
    this.setState({ chords: this.getNewChords(newKey) });
  }

  handleTouch(touchKey) {
    // Get new bar position
    const position = '1234567890-='.split('').indexOf(touchKey);
    const newBarSelect = Array(TOUCH_BAR_LENGTH).fill(0);
    newBarSelect[position] = 1;

    // Play new bar sound
    const newAudio = new Audio(this.touchBarMap.g[position]);
    newAudio.play();

    // Update state
    this.setState({
      barSelect: newBarSelect,
      barAudio: _.slice([newAudio,...this.state.barAudio], 0, TOUCH_BAR_LENGTH * 2),
    })
  }

  handleStopButton() {
    // Stop chord
    const currentKey = _.findKey(this.state.chords, x => x === 1);
    this.stopChord(currentKey);
    this.setState({ chords: this.getNewChords('invalid key')}); // pass in an invalid key to deselect everything

    // Stop bar
    _.forEach(this.state.barAudio, a => a.pause());
  }

  render() {
    return (
      <div className='parent' style={{backgroundColor: 'blue'}}>
        <div className='leftSide'>Yo</div>
        <div className='buttonSpace'>
          <ButtonSpace keys={_.keys(this.keyChordMap)} chords={this.state.chords} />
        </div>
        <div className='barSpace'>
          <TouchBar barSelect={this.state.barSelect} />
        </div>
        <div className='stopBar'>
          <button className='stopButton' onClick={() => this.handleStopButton()}>Stop</button>
        </div>
      </div>
    );
  }
}

export default App;
