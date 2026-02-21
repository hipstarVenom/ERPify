import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function FacultyDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="erp-container">
            <div className="erp-stats-grid">
                <div className="erp-stat-card">
                    <div className="stat-icon">👋</div>
                    <div className="stat-value">Welcome</div>
                    <div className="stat-label">
                        {user?.first_name} {user?.last_name}
                    </div>
                    <div className="stat-trend">✓ Logged in as Faculty</div>
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
                            <span className="card-title-icon">📝</span>
                            Mark Attendance
                        </span>
                    </div>
                    <div style={{ padding: 20 }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                            Take daily attendance for your students in assigned courses.
                        </p>
                    </div>
                </div>

                <div className="erp-card erp-card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate('/faculty/history')}>
                    <div className="card-header">
                        <span className="card-title">
                            <span className="card-title-icon">📜</span>
                            View History
                        </span>
                    </div>
                    <div style={{ padding: 20 }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                            Review past attendance records and track student consistency.
                        </p>
                    </div>
                </div>
            </div>

            <div className="erp-card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">📋</span>
                        My Classes
                    </span>
                </div>
                <div className="erp-empty">
                    <div className="erp-empty-icon">📭</div>
                    <div className="erp-empty-text">No active classes assigned yet.</div>
                </div>
            </div>
        </div>
    );
}
