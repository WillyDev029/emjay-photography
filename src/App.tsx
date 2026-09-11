import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ToastProvider } from '@/hooks/useToast'
import { Layout } from '@/components/layout/Layout'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { HomePage } from '@/pages/HomePage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { AboutPage } from '@/pages/AboutPage'
import { BookingPage } from '@/pages/BookingPage'
import { ContactPage } from '@/pages/ContactPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'

// Admin pages are lazy-loaded so the initial bundle stays small.
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminPortfolioPage = lazy(() =>
  import('@/pages/admin/AdminPortfolioPage').then((m) => ({ default: m.AdminPortfolioPage })),
)
const AdminServicesPage = lazy(() =>
  import('@/pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })),
)
const AdminBookingsPage = lazy(() =>
  import('@/pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })),
)
const AdminTestimonialsPage = lazy(() =>
  import('@/pages/admin/AdminTestimonialsPage').then((m) => ({ default: m.AdminTestimonialsPage })),
)
const AdminCalendarPage = lazy(() =>
  import('@/pages/admin/AdminCalendarPage').then((m) => ({ default: m.AdminCalendarPage })),
)
const AdminMessagesPage = lazy(() =>
  import('@/pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })),
)
const AdminSettingsPage = lazy(() =>
  import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })),
)

function AdminFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-gold-600/25 border-t-gold-600" />
    </div>
  )
}

export function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <SettingsProvider>
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>

                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route
                      index
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminDashboardPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="portfolio"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminPortfolioPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="services"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminServicesPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="bookings"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminBookingsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="testimonials"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminTestimonialsPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="calendar"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminCalendarPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="messages"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminMessagesPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <Suspense fallback={<AdminFallback />}>
                          <AdminSettingsPage />
                        </Suspense>
                      }
                    />
                  </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </SettingsProvider>
      </ToastProvider>
    </HelmetProvider>
  )
}