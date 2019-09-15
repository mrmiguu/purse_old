import './styles/index.scss'
import React, { lazy, Suspense } from 'react'
import { render } from 'react-dom'

let App = lazy(_ => import('./App'))

render(
  <Suspense fallback={null}>
    <App debug={true} />
  </Suspense>,
  document.querySelector('#root')
)
