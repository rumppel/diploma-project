import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import ModerateUsers from './ModerateUsers';
import ModeratePoints from './ModeratePoints';

const Moderate = () => {
    const [showUsers, setShowUsers] = useState(true);

    const handleSwitch = () => {
        setShowUsers(prevShowUsers => !prevShowUsers);
    };

    return (
        <Container className="mt-5 page-content">
            <div className="mb-3 pt-4">
                <Button variant="primary" className="mr-2" onClick={handleSwitch}>
                    {showUsers ? 'Switch to Points' : 'Switch to Users'}
                </Button>
            </div>
            {showUsers ? <ModerateUsers /> : <ModeratePoints />}
        </Container>
    );
};

export default Moderate;
