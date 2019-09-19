import styles from './styles/App.module.scss'
import React, { lazy, useState, useRef, useEffect } from 'react'
import { border, hexToHSL } from './global'

let bodyParts = {
  arm: {
    front: [
      require('./players/arms/front/0.png'),
      require('./players/arms/front/1.png'),
      require('./players/arms/front/2.png'),
      require('./players/arms/front/3.png'),
      require('./players/arms/front/4.png'),
    ],
    rear: [
      require('./players/arms/rear/0.png'),
      require('./players/arms/rear/1.png'),
      require('./players/arms/rear/2.png'),
      require('./players/arms/rear/3.png'),
      require('./players/arms/rear/4.png'),
    ],
  },
  body: [
    require('./players/bodies/0.png'),
    require('./players/bodies/1.png'),
    require('./players/bodies/2.png'),
    require('./players/bodies/3.png'),
    require('./players/bodies/4.png'),
  ],
  face: {
    blue: [
      require('./players/faces/blue/0.png'),
      require('./players/faces/blue/1.png'),
      require('./players/faces/blue/2.png'),
      require('./players/faces/blue/3.png'),
    ],
    brown: [
      require('./players/faces/brown/0.png'),
      require('./players/faces/brown/1.png'),
      require('./players/faces/brown/2.png'),
      require('./players/faces/brown/3.png'),
    ],
    green: [
      require('./players/faces/green/0.png'),
      require('./players/faces/green/1.png'),
      require('./players/faces/green/2.png'),
      require('./players/faces/green/3.png'),
    ],
    red: [
      require('./players/faces/red/0.png'),
      require('./players/faces/red/1.png'),
      require('./players/faces/red/2.png'),
      require('./players/faces/red/3.png'),
    ],
  },
  hair: {
    long: {
      black: [
        require('./players/hair/long/black/0.png'),
        require('./players/hair/long/black/1.png'),
        require('./players/hair/long/black/2.png'),
        require('./players/hair/long/black/3.png'),
      ],
      brown: [
        require('./players/hair/long/brown/0.png'),
        require('./players/hair/long/brown/1.png'),
        require('./players/hair/long/brown/2.png'),
        require('./players/hair/long/brown/3.png'),
      ],
      orange: [
        require('./players/hair/long/orange/0.png'),
        require('./players/hair/long/orange/1.png'),
        require('./players/hair/long/orange/2.png'),
        require('./players/hair/long/orange/3.png'),
      ],
      yellow: [
        require('./players/hair/long/yellow/0.png'),
        require('./players/hair/long/yellow/1.png'),
        require('./players/hair/long/yellow/2.png'),
        require('./players/hair/long/yellow/3.png'),
      ],
    },
    short: {
      black: [
        require('./players/hair/short/black/0.png'),
        require('./players/hair/short/black/1.png'),
        require('./players/hair/short/black/2.png'),
        require('./players/hair/short/black/3.png'),
      ],
      brown: [
        require('./players/hair/short/brown/0.png'),
        require('./players/hair/short/brown/1.png'),
        require('./players/hair/short/brown/2.png'),
        require('./players/hair/short/brown/3.png'),
      ],
      orange: [
        require('./players/hair/short/orange/0.png'),
        require('./players/hair/short/orange/1.png'),
        require('./players/hair/short/orange/2.png'),
        require('./players/hair/short/orange/3.png'),
      ],
      yellow: [
        require('./players/hair/short/yellow/0.png'),
        require('./players/hair/short/yellow/1.png'),
        require('./players/hair/short/yellow/2.png'),
        require('./players/hair/short/yellow/3.png'),
      ],
    },
  },
  head: [
    require('./players/heads/0.png'),
    require('./players/heads/1.png'),
    require('./players/heads/2.png'),
    require('./players/heads/3.png'),
    require('./players/heads/4.png'),
  ],
}

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

let { entries } = Object

let uid = Date.now()

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
          x={4}
          y={4}
          dir={[-1, 1]}
          style={{ zIndex: 4 }}
          debug={false}
        >
          <img src={bodyParts.arm.rear[1]} style={frame(walkCy[0])} />
          <img src={bodyParts.body[1]} style={frame(walkCy[0])} />
          <img src={bodyParts.head[1]} style={frame(walkCy[0])} />
          {/* <img src={bodyParts.face.green[0]} style={frame(walkCy[0])} />
          <img src={bodyParts.hair.short.brown[1]} style={frame(walkCy[0])} /> */}
          <img src={bodyParts.arm.front[1]} style={frame(walkCy[0])} />
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
              <img src={bodyParts.arm.rear[skin]} style={frame(walkCy[step])} />
              <img src={bodyParts.body[skin]} style={frame(walkCy[step])} />
              <img src={bodyParts.head[skin]} style={frame(walkCy[step])} />
              <img src={bodyParts.face[eyeColor][eyeType]} style={frame(walkCy[step])} />
              <img src={bodyParts.hair[hairLength][hairColor][hairType]} style={frame(walkCy[step])} />
              <img src={bodyParts.arm.front[skin]} style={frame(walkCy[step])} />
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
