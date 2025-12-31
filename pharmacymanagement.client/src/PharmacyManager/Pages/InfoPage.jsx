import React, { useState, useEffect } from 'react';
import styles from '../CSS_for_components/InfoPageStyle.module.css';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { getData, postData } from '../../SharedComponents/apiService';
import Modal from '../Components/ModalComponent';
import UpdateForm from '../Components/UpdateFormComponent';
import Select from 'react-select';
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";

const PharmacyManagement = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [expandedEvent, setExpandedEvent] = useState(null);
    const { setPageTitle } = usePageTitle();
    const [isUpdateModalVisible, setisUpdateModalVisible] = useState(false);
    const [eventToUpdate, setEventToUpdate] = useState(null);
    const [pharmacists, setPhamracist] = useState([])
    const [events, setEvents] = useState([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isEventConfirmModalOpen, setIsEventConfirmModalOpen] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });
    const [formData, setFormData] = useState({
        name: '',
        hcrNumber: '',
        address: '',
        contactNumbers: [],
        email: '',
        website: '',
        responsiblePharmacist: '',
        vatNumber: '',
        emergencyContacts: [''] 
    });

    // ---- Similarity helpers (Levenshtein + normalizer) ----
    const normalizeName = (s) => {
        if (!s) return "";
        return s
            .toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '') // strip punctuation
            .replace(/\s+/g, ' ');   // collapse spaces
    };

    const levenshtein = (a, b) => {
        const an = a.length, bn = b.length;
        if (an === 0) return bn;
        if (bn === 0) return an;
        const matrix = Array.from({ length: an + 1 }, () => new Array(bn + 1).fill(0));
        for (let i = 0; i <= an; i++) matrix[i][0] = i;
        for (let j = 0; j <= bn; j++) matrix[0][j] = j;
        for (let i = 1; i <= an; i++) {
            for (let j = 1; j <= bn; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, 
                    matrix[i][j - 1] + 1,     
                    matrix[i - 1][j - 1] + cost 
                );
            }
        }
        return matrix[an][bn];
    };

    const similarityScore = (s1, s2) => {
        const a = normalizeName(s1);
        const b = normalizeName(s2);
        if (!a && !b) return 1;
        if (!a || !b) return 0;
        const dist = levenshtein(a, b);
        return 1 - (dist / Math.max(a.length, b.length));
    };

    // returns the first similar event object or null
    const findSimilarEvent = (name, list, threshold = 0.8) => {
        if (!name || !Array.isArray(list) || list.length === 0) return null;
        for (const ev of list) {
            if (!ev.eventName) continue;
            const score = similarityScore(name, ev.eventName);
            if (score >= threshold) return { event: ev, score };
        }
        return null;
    };
    // -------------------------------------------------------

    const FetchEvents = async () => {
        try {
            const result = await getData("/manager/Info/Events");
            if (result) {
                setEvents(result)
            } else {
                console.warn("result is not an array")
            }
        } catch (err) {
            console.error("fetch Error ", err)
        }
    }
    useEffect(() => {
        const FetchPharmacyDetails = async () => {
            setLoading(true)
            try {
                const result = await getData("/manager/Info/PharmacyDetails");
                if (Array.isArray(result) && result.length > 0) {
                    const data = result[0]; // Extract the first object
                    setFormData({
                        businessID: data.businessID,
                        name: data.pharmacyName || '',
                        hcrNumber: data.hcrNumber || '',
                        address: data.physicalAddress || '',
                        email: data.emailAddress || '',
                        website: data.websiteurl || '',
                        vatNumber: data.vat || '',
                        emergencyContacts: data.emergencyContacts || ['']
                    });
                } else {
                    console.warn("result is empty or not an array");
                }
            } catch (err) {
                console.error("fetch Error ", err);
            } finally {
                setLoading(false)
            }
        };

        FetchPharmacyDetails();

        const FetchPharmacist = async () => {
            try {
                const result = await getData("/manager/Info/ActivePharmacists");
                if (result) {
                    setPhamracist(result)
                } else {
                    console.warn("result is not an array")
                }
            } catch (err) {
                console.error("fetch Error ", err)
            }
        }
        FetchPharmacist()
        FetchEvents()
    }, []);

    const [newEvent, setNewEvent] = useState({
        eventName: '',
        eventDate: '',
        eventDescription: ''
    });

    // validation error state for event form
    const [eventErrors, setEventErrors] = useState({
        eventName: '',
        eventDate: '',
        eventDescription: ''
    });

    useEffect(() => {
        setPageTitle('Pharmacy Admin');
        document.title = 'Administration | Pharmacy';
    }, [setPageTitle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsConfirmModalOpen(true);
    };
    const showOrderModal = () => {
        setisUpdateModalVisible(true);
    };

    const closeUpdateModal = () => {
        setisUpdateModalVisible(false);
    };

    const handleEmergencyContactChange = (index, value) => {
        const newEmergencyContacts = [...formData.emergencyContacts];
        newEmergencyContacts[index] = value;
        setFormData(prev => ({
            ...prev,
            emergencyContacts: newEmergencyContacts
        }));
    };

    const handleConfirmSubmit = async () => {
        setIsConfirmModalOpen(false);
        setLoading(true);
        const BusinessTable = {
            BusinessID: formData.businessID,
            PharmacyName: formData.name,
            Websiteurl: formData.website,
            VAT: formData.vatNumber,
            HCRNumber: formData.hcrNumber,
            EmailAddress: formData.email,
            PhysicalAddress: formData.address,
            EmergencyContacts: formData.emergencyContacts
        };
        try {
            const result = await postData("/manager/Info/UpdatePharmacyDetails", BusinessTable);
            if (result.success) {
                setToast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
                await FetchOrderDetails?.();
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const MAX_EVENT_WORDS = 100;

    const handleEventInputChange = (e) => {
        const { name, value } = e.target;

        // clear errors for the input being edited
        setEventErrors(prev => ({ ...prev, [name]: '' }));

        if (name === "eventDescription") {
            // Count words
            const words = value.trim().split(/\s+/).filter(Boolean);
            if (words.length > MAX_EVENT_WORDS) {
                // Prevent input if over limit
                return;
            }
        }
        setNewEvent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // validate inputs and similarity; returns true if valid
    const validateNewEvent = () => {
        const errors = {};
        if (!newEvent.eventName || !newEvent.eventName.trim()) {
            errors.eventName = "Event name is required.";
        }
        if (!newEvent.eventDate) {
            errors.eventDate = "Event date is required.";
        }
        if (!newEvent.eventDescription || !newEvent.eventDescription.trim()) {
            errors.eventDescription = "Event description is required.";
        } else {
            const words = newEvent.eventDescription.trim().split(/\s+/).filter(Boolean).length;
            if (words > MAX_EVENT_WORDS) {
                errors.eventDescription = `Event description must be ${MAX_EVENT_WORDS} words or less.`;
            }
        }

        setEventErrors(errors);

        if (Object.keys(errors).length > 0) return false;

        // similarity check (prevent near-duplicates before modal)
        const similar = findSimilarEvent(newEvent.eventName, events, 0.8);
        if (similar) {
            setEventErrors(prev => ({
                ...prev,
                eventName: `An event with a similar name already exists: "${similar.event.eventName}"`
            }));
            return false;
        }

        return true;
    };

    const handleConfirmAddEvent = async () => {
        setIsEventConfirmModalOpen(false);
        setLoading(true);

        // server-side safety check remains in case events changed since validation
        const similar = findSimilarEvent(newEvent.eventName, events, 0.8);
        if (similar) {
            setToast({
                visible: true,
                message: `An event with a similar name already exists: "${similar.event.eventName}"`,
                type: "warning",
                duration: 5000
            });
            setLoading(false);
            return;
        }

        const eventToAdd = {
            id: Date.now(),
            ...newEvent
        };
        try {
            const result = await postData("/manager/Info/AddNewEvent", newEvent);
            if (result.success) {
                setToast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
                await FetchEvents()
                // clear inputs after success
                setNewEvent({ eventName: '', eventDate: '', eventDescription: '' });
                setEventErrors({ eventName: '', eventDate: '', eventDescription: '' });
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteEvent = async (eventId) => {
        setLoading(true);
        try {
            const result = await postData('/manager/info/DeleteEvent', eventId)
            const record = events.find(x => x.eventsID === eventId)
            const name = record.eventName;
            const status = record.eventStatus === 'Active' ? "activated" : "deactivated"
            const mess = name + " has been " + status;
            if (result.success) {
                console.log(record)
                setToast({
                    visible: true,
                    message: mess,
                    type: "success",
                    duration: 3000
                });
                await FetchEvents()
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }

    };
    const handleAddEventSubmit = (e) => {
        e.preventDefault();
        // run validation + similarity check before showing confirmation modal
        if (validateNewEvent()) {
            setIsEventConfirmModalOpen(true);
        }
    };
    const handleUpdateEvent = async (formData) => {
        try {
            const result = await postData('/manager/Info/UpdateEvent', formData)
            if (result.success) {
                setToast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
                await FetchEvents()
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }

            closeUpdateModal()
        } catch (error) {
            console.error(error)
        }
    };
    const [search, setSearch] = useState("")
    const filteredEvents = events
        .filter((event) => event.eventName.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.eventName.localeCompare(b.eventName));

    // Get the full emergency contact objects based on their IDs
    const emergencyContactObjects = formData.emergencyContacts.map(id =>
        pharmacists.find(pharmacist => pharmacist.userID === id)
    );
    // Map pharmacists to options for the select input
    const pharmacistOptions = pharmacists.map(pharmacist => ({
        value: pharmacist.userID,
        label: `${pharmacist.name} ${pharmacist.surname}`,
        isDisabled: false // We'll handle disabling below
    }));
    return (
        <div className={styles.pharmacyManagement}>
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={styles.managementHeader}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'details' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Pharmacy Details
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'events' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        Manage Events
                    </button>
                </div>
            </div>

            {activeTab === 'details' && (
                <div className={styles.detailsSection}>
                    <form onSubmit={handleFormSubmit}>
                        <div className={styles.formGroup}>
                            <label>Pharmacy Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                maxLength={20}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>HCR Number</label>
                            <input
                                type="text"
                                name="hcrNumber"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={10}
                                value={formData.hcrNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Physical Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                maxLength={200}
                                rows={3}
                                required
                            />
                        </div>


                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Website URL</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>VAT Number</label>
                            <input
                                type="number"
                                name="vatNumber"
                                min={0}
                                max={100}
                                step={0.1}
                                value={formData.vatNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={styles.emergencyContactsSection}>
                            <h3>Responsible Contacts</h3>
                            <p>Select  Responsible Pharmacist:</p>

                            <div className={styles.emergencySelectors}>
                                <div className={styles.formGroup}>
                                    <label>Contact</label>
                                    <Select
                                        value={pharmacistOptions.find(opt => opt.value === formData.emergencyContacts[0]) || null}
                                        onChange={option => handleEmergencyContactChange(0, option ? option.value : '')}
                                        options={pharmacistOptions} // <-- No disabling logic needed
                                        placeholder="-- Select --"
                                        isSearchable
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Details'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'events' && (
                <div className={styles.eventsContainer}>
                    <div className={styles.addEventSection}>
                        <h2>Add New Event</h2>
                        <form onSubmit={handleAddEventSubmit}>
                            <div className={styles.formGroup}>
                                <label>Event Name</label>
                                <input
                                    type="text"
                                    name="eventName"
                                    value={newEvent.eventName}
                                    onChange={handleEventInputChange}
                                    maxLength={20}
                                    required
                                />
                                {eventErrors.eventName && (
                                    <div style={{ color: 'red', fontSize: '0.9em', marginTop: 6 }}>
                                        {eventErrors.eventName}
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Event Date</label>
                                <input
                                    type="date"
                                    name="eventDate"
                                    value={newEvent.eventDate}
                                    onChange={handleEventInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                {eventErrors.eventDate && (
                                    <div style={{ color: 'red', fontSize: '0.9em', marginTop: 6 }}>
                                        {eventErrors.eventDate}
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Event Description</label>
                                <textarea
                                    name="eventDescription"
                                    value={newEvent.eventDescription}
                                    onChange={handleEventInputChange}
                                    rows={6}
                                    required
                                />
                                <div style={{ fontSize: "0.95em", color: newEvent.eventDescription.trim().split(/\s+/).filter(Boolean).length >= MAX_EVENT_WORDS ? "red" : "#555" }}>
                                    {newEvent.eventDescription.trim().split(/\s+/).filter(Boolean).length} / {MAX_EVENT_WORDS} words
                                    {newEvent.eventDescription.trim().split(/\s+/).filter(Boolean).length >= MAX_EVENT_WORDS && " (Word limit reached)"}
                                </div>
                                {eventErrors.eventDescription && (
                                    <div style={{ color: 'red', fontSize: '0.9em', marginTop: 6 }}>
                                        {eventErrors.eventDescription}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? 'Adding...' : 'Add Event'}
                            </button>
                        </form>
                    </div>

                    <div className={styles.eventsListSection}>
                        <h2>Upcoming Events ({filteredEvents.length})</h2>
                        <div className={styles.eventSearch}>
                            <input placeholder="Search Event" onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        {filteredEvents.length === 0 ? (
                            <p>No upcoming events</p>
                        ) : (
                            <div className={styles.eventsList}>
                                {filteredEvents.map(event => (
                                    <div key={event.id} className={styles.eventCard}>
                                        <div className={styles.eventHeader}>
                                            <h3 className={styles.eventName} >{event.eventName}</h3>
                                            <h4
                                                className={styles.eventstatus}
                                                style={event.eventStatus !== 'Active' ? { color: 'red' } : {}}
                                            >
                                                {event.eventStatus}
                                            </h4>
                                            <span className={styles.eventDate}>{event.eventDate.split('T')[0]}</span>
                                        </div>
                                        <button
                                            className={styles.toggleButton}
                                            onClick={() => setExpandedEvent(
                                                expandedEvent === event.eventsID ? null : event.eventsID
                                            )}
                                        >
                                            {expandedEvent === event.eventsID ? 'Show Less' : 'Show More'}
                                        </button>
                                        {expandedEvent === event.eventsID && (
                                            <>
                                                <p className={styles.eventDescription}>
                                                    {event.eventDescription}
                                                </p>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteEvent(event.eventsID)}
                                                >
                                                    {event.eventStatus == 'Active' ? 'Cancel' : 'Activate'} Event
                                                </button>
                                                <button
                                                    className={styles.updatebutton}
                                                    onClick={() => {
                                                        showOrderModal()
                                                        setEventToUpdate(event)
                                                    }}

                                                >
                                                    Update Event
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Modal
                title="Update Event"
                isOpen={isUpdateModalVisible}
                onClose={closeUpdateModal}
                wide
            >
                <UpdateForm
                    onSubmit={handleUpdateEvent}
                    onCancel={closeUpdateModal}
                    eventToUpdate={eventToUpdate}
                />
            </Modal>
            <Modal
                title="Please confirm pharmacy details!"
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                footer={<>
                    <button className={styles["save-btn"]} onClick={handleConfirmSubmit}>Yes, Save</button>
                    <button className={styles["close-btn"]} onClick={() => setIsConfirmModalOpen(false)}>Cancel</button>
                </>}
            >
                <div className={styles["confirm"]}>
                    <ul>
                        <li><strong>Name:</strong> {formData.name}</li>
                        <li><strong>HCR Number:</strong> {formData.hcrNumber}</li>
                        <li><strong>Address:</strong> {formData.address}</li>
                        <li><strong>Email:</strong> {formData.email}</li>
                        <li><strong>Website:</strong> {formData.website}</li>
                        <li><strong>VAT Number:</strong> {formData.vatNumber}</li>
                        <li>
                            <strong>Responsible Pharmacist:</strong>
                            <ul style={{ marginLeft: '3em' }}>
                                {(() => {
                                    const id = formData.emergencyContacts[0];
                                    const p = pharmacists.find(ph => ph.userID === id);
                                    return p ? (
                                        <li key={id}>{p.name} {p.surname} ({p.phonenumber})</li>
                                    ) : null;
                                })()}
                            </ul>
                        </li>
                    </ul>

                </div>
            </Modal>
            <Modal
                title="Please confirm event details!"
                isOpen={isEventConfirmModalOpen}
                onClose={() => setIsEventConfirmModalOpen(false)}
                footer={
                    <>
                        <button className={styles["save-btn"]} onClick={handleConfirmAddEvent}>Yes, Add Event</button>
                        <button className={styles["close-btn"]} onClick={() => setIsEventConfirmModalOpen(false)}>Cancel</button>
                    </>
                }
            >
                <div className={styles["confirm"]}>
                    <ul>
                        <li><strong>Event Name:</strong> {newEvent.eventName}</li>
                        <li><strong>Event Date:</strong> {newEvent.eventDate}</li>
                        <li><strong>Description:</strong> {newEvent.eventDescription}</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default PharmacyManagement;