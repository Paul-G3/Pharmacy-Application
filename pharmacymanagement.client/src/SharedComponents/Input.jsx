// src/SharedComponents/Input.jsx
import React from 'react';
import PropTypes from 'prop-types';
import InputStyles from '../SharedComponentsStyles/InputStyle.module.css';

const Input = ({ label, type = 'text', error, ...props }) => {
    return (
        <div className={InputStyles.inputGroup}>
            {label && <label className={InputStyles.label}>{label}</label>}
            <input
                type={type}
                className={`${InputStyles.input} ${error ? InputStyles.error : ''}`}
                {...props}
            />
            {error && <span className={InputStyles.errorMessage}>{error.message}</span>}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.string,
    error: PropTypes.object,
};

export default Input;