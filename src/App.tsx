import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import GlobalLayout from './layouts/GlobalLayout'
import DesignSystem from './pages/DesignSystem'
import AppInstallPrompt from './components/AppInstallPrompt'
import FinishToast from './components/FinishToast'

export default function App(){
  return (
    <SettingsProvider>
      <ThemeProvider>
        <GlobalLayout>
          <DesignSystem />
          <AppInstallPrompt />
          <FinishToast />
        </GlobalLayout>
      </ThemeProvider>
    </SettingsProvider>
  )
}
