import React from 'react';
import './css/Info.css';

// This component is entirely HTML and CSS.
export default function Info(props) {
  return (
    <div id='infoDiv'>
      <div id='headerDiv'>
        <h1>The Real Thing is Way More Fun</h1>
        <p>But if you want to use this, here's how.</p>
      </div>
      <hr/>
      <div id='bodyDiv'>
        <b>General Instructions</b>
        <br/>
        You can play three "types" of sounds with this online omnichord.
        <ol>
          <li>
            <i>Chords</i>. You can play chords by using three rows of keys. <i>qwerty...</i> corresponds
            to the top row of buttons, and plays major chords. <i>asdfg...</i> corresponds
            to the middle row of buttons, and plays minor chords. And, as you may
            have guessed, <i>zxcvb... </i> corresponds to the last row of
            buttions, and plays 7th chords. As an example, <i>q</i> plays Eb major, <i>d</i> plays
            F minor, and <i>b</i> plays G7. Clicking the central 27 buttons with
            the mouse doesn't do anything.
          </li>
          <li>
            <i>Harp/Strumplate</i>. You can play harp sounds by using the row of keys <i>1234...-+</i>.
            These sounds will be in the same key as the
            currently playing chord, or the same key as the last played chord if
            memory is off. <i>1</i> plays the lowest note, and <i>+</i> the highest.
          </li>
          <li>
            <i>Rhythm</i>. The rhythm's volume is 0 by default. You can increase the
            volume if you want to hear it; there is no on/off switch. You can
            also adjust the tempo, and choose between 6 different rhythms.
          </li>
        </ol>
        <b>More Instructions, a.k.a what do the other buttons do</b>
        Let's go through the remaining buttons section by section, starting with
        the top left and moving counterclockwise.
        <ul>
          <li>
            The memory button toggles between two modes, which we'll call <i>on</i>
            and <i>off</i>. It is on by default; in this mode, a chord will
            persist even after its corresponding key is released. For example,
          </li>
          <li>yo</li>
          <li>yo</li>
        </ul>
      </div>
    </div>
  );
}
