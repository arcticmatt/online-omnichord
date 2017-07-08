import React from 'react';
import { Link } from 'react-router-dom';
import './css/Info.css';

// This component is entirely HTML and CSS.
export default function Info(props) {
  window.onkeydown = undefined; // disable instrument on this page
  window.onkeyup = undefined;
  document.body.margin = 0;
  document.body.padding = 0;
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
            the mouse doesn't do anything.<br/>
            <i>Note</i>: the chord buttons are the only buttons on the omnichord that
            don't respond to mouse clicks. For all other buttons, you should interact
            with the mouse.
          </li>
          <li>
            <i>Harp/Strumplate</i>. You can play harp sounds by using the row of keys <i>1234...-+</i>.
            The currently playing chord, or last played chord if memory is off,
            determines the pitch of the harp sounds. For example, if Eb major
            is the current chord, then the harp sounds will be one of Eb, G,
            and Bb. There are two main styles of playing the strumplate. You can
            either play individual notes (like a piano) or "strum" it by
            sliding your finger over the keys (like a guitar).
          </li>
          <li>
            <i>Rhythm</i>. The rhythm's volume is 0 by default. You can increase the
            volume if you want to hear it; there is no on/off switch. You can
            also adjust the tempo and choose between 6 different rhythms.
          </li>
        </ol>
        <br/>
        <b>More Instructions, a.k.a. what do the other buttons do</b>
        <br/>
        Let's go through the remaining buttons section by section, starting with
        the top left and moving counterclockwise. As stated in the note above,
        all these buttons interact with the mouse.
        <ul>
          <li>
            <i>Memory Button</i>. The memory button toggles between two modes, which we'll call <i>on</i> and
            <i> off</i>. It is on by default; in this mode, a chord will
            persist even after its corresponding key is released. For example,
            if you press the <i>q</i> key, the Eb major chord will continue
            playing even after you release the key. If memory is off,
            a chord will stop as soon as you release its corresponding key.
          </li>
          <li>
            <i>Volume Buttons</i>. These buttons
            toggle the volumes of the three sounds. The harp and chords start
            with their volume maxed out while the rhythm starts
            with its volume at 0.
          </li>
          <li>
            <i>Tempo Buttons</i>. These buttons have the same appearance as the
            volume buttons, and toggle the rhythm's tempo. The tempo starts at
            1. The lowest tempo is half speed, and the highest is quadruple speed.
          </li>
          <li>
            <i>Stop Button</i>. This button is located on the right side of the
            strumplate. It stops all currently playing sounds.
          </li>
        </ul>
        <b>Sounds</b>
        <br/>
        I sampled all the sounds from my OM27. The chords have some high frequencies
        filtered out to cut down on the buzzing (although there's still a bit left).
        You can download the sounds&nbsp;
        <a href='https://drive.google.com/open?id=0B1msnJF9MDkSLXJEcDRjY3lNcTA'>here</a>.
        <br/>
        <br/>
        <b>Supported Browsers</b>
        <ul>
          <li>Chrome</li>
          <li>Firefox</li>
          <li>Definitely not Safari</li>
          <li>???</li>
        </ul>
        <b>Cool Links</b>
        <ul>
          <li><a href='http://www.suzukimusic.co.uk/omnichord/suzuki_omnichord.htm'>Omnichord Heaven</a></li>
          <li><a href='https://www.youtube.com/watch?v=w4h6ESL_B0Q'>gobbinjr - "Firefly" (song that got me into Omnichords!)</a></li>
          <li><a href='https://www.youtube.com/watch?v=6ifyCBx_cRc'>Adventure Time cover</a></li>
          <li><a href='https://www.youtube.com/watch?v=O9dkI0mxk3k'>Strokes cover</a></li>
          <li><a href='https://www.youtube.com/watch?v=odQu6MSawOo'>Guy goes ham on omnichord live</a></li>
        </ul>
      </div>
      <br/>
      <div id='sourceContainer'>
        <hr/>
        <br/>
        <div id='source' className='footer'>
          <a href='https://github.com/arcticmatt/online-omnichord'>source</a>
        </div>
        <div id='back' className='footer'>
          <Link to='/'>back to instrument</Link>
        </div>
      </div>
    </div>
  );
}
