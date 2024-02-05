import React from 'react';
import './css/ButtonSpace.css';

const NUM_BUTTONS = 9;
const MARGINS = ['15%', '16.5%', '17.5%'];

export default function ButtonSpace(props) {
  return (
    <ul id='buttonList' className='hideUL'>
      <div id='buttonDiv'>
        <ul className='hideUL'>
          <li id='dummyLi'></li>
          <ButtonRow keys={props.keys} chords={props.chords} row={0} chordSelector={props.chordSelector} chordDeselector={props.chordDeselector} />
          <ButtonRow keys={props.keys} chords={props.chords} row={1} chordSelector={props.chordSelector} chordDeselector={props.chordDeselector} />
          <ButtonRow keys={props.keys} chords={props.chords} row={2} chordSelector={props.chordSelector} chordDeselector={props.chordDeselector} />
        </ul>
      </div>
    </ul>
  );
}

function ButtonRow(props) {
  const row = props.row; // 0-indexed
  const keys = props.keys;
  const begin = row * NUM_BUTTONS;
  const end = begin + NUM_BUTTONS;
  const keyRow = keys.slice(begin, end);

  const buttons = keyRow.map(key => <ChordButton
      key={key}
      chordKey={key}
      chords={props.chords}
      chordSelector={props.chordSelector}
      chordDeselector={props.chordDeselector} />);
  return <li className='buttonLi' style={{marginLeft: MARGINS[row]}}>{buttons}</li>;
}

function ChordButton(props) {
  let color = 'white';
  const chordKey = props.chordKey;
  const chords = props.chords;
  if (chordKey in chords && chords[chordKey]) {
    color = 'yellow';
  }

  return (
    <button
      style={{backgroundColor: color}}
      onMouseDown={() => props.chordSelector(props.chordKey)}
      onTouchStart={() => props.chordSelector(props.chordKey)}
      onMouseUp={() => props.chordDeselector(props.chordKey)}
      onTouchEnd={() => props.chordDeselector(props.chordKey)}
    className='chordButton'>
    </button>
  );
}
