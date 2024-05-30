import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import AlertComponent from './AlertComponent';
import axios from 'axios';

const Profile = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [userData, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [cityOptions, setCityOptions] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);

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

    const handleCityChange = (event) => {
      const { value } = event.target;
      fetchCityOptions(value);
      setEditedData((prevState) => ({
          ...prevState,
          city: value,
      }));
  };

    const handleSubmit = (e) => {
      const errors = [];
      const usernamePattern = /^[a-zA-Z_]+$/;
      if (editedData.city && !cityOptions.some((option) => option.name === editedData.city)) {
        errors.push('Please select a city from the list.');
    }

    if (editedData.telegram) {
        if (!editedData.city){
          errors.push('Please choose city before entering Telegram.');
        }
        if (!usernamePattern.test(editedData.telegram)) {
            errors.push('Please enter a valid telegram: user_name.');
        }
    }
    setErrorMessages(errors);
    if (errors.length > 0) {
      return;
  }
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

    const fetchCityOptions = async (inputValue) => {
      try {
          const response = await axios.get(`${backendUrl}/cities?query=${inputValue}`);
          setCityOptions(response.data);
      } catch (error) {
          console.error('Error fetching city options:', error);
      }
  };

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
                      <strong>City:</strong> {userData.city ? userData.city : "City is not chosen"}<br />
                      <strong>Telegram:</strong> {userData.telegram ? userData.telegram : "Telegram is not entered"}<br/>
                    </Card.Text>
                    <Button variant="primary" onClick={handleEdit}>Edit data</Button>
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                      <Modal.Header closeButton>
                        <Modal.Title>Edit Profile</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <EditForm editedData={editedData} handleChange={handleChange} handleCityChange={handleCityChange} handleSubmit={handleSubmit} setIsEditing={setIsEditing} errorMessages={errorMessages} cityOptions={cityOptions} />
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
        {userData ?
          <Col xs={12} md={8} lg={6} className="text-center">
            <p>You can follow new points added in your city through the Telegram bot</p>
            {userData.telegram ? null : <Button variant="primary" onClick={handleEdit}>Add telegram</Button>}
            {userData.telegram && <a className="primary" href={`https://t.me/ukraineinteractivemap_bot?start=${userData.telegram}`}>Telegram</a>}
          </Col>
          : null}
        </Row>
      </Container>
    );
};

const EditForm = ({ editedData, handleChange, handleCityChange, handleSubmit, setIsEditing, errorMessages, cityOptions }) => {
    return (
        <Form onSubmit={handleSubmit}>
          <AlertComponent errorMessages={errorMessages} />
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
            <Form.Control
                type="text"
                name="city"
                placeholder="Enter City"
                className={`form-control ${errorMessages.includes('Please select a city from the list.') ? 'is-invalid' : ''}`}
                list="cityOptions"
                onChange={handleCityChange}
                value={editedData.city}
                autoComplete="off"
            />
            <datalist id="cityOptions">
                {cityOptions.map((option, index) => (
                    <option key={index} value={option.name} />
                ))}
            </datalist>

            {cityOptions.length > 0 && (
                <div className="dropdown">
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {cityOptions.map((option, index) => (
                            <li key={index} className="dropdown-item" onClick={() => setCity(option.name)}>
                                {option.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Form.Group>
            <Form.Group controlId="formTelegram">
                <Form.Label>Telegram</Form.Label>
                <Form.Control type="text" name="telegram" defaultValue={editedData.telegram} onChange={handleChange} 
                className={`form-control ${errorMessages.includes('Please choose city before entering Telegram.') || errorMessages.includes('Please enter a valid telegram: user_name.')  ? 'is-invalid' : ''}`}
                />
            </Form.Group>
        </Form>
    );
};

export default Profile;
