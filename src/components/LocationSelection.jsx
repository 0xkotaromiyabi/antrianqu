import { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'

const LocationSelection = ({ onComplete }) => {
    const [merchants, setMerchants] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [selectedDate, setSelectedDate] = useState('')

    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const res = await fetch('/api/merchants')
                const data = await res.json()
                setMerchants(data)
            } catch (error) {
                console.error('Error fetching merchants:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchMerchants()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (selectedLocation && selectedDate) {
            onComplete({
                location: selectedLocation,
                date: selectedDate
            })
        }
    }

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + i)
        return d.toISOString().split('T')[0]
    })

    if (loading) {
        return (
            <div className="form" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
            </div>
        )
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form__title">Lokasi</div>
            <div className="form__sub-title">Pilih merchant dan tanggal kunjungan Anda.</div>

            <div className="selection-grid">
                {merchants.map((loc) => (
                    <div
                        key={loc.id}
                        onClick={() => setSelectedLocation(loc)}
                        className={`selection-item ${selectedLocation?.id === loc.id ? 'selection-item--active' : ''}`}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4>{loc.name}</h4>
                                <p style={{ opacity: 0.6, fontSize: '10px' }}>Merchant Terverifikasi</p>
                            </div>
                            {selectedLocation?.id === loc.id && <Check size={16} color="var(--primary-color)" />}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '25px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-color)', marginBottom: '10px' }}>Pilih Tanggal</p>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {dates.map((date) => {
                        const d = new Date(date)
                        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' })
                        const dayNum = d.getDate()
                        const isActive = selectedDate === date
                        return (
                            <div
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                style={{
                                    minWidth: '55px',
                                    height: '65px',
                                    background: isActive ? 'var(--primary-color)' : 'var(--secondary-color)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <p style={{ fontSize: '10px', fontWeight: '800', opacity: 0.8, color: isActive ? '#fff' : 'var(--text-color)' }}>{dayName}</p>
                                <p style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{dayNum}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <button className="form__submit-btn" type="submit" disabled={!selectedLocation || !selectedDate}>
                KONFIRMASI
            </button>

            <div className="form__sign-up">Langkah 2 dari 3</div>
        </form>
    )
}

export default LocationSelection
