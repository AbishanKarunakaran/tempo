import React from 'react';

export const FormField = ({ label, required, children }) => {
    return (
        <div className="form-group">
            <label>
                {label} {required && <span className="required">*</span>}
            </label>
            {children}
        </div>
    );
};
