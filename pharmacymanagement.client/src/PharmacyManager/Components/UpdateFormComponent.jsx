// components/OrderForm.js
import React, { useState, useMemo, useEffect } from "react";
import medmodal from "../CSS_for_components/ModalStyle.module.css";
import UpdateModal from "../CSS_for_components/UpdateModal.module.css";

export default function OrderForm({ onSubmit, onCancel,eventToUpdate }) {
    const [form, setForm] = useState({
        eventsID: eventToUpdate?.eventsID ||0,
        eventName: eventToUpdate?.eventName || '',
        eventDate: eventToUpdate?.eventDate || '',
        eventDescription: eventToUpdate?.eventDescription || ''
    });

    useEffect(() => {
        if (eventToUpdate) {
            setForm({
                eventsID: eventToUpdate?.eventsID || 0,
                eventName: eventToUpdate.eventName || '',
                eventDate: eventToUpdate.eventDate || '',
                eventDescription: eventToUpdate.eventDescription || ''
            });
        }
    }, [eventToUpdate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        onSubmit(form);
    };

    return (
        <div className={UpdateModal["update-form"]}>
              <div className={UpdateModal["inputContainer"] }>
                <label htmlFor="eventName" className={UpdateModal["eventLabels"]}>Event Name</label>
                <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    value={form.eventName}
                    onChange={handleChange}
                    placeholder="Event Name"
                    required
                />
              </div>

            <div className={UpdateModal["inputContainer"]}>
                    <label htmlFor="eventDate" className={UpdateModal["eventLabels"]}>Event Date</label>
                    <input
                        type="date"
                        id="eventDate"
                        name="eventDate"
                        value={form.eventDate.split('T')[0]}
                        onChange={handleChange}
                        required
                    />
                </div>

            <div className={UpdateModal["inputContainer"]}>
                    <label htmlFor="eventDescription" className={UpdateModal["eventLabels"]}>Event Description</label>
                    <textarea
                        id="eventDescription"
                        name="eventDescription"
                        value={form.eventDescription}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Event Description"
                        required
                    />
                </div>
            <div className={medmodal["modal-footer"]}>
                <button
                    type="button"
                    className={medmodal["close-btn"]}
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className={medmodal["save-btn"]}
                    onClick={handleSubmit}
                >
                    Update Event
                </button>
            </div>
        </div>
    );
}
