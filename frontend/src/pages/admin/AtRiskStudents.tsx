import { useEffect, useState } from "react";
import API from "../../api/api";
import axios from "axios";

interface StudentRiskData {
    id: string;
    name: string;
    email: string;
    attendance: number;
    averageMarks: number;
    riskLevel: "High" | "Medium" | "Low";
    reason: string;
}

export default function AtRiskStudents() {
    const [students, setStudents] = useState<StudentRiskData[]>([]);
    const [loading, setLoading] = useState(true);
    const webhookUrl = "https://myaidesigntools.app.n8n.cloud/webhook/773200c1-8b55-4b1d-abb7-24470cb36e5c";
    const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isTriggering, setIsTriggering] = useState(false);

    useEffect(() => {
        fetchRiskData();
    }, []);

    const fetchRiskData = async () => {
        try {
            setLoading(true);
            // Fetch necessary data to calculate risk
            const [usersRes, enrollmentsRes, attendanceRes, gradesRes] = await Promise.all([
                API.get("/users/"),
                API.get("/enrollment/"),
                API.get("/attendance/"),
                API.get("/grades/")
            ]);

            const users = usersRes.data;
            const enrollments = enrollmentsRes.data;
            const attendance = attendanceRes.data;
            const grades = gradesRes.data;

            // Simple risk logic for demonstration
            const riskList: StudentRiskData[] = enrollments.map((enr: any) => {
                const user = users.find((u: any) => u.id === enr.student_id);
                if (!user) return null;

                const studentAttendance = attendance.filter((a: any) => a.enrollment_id === enr.id);
                const attPercent = studentAttendance.length > 0
                    ? (studentAttendance.filter((a: any) => a.status).length / studentAttendance.length) * 100
                    : 100;

                const studentGrades = grades.filter((g: any) => g.enrollment_id === enr.id);
                const avgMarks = studentGrades.length > 0
                    ? studentGrades.reduce((acc: number, curr: any) => acc + curr.marks, 0) / studentGrades.length
                    : 100;

                let riskLevel: "High" | "Medium" | "Low" = "Low";
                let reason = "Good Standing";

                if (attPercent < 75 || avgMarks < 40) {
                    riskLevel = "High";
                    reason = attPercent < 75 ? "Low Attendance" : "Poor Academic Performance";
                } else if (attPercent < 85 || avgMarks < 60) {
                    riskLevel = "Medium";
                    reason = "Borderline Attendance/Grades";
                }

                return {
                    id: enr.id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    attendance: Math.round(attPercent),
                    averageMarks: Math.round(avgMarks),
                    riskLevel,
                    reason
                };
            }).filter(Boolean);

            setStudents(riskList);
        } catch (err) {
            console.error("Failed to fetch risk data", err);
        } finally {
            setLoading(false);
        }
    };

    const triggerAutomation = async () => {
        if (!webhookUrl) {
            setStatusMsg({ type: "error", text: "Please provide a valid n8n Webhook URL." });
            return;
        }

        setIsTriggering(true);
        setStatusMsg(null);

        const atRiskOnly = students.filter(s => s.riskLevel !== "Low");

        try {
            // Send at-risk students to n8n
            await axios.post(webhookUrl, {
                event: "STUDENT_RISK_IDENTIFIED",
                triggeredBy: "Admin Dashboard",
                timestamp: new Date().toISOString(),
                data: atRiskOnly
            });

            setStatusMsg({ type: "success", text: `🚀 Automation triggered! Sent ${atRiskOnly.length} students to n8n.` });
        } catch (err) {
            setStatusMsg({ type: "error", text: "Failed to connect to n8n webhook. Please check the URL." });
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="erp-container">
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        <span className="card-title-icon">🤖</span> AI Risk Automation
                    </span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div className="badge-blue erp-badge">n8n Integrated</div>
                    </div>
                </div>

                <div style={{ padding: '0 24px 24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    This system automatically analyzes student performance and attendance to identify those at risk.
                    Click <strong>"Run Risk Workflow"</strong> below to send alerts to the academic team via n8n.
                </div>

                {statusMsg && (
                    <div style={{ padding: '0 24px 24px' }}>
                        <div className={`erp-alert erp-alert-${statusMsg.type}`}>
                            {statusMsg.text}
                        </div>
                    </div>
                )}
            </div>

            <div className="erp-card" style={{ marginTop: 20 }}>
                <div className="card-header">
                    <span className="card-title">Risk Assessment Overview</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="erp-btn erp-btn-ghost" onClick={fetchRiskData}>
                            🔄 Refresh Data
                        </button>
                        <button
                            className="erp-btn erp-btn-primary"
                            onClick={triggerAutomation}
                            disabled={isTriggering || students.length === 0}
                        >
                            {isTriggering ? "🟡 Triggering..." : "🚀 Run Risk Workflow"}
                        </button>
                    </div>
                </div>

                <div className="erp-table-wrap">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Attendance</th>
                                <th>Avg Marks</th>
                                <th>Risk Status</th>
                                <th>Primary Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>Loading data...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>No student data found.</td></tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{student.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.email}</div>
                                        </td>
                                        <td>
                                            <span style={{ color: student.attendance < 75 ? 'var(--danger)' : 'inherit' }}>
                                                {student.attendance}%
                                            </span>
                                        </td>
                                        <td>{student.averageMarks}</td>
                                        <td>
                                            <span className={`erp-badge ${student.riskLevel === 'High' ? 'badge-red' :
                                                student.riskLevel === 'Medium' ? 'badge-amber' : 'badge-green'
                                                }`}>
                                                {student.riskLevel} Risk
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{student.reason}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
