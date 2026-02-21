import { useEffect } from "react";
import "./ConfirmModal.css";
import { AlertTriangle } from "lucide-react";

interface Props {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ title, message, onConfirm, onCancel }: Props) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    <AlertTriangle size={36} color="var(--danger)" />
                </div>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="modal-btn-confirm" onClick={onConfirm}>
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
