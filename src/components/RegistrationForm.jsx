import { useState } from 'react'
import { User, Mail, Phone } from 'lucide-react'

const RegistrationForm = ({ onComplete }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.name && formData.email && formData.phone) {
            onComplete(formData)
        }
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form__title">Registrasi</div>
            <div className="form__sub-title">Silakan lengkapi data antrian Anda.</div>

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

            <button className="form__submit-btn" type="submit">LANJUT</button>

            <div className="form__sign-up">Langkah 1 dari 3</div>
        </form>
    )
}

export default RegistrationForm
