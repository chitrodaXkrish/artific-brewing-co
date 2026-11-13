import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import handleContact from './server/contact.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.RESEND_API_KEY ||= env.RESEND_API_KEY
  process.env.RESEND_FROM_EMAIL ||= env.RESEND_FROM_EMAIL

  return {
    plugins: [
      react(),
      {
        name: 'contact-email-api',
        configureServer(server) {
          server.middlewares.use('/api/contact', handleContact)
        },
      },
    ],
  }
})
