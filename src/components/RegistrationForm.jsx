import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calculator, AlertCircle } from 'lucide-react'

const RegistrationForm = ({ onComplete }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })
    const [captcha, setCaptcha] = useState({ n1: 0, n2: 0 })
    const [captchaInput, setCaptchaInput] = useState('')
    const [error, setError] = useState('')

    const generateCaptcha = () => {
        setCaptcha({
            n1: Math.floor(Math.random() * 10) + 1,
            n2: Math.floor(Math.random() * 10) + 1
        })
        setCaptchaInput('')
    }

    useEffect(() => {
        generateCaptcha()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (parseInt(captchaInput) !== captcha.n1 + captcha.n2) {
            setError('Jawaban captcha salah. Silakan coba lagi.')
            generateCaptcha()
            return
        }

        if (formData.name && formData.email && formData.phone) {
            onComplete(formData)
        }
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form__title">Registrasi</div>
            <div className="form__sub-title">Silakan lengkapi data antrian Anda.</div>

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
                    placeholder="Nama Lengkap"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="form__input-icon">
                    <User size={20} />
                </div>
            </div>

            <div className="form__input-wrapper">
                <input
                    className="form__input"
                    placeholder="Email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <div className="form__input-icon">
                    <Mail size={20} />
                </div>
            </div>

            <div className="form__input-wrapper">
                <input
                    className="form__input"
                    placeholder="Nomor WhatsApp"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="form__input-icon">
                    <Phone size={20} />
                </div>
            </div>

            <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-color)', marginBottom: '8px', fontWeight: '600' }}>
                    Verifikasi Keamanan
                </p>
                <div className="form__input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        background: 'var(--secondary-color)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '800',
                        color: 'var(--primary-color)',
                        minWidth: '100px',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        {captcha.n1} + {captcha.n2} = ?
                    </div>
                    <div className="form__input-wrapper" style={{ margin: 0, flex: 1 }}>
                        <input
                            className="form__input"
                            placeholder="Jawaban"
                            type="number"
                            required
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                        />
                        <div className="form__input-icon">
                            <Calculator size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <button className="form__submit-btn" type="submit">LANJUT</button>

            <div className="form__sign-up">Langkah 1 dari 3</div>
        </form>
    )
}

export default RegistrationForm
