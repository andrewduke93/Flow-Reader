import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import GlobalLayout from './layouts/GlobalLayout'
import DesignSystem from './pages/DesignSystem'

export default function App(){
  return (
    <ThemeProvider>
      <GlobalLayout>
        <DesignSystem />
      </GlobalLayout>
    </ThemeProvider>
  )
}
