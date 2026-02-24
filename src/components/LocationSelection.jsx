import { useState, useEffect } from 'react'
import { Check, Loader2, Info, Clock, AlertTriangle } from 'lucide-react'

const LocationSelection = ({ onComplete }) => {
    const [merchants, setMerchants] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedLocation, setSelectedLocation] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [slots, setSlots] = useState([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const res = await fetch('/api/merchants')
                const data = await res.json()
                setMerchants(data)
                if (data.length > 0) setSelectedLocation(data[0])
            } catch (error) {
                console.error('Error fetching merchants:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchMerchants()
    }, [])

    useEffect(() => {
        if (selectedLocation && selectedDate) {
            const fetchSlots = async () => {
                setLoadingSlots(true)
                try {
                    const res = await fetch(`/api/merchants/${selectedLocation.id}/slots?date=${selectedDate}`)
                    const data = await res.json()
                    setSlots(data)
                } catch (error) {
                    console.error('Error fetching slots:', error)
                } finally {
                    setLoadingSlots(false)
                }
            }
            fetchSlots()
        }
    }, [selectedLocation, selectedDate])

    const handleSlotSelect = (slot) => {
        if (!slot.isAvailable) return
        onComplete({
            location: selectedLocation,
            date: selectedDate,
            slot: slot
        })
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
        <div className="form" style={{ maxWidth: '600px' }}>
            {/* Header with Real-time Clock */}
            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-color)', marginBottom: '5px' }}>
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-color)', fontFamily: 'monospace' }}>
                    {currentTime.toLocaleTimeString('id-ID')}
                </p>
            </div>

            <div className="form__title" style={{ fontSize: '20px' }}>Butik Emas LM - {selectedLocation?.name}</div>

            {/* Availability Status Banner */}
            <div style={{
                background: slots.some(s => s.isAvailable) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: slots.some(s => s.isAvailable) ? '#22c55e' : '#ef4444',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '700',
                marginBottom: '20px',
                border: '1px solid'
            }}>
                {slots.some(s => s.isAvailable) ? 'Kuota Tersedia' : 'Kuota Tidak Tersedia'}
            </div>

            {/* Merchant Info Card */}
            <div style={{ background: 'var(--secondary-color)', padding: '15px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Info size={18} color="var(--primary-color)" />
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>INFORMASI PENTING</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-color)', lineHeight: '1.6' }}>
                    <p style={{ color: '#fbbf24', fontWeight: '800', marginBottom: '10px' }}>READY 0,5 gr | 1 gr | 5 gr (limited)</p>
                    <ol style={{ paddingLeft: '15px' }}>
                        <li>Khusus transaksi Gift Series dapat langsung bertransaksi tanpa antrean online.</li>
                        <li>Maksimal 2 (dua) kali transaksi dalam 1 bulan per KTP.</li>
                        <li>Wajib membawa KTP asli yang masih berlaku.</li>
                        <li>Transaksi tidak dapat diwakilkan.</li>
                        <li>Nomor antrean tidak menjamin ketersediaan stok.</li>
                        <li>Harap hadir sesuai jam kedatangan.</li>
                    </ol>
                </div>
            </div>

            {/* Date Selection */}
            <div style={{ marginBottom: '25px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-color)', marginBottom: '10px', fontWeight: '600' }}>Pilih Tanggal Kunjungan</p>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
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

            {/* Location Selection Dropdown */}
            <div style={{ marginBottom: '25px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-color)', marginBottom: '10px', fontWeight: '600' }}>Pilih Lokasi Butik</p>
                <select
                    value={selectedLocation?.id}
                    onChange={(e) => setSelectedLocation(merchants.find(m => m.id === parseInt(e.target.value)))}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--secondary-color)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                >
                    {merchants.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            {/* Time Slot Selection */}
            <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '15px', borderLeft: '4px solid var(--primary-color)', paddingLeft: '10px' }}>
                    -- Pilih Waktu Kedatangan --
                </p>

                {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin" size={24} /></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {slots.map((slot) => (
                            <div
                                key={slot.id}
                                onClick={() => handleSlotSelect(slot)}
                                style={{
                                    padding: '15px',
                                    background: slot.isAvailable ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                                    border: slot.isAvailable ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '12px',
                                    cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                                    opacity: slot.isAvailable ? 1 : 0.6,
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                className={slot.isAvailable ? 'hover-scale' : ''}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                    <Clock size={14} color={slot.isAvailable ? 'var(--primary-color)' : '#999'} />
                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{slot.startTime} - {slot.endTime}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: slot.isAvailable ? '#22c55e' : '#ef4444' }}>
                                        {slot.isAvailable ? `Sisa: ${slot.maxQuota - slot.currentCount}` : 'Penuh'}
                                    </span>
                                    {!slot.isAvailable && <AlertTriangle size={12} color="#ef4444" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="form__sign-up">Langkah 2 dari 3</div>
        </div>
    )
}

export default LocationSelection
