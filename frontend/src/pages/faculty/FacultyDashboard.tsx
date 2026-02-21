import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    User,
    ClipboardCheck,
    History,
    BookOpen,
    Inbox,
    ArrowRight
} from "lucide-react";

export default function FacultyDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="erp-container">
            <div className="erp-stats-grid">
                <div className="erp-stat-card">
                    <div className="stat-icon">
                        <User />
                    </div>
                    <div className="stat-value">Welcome</div>
                    <div className="stat-label">
                        {user?.first_name} {user?.last_name}
                    </div>
                    <div className="stat-trend">
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                            Active Session
                        </span>
                    </div>
                </div>
            </div>

            <div className="erp-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
                marginTop: 20
            }}>
                <div className="erp-card erp-card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/faculty/attendance')}>
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon"><ClipboardCheck /></span>
                            Mark Attendance
                        </span>
                        <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                    <div style={{ padding: '0 20px 20px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Take daily attendance for your students in assigned courses.
                        </p>
                    </div>
                </div>

                <div className="erp-card erp-card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/faculty/history')}>
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon"><History /></span>
                            View History
                        </span>
                        <ArrowRight size={16} color="var(--text-muted)" />
                    </div>
                    <div style={{ padding: '0 20px 20px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                            Review past attendance records and track student consistency.
                        </p>
                    </div>
                </div>
            </div>

            <div className="erp-card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon"><BookOpen /></span>
                        My Classes
                    </span>
                </div>
                <div className="erp-empty">
                    <div className="erp-empty-icon">
                        <Inbox />
                    </div>
                    <div className="erp-empty-text">No active classes assigned yet.</div>
                </div>
            </div>
        </div>
    );
}
