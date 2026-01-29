import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import GlobalLayout from './layouts/GlobalLayout'
import DesignSystem from './pages/DesignSystem'
import AppInstallPrompt from './components/AppInstallPrompt'
import FinishToast from './components/FinishToast'

export default function App(){
  return (
    <ThemeProvider>
      <GlobalLayout>
        <DesignSystem />
        <AppInstallPrompt />
        <FinishToast />
      </GlobalLayout>
    </ThemeProvider>
  )
}
