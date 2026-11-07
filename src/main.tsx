import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics'
import { captureAttribution } from './funnel/attribution'
import { initErrorTracking } from './lib/error-tracking'
import { installGlobalErrorReporting } from './lib/error-reporter'

captureAttribution()
initAnalytics()
initErrorTracking()
installGlobalErrorReporting()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
