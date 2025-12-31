// components/Modal.js
import React from 'react';
import medmodal from '../CSS_for_components/ModalStyle.module.css';

const Modal = ({ title, isOpen, style, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className={medmodal["modal-overlay"]}>
            <div className={medmodal["modal"]} style={style}>
                <div className={medmodal["modal-header"]}>
                    <h2>{title}</h2>
                </div>
                <div className={medmodal["modal-content"]}>
                    {children}
                </div>
                {footer && (
                    <div className={medmodal["modal-footer"]}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;