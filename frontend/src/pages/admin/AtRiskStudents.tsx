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
    const [isTriggering, setIsTriggering] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [webhookOutput, setWebhookOutput] = useState<string | null>(null);

    const webhookUrl =
        "https://myaidesigntools.app.n8n.cloud/webhook/773200c1-8b55-4b1d-abb7-24470cb36e5c";

    useEffect(() => {
        fetchRiskData();
    }, []);

    const fetchRiskData = async () => {
        try {
            setLoading(true);

            const [usersRes, enrollmentsRes, attendanceRes, gradesRes] =
                await Promise.all([
                    API.get("/users/"),
                    API.get("/enrollment/"),
                    API.get("/attendance/"),
                    API.get("/grades/")
                ]);

            const users = usersRes.data;
            const enrollments = enrollmentsRes.data;
            const attendance = attendanceRes.data;
            const grades = gradesRes.data;

            const riskList: StudentRiskData[] = enrollments
                .map((enr: any) => {
                    const user = users.find((u: any) => u.id === enr.student_id);
                    if (!user) return null;

                    const studentAttendance = attendance.filter(
                        (a: any) => a.enrollment_id === enr.id
                    );

                    const attPercent =
                        studentAttendance.length > 0
                            ? (studentAttendance.filter((a: any) => a.status).length /
                                studentAttendance.length) *
                            100
                            : 100;

                    const studentGrades = grades.filter(
                        (g: any) => g.enrollment_id === enr.id
                    );

                    const avgMarks =
                        studentGrades.length > 0
                            ? studentGrades.reduce(
                                (acc: number, curr: any) => acc + curr.marks,
                                0
                            ) / studentGrades.length
                            : 100;

                    let riskLevel: "High" | "Medium" | "Low" = "Low";
                    let reason = "Good Standing";

                    if (attPercent < 75 || avgMarks < 40) {
                        riskLevel = "High";
                        reason =
                            attPercent < 75
                                ? "Low Attendance"
                                : "Poor Academic Performance";
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
                })
                .filter(Boolean);

            setStudents(riskList);
        } catch (err) {
            console.error("Failed to fetch risk data", err);
        } finally {
            setLoading(false);
        }
    };

    const triggerAutomation = async () => {
        setIsTriggering(true);
        setStatusMsg(null);
        setWebhookOutput(null);

        const atRiskOnly = students.filter(s => s.riskLevel !== "Low");

        try {
            const response = await axios.post(webhookUrl, {
                event: "STUDENT_RISK_IDENTIFIED",
                timestamp: new Date().toISOString(),
                data: atRiskOnly
            });

            const resData = Array.isArray(response.data)
                ? response.data[0]
                : response.data;

            // Exact n8n path from screenshot: output[0].content[0].text
            const analysisText =
                resData?.output?.[0]?.content?.[0]?.text ||
                resData?.output?.[0]?.text ||
                resData?.analysis ||
                resData?.message ||
                resData?.text ||
                (typeof resData === "string" ? resData : null);

            if (analysisText) {
                setWebhookOutput(
                    typeof analysisText === "string"
                        ? analysisText
                        : JSON.stringify(analysisText, null, 2)
                );

                setStatusMsg({
                    type: "success",
                    text: "✅ Workflow executed successfully!"
                });
            } else {
                setStatusMsg({
                    type: "error",
                    text: "⚠️ Webhook returned empty response."
                });
            }
        } catch (error) {
            console.error("Webhook error:", error);
            setStatusMsg({
                type: "error",
                text: "❌ Failed to trigger n8n workflow."
            });
        } finally {
            setIsTriggering(false);
        }
    };

    return (
        <div className="erp-container">
            <div className="erp-card">
                <div className="card-header">
                    <span className="card-title">
                        🤖 AI Risk Automation
                    </span>
                </div>

                {statusMsg && (
                    <div style={{ padding: "16px" }}>
                        <div className={`erp-alert erp-alert-${statusMsg.type}`}>
                            {statusMsg.text}
                        </div>
                    </div>
                )}

                <div style={{ padding: "16px", display: "flex", gap: 10 }}>
                    <button
                        className="erp-btn erp-btn-primary"
                        onClick={triggerAutomation}
                        disabled={isTriggering}
                    >
                        {isTriggering
                            ? "🟡 Running Workflow..."
                            : "🚀 Run Risk Workflow"}
                    </button>

                    <button
                        className="erp-btn erp-btn-ghost"
                        onClick={fetchRiskData}
                        disabled={loading}
                    >
                        🔄 Sync Data
                    </button>
                </div>
            </div>

            {/* Webhook Output Interface */}
            {webhookOutput && (
                <div
                    className="erp-card"
                    style={{
                        marginTop: 24,
                        padding: 24,
                        background: "#f9fbff",
                        border: "1px solid #d6e4ff"
                    }}
                >
                    <h3 style={{ marginBottom: 16 }}>
                        📡 n8n Workflow Output
                    </h3>

                    <div
                        style={{
                            background: "#ffffff",
                            padding: 20,
                            borderRadius: 8,
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                            maxHeight: 400,
                            overflowY: "auto",
                            border: "1px solid #eee"
                        }}
                    >
                        {webhookOutput}
                    </div>
                </div>
            )}
        </div>
    );
}