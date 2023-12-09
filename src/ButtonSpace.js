import React from 'react';
import './css/ButtonSpace.css';

const NUM_BUTTONS = 9;
const MARGINS = ['15%', '16.5%', '17.5%'];

		    const keysFromAppJs = 'qwertyuioasdfghjklzxcvbnm,.';// keyboard config taken over from the App.js. Must be an easier way to take it over..

export default function ButtonSpace(props) {
  return (
    <ul id='buttonList' className='hideUL'>
    <input type='range' id='iRangeButtonSpace' name='iRangeButtonSpace' min='0.1' max='2.0' step='0.1' defaultValue ='1.0' />
      <div id='buttonDiv'>
        <ul className='hideUL'>
          <li id='dummyLi'></li>
          <ButtonRow keys={props.keys} chords={props.chords} row={0} />
          <ButtonRow keys={props.keys} chords={props.chords} row={1} />
          <ButtonRow keys={props.keys} chords={props.chords} row={2} />
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

  const buttons = keyRow.map(key => <ChordButton key={key} chordKey={key} chords={props.chords} />);
  return <li className='buttonLi' style={{marginLeft: MARGINS[row]}}>{buttons}</li>;
}


var chordId = 0;

function incrementChordId(){
if(chordId == 27) // 27 buttons on the field. Don't exceed number in refresh.
{
	
	chordId=0; 
}
  chordId++;
  return chordId;
}

function simulatedKeyboardPress(  e)
{

  //	document.getElementsByClassName("stopButton")[0].click(); 
	console.log(keysFromAppJs[parseInt(e.target.id.toString().replace("chord_","").trim())-1]);
	var keyToPlay=keysFromAppJs[parseInt(e.target.id.toString().replace("chord_","").trim())-1];
  window.dispatchEvent(new KeyboardEvent('keydown',{'key':keyToPlay}));
   setTimeout(function(){  window.dispatchEvent(new KeyboardEvent('keyup',{'key':keyToPlay}));}, 250);

 
}

function ChordButton(props) {
	

  let color = 'white';
  const chordKey = props.chordKey;
  const chords = props.chords;
  if (chordKey in chords && chords[chordKey]) {
    color = 'yellow';
  }
  
incrementChordId();

  return (
    <button
	id={"chord_" +chordId}
      style={{backgroundColor: color}}
    className='chordButton'
		onClick={(e) => simulatedKeyboardPress( e)}	>	
    </button>
  );
}
