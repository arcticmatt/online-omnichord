import _ from 'lodash';
import React from 'react';
import './css/TouchBar.css';

export default function TouchBar(props) {
  const items = _.rangeRight(12).map(num =>
    <TouchBarItem key={num} barSelect={props.barSelect} barNumber={num} />);
  return (<ul id="touchBarUL" className='hideUL'>{items}</ul>);
}

function TouchBarItem(props) {
  let color = '#ffe699';
  if (props.barSelect[props.barNumber]) {
    color = 'red';
  }

  if (props.barNumber === 0) {
    return <li className='firstBarItem' style={{backgroundColor: color}}></li>;
  } else {
    return <li style={{backgroundColor: color}}></li>;
  }
}
