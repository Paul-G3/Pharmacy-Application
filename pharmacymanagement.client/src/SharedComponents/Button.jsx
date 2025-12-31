// src/SharedComponents/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import ButtonStyles from '../SharedComponentsStyles/ButtonStyle.module.css';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    isLoading = false,
    ...props
}) => {
    return (
        <button
            type={type}
            className={`${ButtonStyles.button} ${ButtonStyles[variant]}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    variant: PropTypes.oneOf(['primary', 'outline', 'danger']),
    isLoading: PropTypes.bool,
};

export default Button;