import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import axios from 'axios';

const Profile = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [userData, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [showModal, setShowModal] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedData({ ...userData }); // Копіюємо userData в editedData
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Відправка даних на сервер для збереження, наприклад:
        axios.post(`${backendUrl}/updateprofile`, editedData, { withCredentials: true })
            .then(() => {
                setIsEditing(false);
                setShowModal(false);
                // Оновлення даних користувача після збереження на сервері
                setUser({ ...editedData });
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        axios.get(`${backendUrl}/getsession`, { withCredentials: true })
            .then(result => {
                const userData = result.data;
                setUser(userData);
            })
            .catch(err => console.log(err));
    }, []);

    return (
        <Container className="mt-4" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Row className='w-100 justify-content-center'>
          <Col xs={12} md={8} lg={6}>
            <Card className='mb-5'>
              <Card.Body>
                <Card.Title>Profile</Card.Title>
                {userData ?
                  <>
                    <Card.Text>
                      <strong>Username:</strong> {userData.username} <br />
                      <strong>Role:</strong> {userData.role}<br />
                      <strong>E-mail:</strong> {userData.email}<br />
                      <strong>City:</strong> {userData.city ? userData.city : "City is not settled"}<br />
                      <strong>District:</strong> {userData.district ? userData.district : "District is not settled"}<br/>
                    </Card.Text>
                    <Button variant="primary" onClick={handleEdit}>Edit data</Button>
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                      <Modal.Header closeButton>
                        <Modal.Title>Edit Profile</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <EditForm editedData={editedData} handleChange={handleChange} handleSubmit={handleSubmit} setIsEditing={setIsEditing} />
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="primary" onClick={handleSubmit}>Save Changes</Button>
                      </Modal.Footer>
                    </Modal>
                  </>
                  : <Card.Text>Loading...</Card.Text>
                }
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='w-100 justify-content-center'>
          <Col xs={12} md={8} lg={6} className="text-center">
            <p>You can follow new points added in your city through the Telegram bot</p>
            {userData && <a className="primary" href={`https://t.me/ukraineinteractivemap_bot?start=${userData.username}`}>Telegram</a>}
          </Col>
        </Row>
      </Container>
    );
};

const EditForm = ({ editedData, handleChange, handleSubmit, setIsEditing }) => {
    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" name="username" defaultValue={editedData.username} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" defaultValue="" onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formEmail">
                <Form.Label>E-mail</Form.Label>
                <Form.Control type="email" name="email" defaultValue={editedData.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formCity">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" name="city" defaultValue={editedData.city} onChange={handleChange} />
            </Form.Group>
            <Form.Group controlId="formDistrict">
                <Form.Label>District</Form.Label>
                <Form.Control type="text" name="district" defaultValue={editedData.district} onChange={handleChange} />
            </Form.Group>
            {/* <div className="mt-3">
                <Button variant="primary" className='w-100' type="submit">Save</Button>
            </div> */}
            {/* <div className="mt-2">
                <Button variant="secondary" className='w-100' onClick={() => setIsEditing(false)}>Cancel</Button>
            </div> */}
        </Form>
    );
};

export default Profile;
