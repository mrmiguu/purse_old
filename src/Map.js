import styles from './styles/Map.module.scss'
import React, { useRef, useState, useEffect } from 'react'
import anime from 'animejs'
import { border } from './global'
import { useWindowSize } from './use'

let maps = {
  Tutorial: import(`./maps/Tutorial.json`),
  Tiny: import(`./maps/Tiny.json`),
}

export default ({ load, x, y, debug, children, ...props }) => {

  let [wndW, wndH] = useWindowSize()
  let ref = useRef()
  let [data, setData] = useState({})

  useEffect(
    () => {
      maps[load].then(m => {
        console.log(`map:\n${JSON.stringify(m)}`)
        setData(m)
      })
    },
    [load]
  )

  useEffect(
    () => {
      anime({
        targets: ref.current,
        translateX: wndW / 2 - x * 32 - 32 / 2,
        translateY: wndH / 2 - y * 32 - 32 / 2,
        easing: 'linear',
        duration: 500,
      })
    },
    [x, y, wndW, wndH]
  )

  return <>
    <div
      ref={ref}
      id={styles.Map}
      style={{
        ...border(debug),
        width: `${data.w * 32}px`,
        height: `${data.h * 32}px`,
      }}
      {...props}
    >
      {children}
    </div>
  </>
}
