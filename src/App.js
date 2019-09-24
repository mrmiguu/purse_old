import styles from './styles/App.module.scss'
import React, { lazy, useState, useRef, useEffect } from 'react'
import { border, hexToHSL, pseudoUid } from './global'
import pcImgs from './pcImgs'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import useP2P from './useP2P'

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

let { entries } = Object

let uid = pseudoUid() // our fake uid

let walkCy = [1, 2, 1, 0]
let frame = f => ({ transform: `translate(${f * -64}px, 0)` })

export default ({ debug }) => {
  let [xy, setXy] = useState([0, 0])
  let [dir, setDir] = useState([1, 1])
  let [step, setStep] = useState(0)
  let [map, setMap] = useState('Tutorial')

  let [buffer, setBuffer] = useState('')
  let [otherUid, setOtherUid] = useState()
  let { db, putDb } = useP2P(uid, otherUid)

  useEffect(
    () => {
      if (!db) {
        let [x, y] = xy
        let [dx, dy] = dir

        putDb({
          players: {
            [uid]: {
              skin: 1,
              face: { color: 'blue', type: 0 },
              hair: { len: 'short', color: 'yellow', type: 1 },
              x,
              y,
              dx,
              dy,
            }
          }
        })

        return
      }

      console.log(`db: ${JSON.stringify(db, null, 2)}`)
    },
    [db]
  )

  let players = {
    ...(db || {}).players || {},

    ['empty']: {
      skin: 1,
      face: {},
      hair: {},
      x: 4,
      y: 4,
      dx: -1,
      dy: 1,
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
        setXy(xy => {
          let [x, y] = xy
          let x2 = x + vx
          let y2 = y + vy
          if (x === x2 && y === y2) return xy
          return [x2, y2]
        })
        setDir(dir => {
          let [dx, dy] = dir
          let dx2 = vx || dx
          let dy2 = vy || dy
          if (dx === dx2 && dy === dy2) return dir
          return [dx2, dy2]
        })
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

  useEffect(
    () => {
      let [x, y] = xy
      putDb({ players: { [uid]: { x, y } } })
    },
    [xy]
  )

  useEffect(
    () => {
      let [dx, dy] = dir
      putDb({ players: { [uid]: { dx, dy } } })
    },
    [dir]
  )

  let [showUid, setShowUid] = useState(false)

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
        x={xy[0]}
        y={xy[1]}
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
            face: { color: eyeColor, type: eyeType },
            hair: { len: hairLength, color: hairColor, type: hairType },
            x,
            y,
            dx,
            dy,
          }]) =>
            <Sprite
              key={uid}
              x={x}
              y={y}
              dir={[dx, dy]}
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

    <div id={styles.Ui}>

      <TextField
        className={styles.UidTxt}
        defaultValue={uid}
        variant="outlined"
        color="secondary"
        disabled
      />

      <Button
        variant="contained"
        color="secondary"
        className={styles.ConnBtn}
        onClick={_ => setShowUid(true)}
      >
        Connect
      </Button>

    </div>

    <Dialog
      open={!db && showUid}
      onClose={() => {
        if (buffer === uid) return
        if (buffer.length) {
          setOtherUid(buffer)
        }
        setShowUid(false)
      }}
    >
      <TextField
        value={buffer}
        onChange={e => setBuffer(e.target.value)}
        placeholder={'Enter Their Code'}
        variant="outlined"
        error
      />
    </Dialog>
  </>
}
