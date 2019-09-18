import styles from './styles/App.module.scss'
import React, { lazy, useState, useRef, useEffect } from 'react'
import { border, hexToHSL } from './global'

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
let frame = f => ({ transform: `translate(${f * -64}px, 0)` })

export default ({ debug }) => {
  let [[x, y], setXy] = useState([0, 0])
  let [dir, setDir] = useState([1, 1])
  let [step, setStep] = useState(0)
  let [map, setMap] = useState('Tutorial')

  // let softRed = '#DE5246'
  // let redHSL = hexToHSL(softRed)
  // let carHueOff = -55

  let rafRef = useRef()
  let tmRef = useRef()
  let velRef = useRef([0, 0])
  useEffect(
    () => {
      let step = tm => {
        let dTm = tm - tmRef.current

        if (dTm < 250) {
          rafRef.current = window.requestAnimationFrame(step)
          return
        }

        let [vx, vy] = velRef.current
        setXy(([x, y]) => [x + vx, y + vy])
        setDir(dir => [vx || dir[0], vy || dir[1]])
        setStep(f => (f + 1) % walkCy.length)
        velRef.current = [0, 0]

        rafRef.current = window.requestAnimationFrame(step)
        tmRef.current = tm
      }

      rafRef.current = window.requestAnimationFrame(step)
      return () => window.cancelAnimationFrame(rafRef.current)
    },
    []
  )

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
          debug={false}
        >
          {/* <span
            id={styles.Car}
            style={{
              filter: `hue-rotate(${redHSL.h * 360 + carHueOff}deg)`,
            }}
            role="img"
            aria-labelledby="jsx-a11y/accessible-emoji"
          >
            🚖
          </span> */}

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
        let [, vy] = velRef.current
        velRef.current = [-1, vy]
      }}
      onRight={() => {
        let [, vy] = velRef.current
        velRef.current = [1, vy]
      }}
      onUp={() => {
        let [vx] = velRef.current
        velRef.current = [vx, -1]
      }}
      onDown={() => {
        let [vx] = velRef.current
        velRef.current = [vx, 1]
      }}
      debug={false}
    />
  </>
}
