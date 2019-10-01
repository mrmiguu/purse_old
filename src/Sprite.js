import styles from './styles/Sprite.module.scss'
import React, { useRef, useEffect } from 'react'
import anime from 'animejs'
import { border } from './global'

export default ({ x, y, dir, debug, style, children, ...props }) => {
  let ref = useRef()

  useEffect(
    () => {
      anime({
        targets: ref.current,
        duration: 1500,

        translateX: {
          value: x * 32 - 16,
          easing: 'linear',
          duration: 250,
        },

        translateY: {
          value: y * 32 - 32,
          easing: 'linear',
          duration: 250,
        },

        scaleX: dir[0],
        // scaleY: dir[1],

      })
    },
    [x, y, dir]
  )

  return <>
    <div
      ref={ref}
      id={styles.Sprite}
      style={{
        ...border(debug),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  </>
}
