import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import handleContact from './server/contact.js'
import adminLogin from './server/admin-auth.js'
import adminSession from './api/admin/session.js'
import adminLogout from './api/admin/logout.js'
import adminData from './api/admin/data.js'
import addWaitlistEntry from './api/waitlist.js'
import recordAnalyticsEvent from './api/analytics.js'
import createPreorder from './api/preorders.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const name of [
    'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET',
  ]) process.env[name] ||= env[name]

  return {
    plugins: [
      react(),
      {
        name: 'contact-email-api',
        configureServer(server) {
          const routes = new Map([
            ['/api/contact', handleContact],
            ['/api/admin/login', adminLogin],
            ['/api/admin/session', adminSession],
            ['/api/admin/logout', adminLogout],
            ['/api/admin/data', adminData],
            ['/api/waitlist', addWaitlistEntry],
            ['/api/analytics', recordAnalyticsEvent],
            ['/api/preorders', createPreorder],
          ])
          server.middlewares.use((request, response, next) => {
            const pathname = new URL(request.url, 'http://localhost').pathname
            const handler = routes.get(pathname)
            if (handler) return handler(request, response)
            next()
          })
        },
      },
    ],
  }
})
