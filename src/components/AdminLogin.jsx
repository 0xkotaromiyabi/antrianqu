import { useState } from 'react'
import { User, Lock, Loader2, AlertCircle } from 'lucide-react'

const AdminLogin = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Terjadi kesalahan saat login.')
            }

            onLoginSuccess(data.token, data.role)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="form-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <form className="form" onSubmit={handleSubmit}>
                <div className="form__title">Admin Login</div>
                <div className="form__sub-title">Masuk ke sistem ERP Manajemen Antrian.</div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <div className="form__input-wrapper">
                    <input
                        className="form__input"
                        placeholder="Username"
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                    <div className="form__input-icon">
                        <User size={20} />
                    </div>
                </div>

                <div className="form__input-wrapper">
                    <input
                        className="form__input"
                        placeholder="Password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <div className="form__input-icon">
                        <Lock size={20} />
                    </div>
                </div>

                <button className="form__submit-btn" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'MASUK'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '12px', color: 'var(--text-color)' }}>
                    Gunakan akun administrator terdaftar
                </div>
            </form>
        </div>
    )
}

export default AdminLogin
