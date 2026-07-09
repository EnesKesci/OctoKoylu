import React from 'react'
import AppProviders from './app/providers/AppProviders'
import AppRouter from './app/router/AppRouter'
import './App.css'

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  )
}
