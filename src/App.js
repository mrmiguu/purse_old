import styles from './styles/App.module.scss'
import React, { lazy, useState, useRef, useEffect } from 'react'
import { border, hexToHSL } from './global'
import pcImgs from './pcImgs'

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

let { entries } = Object

let uid = Date.now() // our fake uid

let walkCy = [1, 2, 1, 0]
let frame = f => ({ transform: `translate(${f * -64}px, 0)` })

export default ({ debug }) => {
  let [[x, y], setXy] = useState([0, 0])
  let [dir, setDir] = useState([1, 1])
  let [step, setStep] = useState(0)
  let [map, setMap] = useState('Tutorial')

  let players = {
    [uid]: {
      skin: 1,
      face: ['green', 0],
      hair: ['short', 'brown', 1],
      x: x,
      y: y,
      dir: dir,
    },
    ['empty']: {
      skin: 1,
      face: [],
      hair: [],
      x: 4,
      y: 4,
      dir: [-1, 1],
    }
  }

  let softRed = '#DE5246'
  let redHSL = hexToHSL(softRed)
  let carHueOff = -55

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
          x={7}
          y={5}
          dir={[1, 1]}
          style={{ zIndex: 5 }}
          debug={false}
        >
          <span
            id={styles.Car}
            style={{
              filter: `hue-rotate(${redHSL.h * 360 + carHueOff}deg)`,
            }}
            role="img"
            aria-labelledby="jsx-a11y/accessible-emoji"
          >
            🚖
          </span>
        </Sprite>

        {
          entries(players).map(([uid, {
            skin,
            face: [eyeColor, eyeType],
            hair: [hairLength, hairColor, hairType],
            x,
            y,
            dir,
          }]) =>
            <Sprite
              key={uid}
              x={x}
              y={y}
              dir={dir}
              style={{ zIndex: y }}
              debug={false}
            >
              <img src={pcImgs.arm.rear[skin]} style={frame(walkCy[step])} />
              <img src={pcImgs.body[skin]} style={frame(walkCy[step])} />
              <img src={pcImgs.head[skin]} style={frame(walkCy[step])} />
              <img src={(pcImgs.face[eyeColor] || {})[eyeType]} style={frame(walkCy[step])} />
              <img src={((pcImgs.hair[hairLength] || {})[hairColor] || {})[hairType]} style={frame(walkCy[step])} />
              <img src={pcImgs.arm.front[skin]} style={frame(walkCy[step])} />
            </Sprite>
          )
        }

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
