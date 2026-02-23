import { Download, RefreshCw } from 'lucide-react'

const QueueTicket = ({ user, selection, ticket, onReset }) => {
    return (
        <div className="form ticket-card">
            <div className="form__title">Tiket Anda</div>
            <div className="form__sub-title">Tunjukkan tiket ini saat tiba di lokasi.</div>

            <div className="queue-number">{ticket.number}</div>
            <p style={{ color: 'var(--white)', fontWeight: '700', fontSize: '14px', marginBottom: '5px' }}>ESTIMASI JAM</p>
            <p style={{ color: 'var(--primary-color)', fontWeight: '900', fontSize: '24px' }}>{ticket.time} WIB</p>

            <div className="ticket-info">
                <div className="ticket-info-row">
                    <span className="ticket-info-label">Nama</span>
                    <span className="ticket-info-value">{user.name}</span>
                </div>
                <div className="ticket-info-row">
                    <span className="ticket-info-label">WhatsApp</span>
                    <span className="ticket-info-value">{user.phone}</span>
                </div>
                <div className="ticket-info-row">
                    <span className="ticket-info-label">Lokasi</span>
                    <span className="ticket-info-value">{selection.location.name}</span>
                </div>
                <div className="ticket-info-row">
                    <span className="ticket-info-label">Tanggal</span>
                    <span className="ticket-info-value">
                        {new Date(selection.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button className="form__submit-btn" style={{ marginTop: 0, flex: 1 }}>
                    <Download size={18} style={{ marginRight: '8px' }} /> SIMPAN
                </button>
                <button
                    onClick={onReset}
                    className="form__submit-btn"
                    style={{
                        marginTop: 0,
                        width: '60px',
                        background: 'var(--secondary-color)',
                        boxShadow: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <RefreshCw size={22} color="var(--text-color)" />
                </button>
            </div>

            <div className="form__sign-up">Tiket Aktif</div>
        </div>
    )
}

export default QueueTicket
