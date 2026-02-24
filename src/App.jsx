import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, User, Loader2 } from 'lucide-react'
import RegistrationForm from './components/RegistrationForm'
import LocationSelection from './components/LocationSelection'
import QueueTicket from './components/QueueTicket'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'
import './index.css'

function App() {
  const [step, setStep] = useState(1)
  const [isAdminView, setIsAdminView] = useState(false)
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [role, setRole] = useState(localStorage.getItem('admin_role'))
  const [userData, setUserData] = useState(null)
  const [selectionData, setSelectionData] = useState(null)
  const [finalTicket, setFinalTicket] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegistrationComplete = (data) => {
    setUserData(data)
    setStep(2)
  }

  const handleSelectionComplete = async (data) => {
    setSelectionData(data)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          merchantId: data.location.id,
          slotId: data.slot.id,
          date: data.date
        }),
      })

      if (!response.ok) {
        throw new Error('Gagal mendaftar')
      }

      const ticketData = await response.json()
      setFinalTicket(ticketData)
      setStep(3)
    } catch (error) {
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setUserData(null)
    setSelectionData(null)
    setFinalTicket(null)
    setStep(1)
  }

  const handleLoginSuccess = (newToken, newRole) => {
    localStorage.setItem('admin_token', newToken)
    localStorage.setItem('admin_role', newRole)
    setToken(newToken)
    setRole(newRole)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_role')
    setToken(null)
    setRole(null)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {/* Floating View Toggle */}
      <div style={{ position: 'fixed', bottom: '20px', left: '20px', display: 'flex', gap: '10px', zIndex: 2000 }}>
        <button
          onClick={() => setIsAdminView(!isAdminView)}
          style={{
            background: 'var(--secondary-color)',
            color: 'var(--white)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 15px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isAdminView ? <><User size={14} /> Ke Antrian</> : <><Settings size={14} /> Admin ERP</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdminView ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0 }}
          >
            {!token ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AdminLogin onLoginSuccess={handleLoginSuccess} />
              </div>
            ) : (
              <AdminDashboard token={token} role={role} onBack={() => setIsAdminView(false)} onLogout={handleLogout} />
            )}
          </motion.div>
        ) : (
          <motion.section
            key="guest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="form__section"
          >
            <div className="form-container">
              {isSubmitting ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                  <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
                  <p style={{ marginTop: '20px', color: 'var(--text-color)', fontWeight: '600' }}>Memproses Antrian...</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RegistrationForm onComplete={handleRegistrationComplete} />
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LocationSelection onComplete={handleSelectionComplete} />
                    </motion.div>
                  )}

                  {step === 3 && finalTicket && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <QueueTicket
                        user={finalTicket}
                        selection={{ location: finalTicket.merchant, date: finalTicket.date }}
                        ticket={{ number: finalTicket.queueNumber, time: finalTicket.timeSlot }}
                        onReset={handleReset}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
