import styles from './styles/App.module.scss'
import React, { lazy, useState } from 'react'
import { border } from './global'

import arm_r_1 from './Players/Arms/Rear/1.png'
import body_1 from './Players/Bodies/1.png'
import head_1 from './Players/Heads/1.png'
import face_g_0 from './Players/Faces/Green/0.png'
import hair_s_b_1 from './Players/Hair/Short/Brown/1.png'
import arm_f_1 from './Players/Arms/Front/1.png'

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

let walkCy = [1, 2, 1, 0]

export default ({ debug }) => {
  let [[x, y], setXy] = useState([0, 0])
  let [dir, setDir] = useState(1)
  let [step, setStep] = useState(0)
  let [map, setMap] = useState('Tutorial')

  let frame = f => ({ transform: `translate(${f * -64}px, 0)` })

  return <>
    <div
      id={styles.App}
      style={{
        ...border(debug),
        transform: `scale(2, 2)`,
      }}
    >
      <Map
        load={map}
        x={x}
        y={y}
        onClick={_ => {
          setMap(m => m === 'Tiny' ? 'Tutorial' : 'Tiny')
        }}
        debug={true}
      >
        <Sprite
          x={x}
          y={y}
          dir={dir}
          onDone={() => console.log('stepped')}
          debug={false}
        >
          <img src={arm_r_1} style={frame(walkCy[step])} />
          <img src={body_1} style={frame(walkCy[step])} />
          <img src={head_1} style={frame(walkCy[step])} />
          <img src={face_g_0} style={frame(walkCy[step])} />
          <img src={hair_s_b_1} style={frame(walkCy[step])} />
          <img src={arm_f_1} style={frame(walkCy[step])} />
        </Sprite>
      </Map>
    </div>

    <Keyboard
      onLeft={() => {
        setXy(([x, y]) => [x - 1, y])
        setDir(-1)
        setStep(f => (f + 1) % walkCy.length)
      }}
      onRight={() => {
        setXy(([x, y]) => [x + 1, y])
        setDir(1)
        setStep(f => (f + 1) % walkCy.length)
      }}
      onUp={() => setXy(([x, y]) => [x, y - 1])}
      onDown={() => setXy(([x, y]) => [x, y + 1])}
      debug={true}
    />
  </>
}
