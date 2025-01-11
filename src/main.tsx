import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './scss/styles.scss'
import './index.css'
import { MantineProvider, MantineColorsTuple } from '@mantine/core'

const myColor: MantineColorsTuple = [
  '#f3f7f5',
  '#e7eae9',
  '#cbd5d0',
  '#abbfb5',
  '#90ac9e',
  '#7fa08f',
  '#759b87',
  '#638674',
  '#567866',
  '#456857'
]

const theme = {
  colors: {
    myColor,
  },
  primaryColor: 'myColor',
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={
            <App />}
          />
        </Routes>
      </HashRouter>
    </MantineProvider>
  </StrictMode>,
)
