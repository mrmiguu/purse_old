import styles from './styles/App.module.scss'
import React, { lazy, useState, useRef, useEffect } from 'react'
import { border, hexToHSL } from './global'
import pcImgs from './pcImgs'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import Peer from 'peerjs'
import merge from 'deepmerge'

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

let { entries } = Object
let { getUserMedia } = navigator.mediaDevices

let uid = Date.now() // our fake uid

let walkCy = [1, 2, 1, 0]
let frame = f => ({ transform: `translate(${f * -64}px, 0)` })

let useP2P = (uid, otherUid) => {
  let debug = true
  let peerRef = useRef()
  let connRef = useRef()
  let [db, setDb] = useState({})

  useEffect(
    () => {
      if (!uid) return

      debug && console.log(`useP2P: initializing ${uid}`)

      getUserMedia({ video: false, audio: true })
      peerRef.current = new Peer(uid)
    },
    [uid]
  )

  useEffect(
    () => {
      if (!otherUid) return

      debug && console.log(`useP2P: connecting ${otherUid}`)

      let p = peerRef.current
      connRef.current = p.connect(otherUid)
    },
    [otherUid]
  )

  useEffect(
    () => {
      if (!uid || !otherUid) return

      debug && console.log(`useP2P: listening ${uid}<==>${otherUid})`)

      let p = peerRef.current
      let c = connRef.current = p.connect(otherUid)

      p.on('connection', c => {
        c.on('data', d => {
          debug && console.log(`useP2P: ${JSON.stringify(db)} <-- ${JSON.stringify(d)}`)
          setDb(db => merge(db, d))
        })
      })


      c.on('open', () => {
        setTimeout(() => {
          let d = { [uid]: { msg: 'hi!' } }
          setDb(db => merge(db, d))
          c.send(d)
        }, 1000)
      })
    },
    [uid, otherUid]
  )

  return db
}

export default ({ debug }) => {
  let [[x, y], setXy] = useState([0, 0])
  let [dir, setDir] = useState([1, 1])
  let [step, setStep] = useState(0)
  let [map, setMap] = useState('Tutorial')

  let [buffer, setBuffer] = useState(uid)
  let [otherUid, setOtherUid] = useState()
  let db = useP2P(uid, otherUid)

  useEffect(
    () => {
      console.log(`db: ${JSON.stringify(db, null, 2)}`)
    },
    [db]
  )

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

  let [showUid, setShowUid] = useState(true)

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

    <Dialog
      open={showUid}
      onClose={() => {
        if (buffer === uid || !buffer.length) return
        setShowUid(false)
        setOtherUid(buffer)
      }}
    >
      <TextField
        value={buffer}
        onChange={e => setBuffer(e.target.value)}
        placeholder="Enter Their Code"
        variant="outlined"
        error
      >
        {uid}
      </TextField>
    </Dialog>
  </>
}
