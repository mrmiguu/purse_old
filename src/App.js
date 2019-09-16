import styles from './styles/App.module.scss'
import React, { lazy, useState } from 'react'
import { border } from './global'
import body_1 from './Players/Bodies/1.png'

let Map = lazy(() => import('./Map'))
let Sprite = lazy(() => import('./Sprite'))
let Keyboard = lazy(() => import('./Keyboard'))

export default ({ debug }) => {
  let [[x, y], setXy] = useState([0, 0])
  let [map, setMap] = useState('Tutorial')

  return <>
    <div
      id={styles.App}
      style={border(debug)}
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
          debug={true}
        >
          <img src={body_1} />
        </Sprite>
      </Map>

      <Keyboard
        onLeft={() => setXy(([x, y]) => [x - 1, y])}
        onRight={() => setXy(([x, y]) => [x + 1, y])}
        onUp={() => setXy(([x, y]) => [x, y - 1])}
        onDown={() => setXy(([x, y]) => [x, y + 1])}
        debug={false}
      />

    </div>
  </>
}
