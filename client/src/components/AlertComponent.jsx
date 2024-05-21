import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

const AlertComponent = ({ errorMessages }) => {
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (errorMessages.length > 0) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 3000); // Зникнення Alert після 3 секунд
            
            // Очищення таймера при зміні помилок або розмірі масиву
            return () => clearTimeout(timer);
        } else {
            setShowAlert(false); // При пустому масиві помилок ховаємо Alert
        }
    }, [errorMessages]);

    return (
        <div className={`alert-wrapper ${showAlert ? 'show' : 'hide'}`}>
            {showAlert && (
                <Alert variant="danger" className="alert">
                    {errorMessages.map((message, index) => (
                        <p key={index}>{message}</p>
                    ))}
                </Alert>
            )}
        </div>
    );
};

export default AlertComponent;