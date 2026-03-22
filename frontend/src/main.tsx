import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppRouter from './routes/AppRouter'
import { useThemeStore } from './store/themeStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function ThemeInitializer() {
  const { isDark } = useThemeStore()
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])
  return null
}

import { ChatProvider } from './components/Chat/ChatContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <ThemeInitializer />
        <AppRouter />
      </ChatProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
