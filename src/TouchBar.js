import _ from 'lodash';
import React from 'react';
import './css/TouchBar.css';

 const harpKeys = '1234567890-='; // keyboard config taken over from the App.js. See ' const position '.  Must be an easier way to take it over..

export default function TouchBar(props) { 
  const items = _.rangeRight(12).map(num =>
    <TouchBarItem key={num} barSelect={props.barSelect} barNumber={num} />);
  return (
  <ul id="touchBarUL" className='hideUL'>
  {items}
     <input orient='vertical' type='range' id='iRangeTouchBar' name='iRangeTouchBar' min='0.1' max='2.0'  step='0.1' defaultValue ='1.0' />
  </ul>
  );
}

function simulatedKeyboardPress(  e)
{

  //	document.getElementsByClassName("stopButton")[0].click(); 
	console.log(harpKeys[parseInt(e.target.id.toString().replace("bar_","").trim())]);
	var keyToPlay=harpKeys[parseInt(e.target.id.toString().replace("bar_","").trim())];
  window.dispatchEvent(new KeyboardEvent('keydown',{'key':keyToPlay}));
 setTimeout(function(){  window.dispatchEvent(new KeyboardEvent('keyup',{'key':keyToPlay}));}, 100);

 
}
function TouchBarItem(props) {
  let color = '#ffe699';
  if (props.barSelect[props.barNumber]) {
    color = 'red';
  }

  if (props.barNumber === 0) {
    return <li id={"bar_" +props.barNumber.toString()} className='firstBarItem' style={{backgroundColor: color}}   onClick={(e) => simulatedKeyboardPress( e)}></li>;
  } else {
    return <li id={"bar_" +props.barNumber.toString()} style={{backgroundColor: color}}  onClick={(e) => simulatedKeyboardPress( e)}></li>;
  }
}


