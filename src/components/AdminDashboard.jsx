import { useState, useEffect } from 'react'
import {
    Users,
    Calendar,
    MapPin,
    Trash2,
    Search,
    LayoutDashboard,
    Store,
    ClipboardList,
    Settings as SettingsIcon,
    LogOut,
    Clock,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react'

const AdminDashboard = ({ onBack, token, role, onLogout }) => {
    const [registrations, setRegistrations] = useState([])
    const [merchants, setMerchants] = useState([])
    const [activeMenu, setActiveMenu] = useState('overview') // 'overview', 'logs', or locationId
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [allAdmins, setAllAdmins] = useState([]) // For Super Admin management
    const [adminForm, setAdminForm] = useState({ username: '', password: '', role: 'ADMIN' })
    const [isAddingAdmin, setIsAddingAdmin] = useState(false)

    const fetchMerchants = async () => {
        try {
            const res = await fetch('/api/merchants', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setMerchants(data)
        } catch (error) {
            console.error('Error fetching merchants:', error)
        }
    }

    const fetchRegistrations = async () => {
        try {
            const res = await fetch('/api/registrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setRegistrations(data)
        } catch (error) {
            console.error('Error fetching registrations:', error)
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            const tasks = [fetchMerchants(), fetchRegistrations()]
            if (role === 'SUPER_ADMIN') tasks.push(fetchAdmins())
            await Promise.all(tasks)
            setLoading(false)
        }
        init()
    }, [role])

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admins', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            setAllAdmins(data)
        } catch (error) {
            console.error('Error fetching admins:', error)
        }
    }

    const handleAddAdmin = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(adminForm)
            })
            if (!res.ok) throw new Error('Gagal menambah admin')
            await fetchAdmins()
            setAdminForm({ username: '', password: '', role: 'ADMIN' })
            setIsAddingAdmin(false)
            alert('Admin baru berhasil ditambahkan')
        } catch (error) {
            alert(error.message)
        }
    }

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('Hapus akun admin ini?')) return
        try {
            const res = await fetch(`/api/admins/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!res.ok) throw new Error('Gagal menghapus admin')
            setAllAdmins(allAdmins.filter(a => a.id !== id))
        } catch (error) {
            alert(error.message)
        }
    }

    const handleResetPassword = async (id) => {
        const newPassword = window.prompt('Masukkan password baru:')
        if (!newPassword) return

        try {
            const res = await fetch(`/api/admins/${id}/reset-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            })
            if (!res.ok) throw new Error('Gagal reset password')
            alert('Password berhasil direset')
        } catch (error) {
            alert(error.message)
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Hapus pendaftaran ini?')) {
            try {
                await fetch(`/api/registrations/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setRegistrations(registrations.filter(r => r.id !== id))
            } catch (error) {
                alert('Gagal menghapus data')
            }
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            await fetch(`/api/registrations/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })
            setRegistrations(registrations.map(r => r.id === id ? { ...r, status: newStatus } : r))
        } catch (error) {
            alert('Gagal mengupdate status')
        }
    }

    const getFilteredData = () => {
        let base = registrations

        if (activeMenu === 'overview') {
            // Logic for overview can be special, here just show all for filtering
        } else if (activeMenu === 'logs') {
            // All history
        } else {
            base = base.filter(r => r.merchantId === activeMenu)
        }

        return base.filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.queueNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const filtered = getFilteredData()

    const stats = {
        total: registrations.length,
        waiting: registrations.filter(r => r.status === 'waiting').length,
        arrived: registrations.filter(r => r.status === 'arrived').length,
        cancelled: registrations.filter(r => r.status === 'cancelled').length,
    }

    const renderOverview = () => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div className="erp-card">
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '20px' }}>PERFORMA MERCHANT</h3>
                    <div>
                        {merchants.map(loc => {
                            const count = registrations.filter(r => r.merchantId === loc.id).length
                            const percentage = registrations.length ? (count / registrations.length) * 100 : 0
                            return (
                                <div key={loc.id} style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                                        <span>{loc.name}</span>
                                        <span style={{ fontWeight: '800' }}>{count} pax</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary-color)', transition: 'width 0.5s' }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="erp-card">
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '20px' }}>STATUS DISTRIBUSI</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b' }}>{stats.waiting}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-color)' }}>WAITING</p>
                        </div>
                        <div style={{ width: '2px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{stats.arrived}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-color)' }}>ARRIVED</p>
                        </div>
                        <div style={{ width: '2px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>{stats.cancelled}</p>
                            <p style={{ fontSize: '10px', color: 'var(--text-color)' }}>CANCELLED</p>
                        </div>
                    </div>
                </div>

                <div className="erp-card" style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '10px' }}>AKTIVITAS TERBARU</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {registrations.slice(-5).reverse().map(reg => (
                            <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '12px' }}>
                                <span><b style={{ color: 'var(--white)' }}>{reg.name}</b> mendaftar di <b>{reg.merchant?.name}</b></span>
                                <span style={{ color: 'var(--text-color)' }}>{new Date(reg.createdAt).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const renderSettings = () => {
        if (role !== 'SUPER_ADMIN') {
            return (
                <div className="erp-card">
                    <p style={{ color: 'var(--text-color)' }}>Anda tidak memiliki izin untuk mengakses pengaturan sistem.</p>
                </div>
            )
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="erp-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-color)' }}>MANAJEMEN ADMINISTRATOR</h3>
                        <button
                            onClick={() => setIsAddingAdmin(!isAddingAdmin)}
                            className="sign-in-with__option"
                            style={{ height: '35px', padding: '0 15px', background: 'var(--primary-color)', color: '#fff', fontSize: '12px' }}
                        >
                            {isAddingAdmin ? 'BATAL' : '+ TAMBAH ADMIN'}
                        </button>
                    </div>

                    {isAddingAdmin && (
                        <form onSubmit={handleAddAdmin} style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                <input
                                    className="form__input"
                                    placeholder="Username"
                                    required
                                    value={adminForm.username}
                                    onChange={e => setAdminForm({ ...adminForm, username: e.target.value })}
                                />
                                <input
                                    className="form__input"
                                    placeholder="Password"
                                    type="password"
                                    required
                                    value={adminForm.password}
                                    onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                                />
                                <select
                                    className="form__input"
                                    value={adminForm.role}
                                    onChange={e => setAdminForm({ ...adminForm, role: e.target.value })}
                                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                </select>
                            </div>
                            <button className="form__submit-btn" style={{ marginTop: '15px', height: '40px' }} type="submit">SIMPAN AKUN</button>
                        </form>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333' }}>
                                    <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-color)' }}>USERNAME</th>
                                    <th style={{ padding: '15px', textAlign: 'left', color: 'var(--text-color)' }}>ROLE</th>
                                    <th style={{ padding: '15px', textAlign: 'right', color: 'var(--text-color)' }}>AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allAdmins.map(admin => (
                                    <tr key={admin.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '15px', color: '#fff', fontWeight: '700' }}>{admin.username}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                fontSize: '10px',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: admin.role === 'SUPER_ADMIN' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                                                color: admin.role === 'SUPER_ADMIN' ? '#f59e0b' : 'var(--text-color)'
                                            }}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleResetPassword(admin.id)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '12px' }}
                                                >
                                                    Reset Password
                                                </button>
                                                {admin.username !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin.id)}
                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="erp-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
                </div>
            )
        }

        return (
            <div className="erp-content">
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>
                        {activeMenu === 'overview' ? 'Sistem Overview' :
                            activeMenu === 'logs' ? 'Log Pendaftaran' :
                                activeMenu === 'settings' ? 'Pengaturan Sistem' :
                                    merchants.find(l => l.id === activeMenu)?.name}
                    </h2>
                    <p style={{ color: 'var(--text-color)', fontSize: '14px' }}>
                        {activeMenu === 'settings' ? 'Kelola akun administrator dan hak akses.' : 'Pantau dan kelola antrian secara real-time.'}
                    </p>
                </div>

                {activeMenu === 'overview' ? renderOverview() :
                    activeMenu === 'settings' ? renderSettings() : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                <div className="erp-card">
                                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '10px' }}>TOTAL ANTRIAN</p>
                                    <p style={{ fontSize: '32px', fontWeight: '900', color: '#fff' }}>{stats.total}</p>
                                </div>
                                <div className="erp-card">
                                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '10px' }}>MENUNGGU</p>
                                    <p style={{ fontSize: '32px', fontWeight: '900', color: '#f59e0b' }}>{stats.waiting}</p>
                                </div>
                                <div className="erp-card">
                                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '10px' }}>SUDAH TIBA</p>
                                    <p style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>{stats.arrived}</p>
                                </div>
                            </div>

                            <div className="form__input-wrapper" style={{ height: '45px', marginTop: 0, marginBottom: '20px', maxWidth: '400px' }}>
                                <input
                                    className="form__input"
                                    style={{ height: '45px' }}
                                    placeholder="Search registrations..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="form__input-icon">
                                    <Search size={18} />
                                </div>
                            </div>

                            <div className="erp-card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ background: '#121212' }}>
                                                <th style={{ padding: '18px 20px', color: 'var(--text-color)', fontWeight: '700' }}>TICKET info</th>
                                                <th style={{ padding: '18px 20px', color: 'var(--text-color)', fontWeight: '700' }}>CUSTOMER</th>
                                                <th style={{ padding: '18px 20px', color: 'var(--text-color)', fontWeight: '700' }}>SCHEDULE</th>
                                                <th style={{ padding: '18px 20px', color: 'var(--text-color)', fontWeight: '700' }}>STATUS</th>
                                                <th style={{ padding: '18px 20px', color: 'var(--text-color)', fontWeight: '700', textAlign: 'right' }}>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map((reg) => (
                                                <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <td style={{ padding: '18px 20px' }}>
                                                        <p style={{ fontWeight: '900', color: 'var(--primary-color)', fontSize: '16px' }}>{reg.queueNumber}</p>
                                                    </td>
                                                    <td style={{ padding: '18px 20px' }}>
                                                        <p style={{ fontWeight: '700', color: '#fff' }}>{reg.name}</p>
                                                        <p style={{ color: 'var(--text-color)', fontSize: '11px' }}>{reg.phone}</p>
                                                    </td>
                                                    <td style={{ padding: '18px 20px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                            <MapPin size={12} color="var(--primary-color)" />
                                                            <span style={{ color: '#fff' }}>{reg.merchant?.name}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Clock size={12} color="var(--text-color)" />
                                                            <span style={{ color: 'var(--text-color)' }}>{reg.timeSlot} WIB</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '18px 20px' }}>
                                                        <span className={`badge badge-${reg.status}`}>
                                                            {reg.status === 'waiting' ? 'Menunggu' : reg.status === 'arrived' ? 'Hadir' : 'Batal'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '18px 20px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                            {reg.status === 'waiting' && (
                                                                <button
                                                                    onClick={() => updateStatus(reg.id, 'arrived')}
                                                                    className="sign-in-with__option"
                                                                    style={{ width: '32px', height: '32px', color: '#10b981', background: 'rgba(16,185,129,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                            )}
                                                            {reg.status !== 'cancelled' && (
                                                                <button
                                                                    onClick={() => updateStatus(reg.id, 'cancelled')}
                                                                    className="sign-in-with__option"
                                                                    style={{ width: '32px', height: '32px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(reg.id)}
                                                                className="sign-in-with__option"
                                                                style={{ width: '32px', height: '32px', color: 'var(--text-color)', background: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
            </div>
        )
    }

    return (
        <div className="erp-container">
            <aside className="erp-sidebar">
                <div className="erp-sidebar-header">
                    <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' }}>
                        ANTRIAN<span style={{ color: 'var(--primary-color)' }}>Qu</span>
                    </h1>
                </div>

                <nav className="erp-nav">
                    <p className="erp-nav-label">General</p>
                    <div
                        className={`erp-nav-item ${activeMenu === 'overview' ? 'erp-nav-item--active' : ''}`}
                        onClick={() => setActiveMenu('overview')}
                    >
                        <LayoutDashboard size={18} /> Overview
                    </div>
                    <div
                        className={`erp-nav-item ${activeMenu === 'logs' ? 'erp-nav-item--active' : ''}`}
                        onClick={() => setActiveMenu('logs')}
                    >
                        <ClipboardList size={18} /> User Logs
                    </div>

                    <p className="erp-nav-label">Merchants</p>
                    {merchants.map(loc => (
                        <div
                            key={loc.id}
                            className={`erp-nav-item ${activeMenu === loc.id ? 'erp-nav-item--active' : ''}`}
                            onClick={() => setActiveMenu(loc.id)}
                        >
                            <Store size={18} /> {loc.name}
                        </div>
                    ))}

                    <p className="erp-nav-label">System</p>
                    <div
                        className={`erp-nav-item ${activeMenu === 'settings' ? 'erp-nav-item--active' : ''}`}
                        onClick={() => setActiveMenu('settings')}
                    >
                        <SettingsIcon size={18} /> Settings
                    </div>
                    <div className="erp-nav-item" onClick={onLogout} style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#ef4444' }}>
                        <LogOut size={18} /> Logout Admin
                    </div>
                </nav>
            </aside>

            <main className="erp-main">
                <header className="erp-header">
                    <div style={{ color: 'var(--text-color)', fontSize: '13px' }}>
                        Dashboard / <span style={{ color: '#fff' }}>{activeMenu === 'overview' ? 'Overview' : 'Monitoring'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>Admin Profile</p>
                            <p style={{ color: 'var(--text-color)', fontSize: '11px' }}>{role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Administrator'}</p>
                        </div>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="#fff" style={{ margin: 'auto' }} />
                        </div>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    )
}

export default AdminDashboard
