import styles from './styles/App.module.scss'
import React, { lazy, useState, useRef, useEffect } from 'react'
import { border, hexToHSL } from './global'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import TextField from '@material-ui/core/TextField'
import useP2P from './useP2P'

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

let { keys, entries } = Object

let colors = ['#FF4C3E', '#E4A392', '#F1DCB7', '#1DA261', '#2498FD', '#740099', '#E5B6C9']

export default ({ debug }) => {
  let [xy, setXy] = useState([0, 0])
  let [dir, setDir] = useState([1, 1])
  let [map, setMap] = useState('Tutorial')
  let [buffer, setBuffer] = useState('')
  let [otherUid, setOtherUid] = useState()

  let { uid, db, putDb, videos } = useP2P(
    uid => {
      return {
        players: {

          [uid]: {
            color: colors[uid.hash() % 4],
            x: 0,
            y: 0,
            dx: 1,
            dy: 1,
          },

          // ...[0,0,0,0,0,0,0,0,0,0].map((_, i) => (
          //   {
          //     [`car_${i}`]: {
          //       color: colors[uid.hash() % 4],
          //       x: 0,
          //       y: 0,
          //       dx: 1,
          //       dy: 1,
          //     }
          //   }
          // ))

        }
      }
    },
    otherUid
  )

  // useEffect(
  //   () => {
  //     console.log(`db: ${JSON.stringify(db, null, 2)}`)
  //   },
  //   [db]
  // )

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

  let videoRefs = useRef({})
  useEffect(
    () => {
      console.log(`videos: ${JSON.stringify(keys(videos), null, 2)}`)

      for (let [uid, myVidRef] of entries(videoRefs.current)) {
        myVidRef.srcObject = myVidRef.srcObject || videos[uid]
      }
    },
    [uid, videos]
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
        x={xy[0]}
        y={xy[1]}
        onClick={_ => {
          setMap(m => m === 'Tiny' ? 'Tutorial' : 'Tiny')
        }}
        debug={true}
      >

        {
          entries(db.players).map(([uid, {
            color,
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
              <span
                id={styles.Car}
                style={{
                  filter: `hue-rotate(${hexToHSL(color).h * 360 + carHueOff}deg)`,
                }}
                role="img"
                aria-labelledby="jsx-a11y/accessible-emoji"
              >
                🚖
              </span>
            </Sprite>
          )
        }

      </Map>
    </div>

    <div
      id={styles.Ui}
    >

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

      <Button
        variant="contained"
        color="secondary"
        className={styles.ConnBtn}
        onClick={_ => setShowUid(true)}
      >
        Connect
      </Button>

      <TextField
        className={styles.UidTxt}
        defaultValue={uid}
        variant="outlined"
        color="secondary"
        disabled
      />

      {
        keys(videos).map(uidN => (
          <video
            key={uidN}
            ref={ref => videoRefs.current[uidN] = ref}
            id={styles.Video}
            autoPlay
            playsInline
            muted={uidN === uid}
          />
        ))
      }

    </div>

    <Dialog
      open={showUid}
      onClose={() => {
        if (buffer === uid) return
        if (buffer.length) {
          setOtherUid(buffer)
          setBuffer('')
        }
        setShowUid(false)
      }}
    >
      <TextField
        autoFocus
        value={buffer}
        onChange={e => setBuffer(e.target.value)}
        placeholder={'Enter Their Code'}
        variant="outlined"
        error
      />
    </Dialog>
  </>
}
