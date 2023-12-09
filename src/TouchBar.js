import _ from 'lodash';
import React from 'react';
import './css/TouchBar.css';

export default function TouchBar(props) {
  const items = _.rangeRight(12).map(num =>
    <TouchBarItem
      key={num}
      barSelect={props.barSelect}
      barNumber={num}
      activateBar={props.activateBar}
      deactivateBar={props.deactivateBar} />);
  return (<ul id="touchBarUL" className='hideUL'>{items}</ul>);
}

function TouchBarItem(props) {
  let color = '#ffe699';
  if (props.barSelect[props.barNumber]) {
    color = 'red';
  }
  return (<li
    className={props.barNumber === 0 && 'firstBarItem'}
    style={{backgroundColor: color}}
    onMouseEnter={() => props.activateBar(props.barNumber)}
    onMouseLeave={() => props.deactivateBar()}
    />);
}
