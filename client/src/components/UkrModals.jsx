// Modals.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, FormControl, FormGroup, FormLabel, Carousel, Alert } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import AlertComponent from './AlertComponent';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
// Модальне вікно для додавання точки
export const ModalAddPoint = ({ userData, formData, setFormData, showModal, selectedPoint, setSelectedPoint, setShowModal, setMarkerData }) => {
    const [errorMessages, setErrorMessages] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [specifiedSourceLink, setSpecifiedSourceLink] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, images: files });
    };


    const handleSaveMarker = async () => {
        const errors = [];

        if (formData.images.length === 0) {
            errors.push('Please select at least one image.');
        }

        if (!formData.dateOfDestruction) {
            errors.push('Please select an incedent date.');
        }

        if (!selectedSource) {
            errors.push('Please select a source.');
        }
        const urlPattern = new RegExp(
            '^(https?:\\/\\/)' + // Протокол (https або http)
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // Доменне ім'я
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP-адреса (v4)
            '(\\:\\d+)?' + // Порт (необов'язковий)
            '(\\/[-a-z\\d%_.~+]*)*' + // Шлях (необов'язковий)
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // Запит (необов'язковий)
            '(\\#[-a-z\\d_]*)?$', // Фрагмент якоря (необов'язковий)
            'i' // Регістронезалежний
          );
        if (specifiedSourceLink) {
            let l = urlPattern.test(specifiedSourceLink);
            if (!urlPattern.test(specifiedSourceLink)) {
                errors.push('Specified source must be a valid URL.');
            }
        }
        setErrorMessages(errors);

        // Якщо є помилки, не відправляти запит
        if (errors.length > 0) {
            return;
        }
        try {
            const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedPoint.lng},${selectedPoint.lat}.json?access_token=${mapboxToken}`, { withCredentials: false });
            const data = response.data;
            const placeName = data.features[0].place_name;
            const contextPlace = data.features[0].context.find(context => context.id.includes('place'));
            const city = contextPlace ? contextPlace.text || 'Unknown' : 'Unknown';
            const category = formData.category;
            saveMarkerToDatabase(selectedPoint.lng, selectedPoint.lat, placeName, city, userData.username, formData);
        } catch (error) {
            console.error('Помилка при отриманні додаткових даних з API MapBox:', error);
        }
        setSelectedPoint(null);
        setShowModal(false);
        setMarkerData(null);
    };

    const saveMarkerToDatabase = async (longitude, latitude, place_name, city, createdBy, formData) => {

        const data = new FormData();
        data.append('longitude', longitude);
        data.append('latitude', latitude);
        data.append('place_name', place_name);
        data.append('city', city);
        data.append('createdBy', createdBy);
        data.append('category', formData.category);
        data.append('description', formData.description);
        const typeOfWeapon = formData.typeOfWeapon || 'Unknown';
        data.append('typeOfWeapon', typeOfWeapon);
        data.append('dateOfDestruction', formData.dateOfDestruction);
        const sourceValue = selectedSource === 'specified' ? specifiedSourceLink : selectedSource === 'userPhoto' ? `Photo by ${createdBy}` : 'Unknown';
        data.append('source', sourceValue);
        // Додавання файлів до formData
        for (const file of formData.images) {
            data.append('images', file);
        }

        try {

            const response = await axios.post(`${backendUrl}/addpoint`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Помилка при додаванні маркера:', error);
            // Можна вивести помилку або виконати інші дії при неуспішному запиті
        }
    };

    return (<>
    <AlertComponent errorMessages={errorMessages} />
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Add Point</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <FormGroup>
                        <FormLabel>Category (optional)</FormLabel>
                        <FormControl
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Description (optional)</FormLabel>
                        <FormControl
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Type of Weapon (optional)</FormLabel>
                        <FormControl
                            type="text"
                            name="typeOfWeapon"
                            value={formData.typeOfWeapon}
                            onChange={handleInputChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Images</FormLabel>
                        <FormControl
                            type="file"
                            name="images"
                            multiple
                            onChange={handleImageChange}
                            className={`form-control ${errorMessages.includes('Please select at least one image.') ? 'is-invalid' : ''}`}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Incident date</FormLabel>
                        <FormControl
                            type="date"
                            name="dateOfDestruction"
                            value={formData.dateOfDestruction}
                            onChange={handleInputChange}
                            className={`form-control ${errorMessages.includes('Please select a date of destruction.') ? 'is-invalid' : ''}`}
                            required
                        />
                    </FormGroup>
                </Form>
                <Form>
                    <FormGroup>
                        <FormLabel>Source</FormLabel>
                        <Form.Select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value)}
                            className={`form-control ${errorMessages.includes('Please select a source.') ? 'is-invalid' : ''}`}
                        >
                            <option value="">Select source</option>
                            <option value="specified">Specified Source</option>
                            <option value="userPhoto">User Photo</option>
                            <option value="unknown">Unknown Source</option>
                        </Form.Select>
                    </FormGroup>
                </Form>
                {selectedSource === 'specified' && (
        <FormGroup>
            <FormLabel>Specified Source Link</FormLabel>
            <FormControl
                type="text"
                value={specifiedSourceLink}
                className={`form-control ${errorMessages.includes('Specified source must be a valid URL.') ? 'is-invalid' : ''}`}
                onChange={(e) => setSpecifiedSourceLink(e.target.value)}
            />
        </FormGroup>
    )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveMarker}>
                    Add Point
                </Button>
            </Modal.Footer>
        </Modal></>
    );
};

// Модальне вікно для відображення деталей точки
export const ModalPointDetails = ({ userData, markerData, showMarkerModal, setShowMarkerModal, handleRelocateClick }) => {
    // Стейт та функції для відображення деталей точки
    // ...

    const [showFullDescription, setShowFullDescription] = useState(false);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };



    return (
        <Modal className='modal' show={showMarkerModal} onHide={() => setShowMarkerModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Point</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {markerData && (
                    <>
                        <Carousel className='carousel-dark mb-3' style={{ height: '400px' }}>
                            {markerData.images.map((image) => (
                                <Carousel.Item key={image.filename}>
                                    <img className="d-block w-100 rounded" src={image.dataUrl} alt={`Image ${image._id}`} style={{ height: '400px', objectFit: 'contain' }} />
                                </Carousel.Item>
                            ))}
                        </Carousel>
                        <div className="details-container">
                            <h5 className="mb-3">Details</h5>
                            <p className="mb-1"><strong>City:</strong> {markerData.point.city}</p>
                            <p className="mb-1"><strong>Place name:</strong> {markerData.point.place_name}</p>
                            <p className="mb-1"><strong>Category:</strong> {markerData.point.category}</p>
                            <p className="mb-1"><strong>Type of weapon:</strong> {markerData.point.typeOfWeapon}</p>
                            <p className="mb-1"><strong>Summary:</strong></p>
                            {markerData.point.description ? (
                                <div className="mb-1">
                                    {showFullDescription ? (
                                        <p className="m-0">{markerData.point.description}</p>
                                    ) : (
                                        <p className="m-0">{markerData.point.description.slice(0, 100)}...</p>
                                    )}
                                    <button className="btn btn-link p-0 m-0" onClick={toggleDescription}>
                                        {showFullDescription ? 'Show Less' : 'Show More'}
                                    </button>
                                </div>
                            ) : 'Summary is empty'}
                            <p className="mb-1"><strong>Incident date:</strong> {markerData.point.dateOfDestruction.split('T')[0]}</p>
                            <p className="mb-1"><strong>Source: </strong>
                                {markerData.point.source.includes('http') || markerData.point.source.includes('https') ?
                                    <a href={markerData.point.source} target="_blank" rel="noopener noreferrer">{markerData.point.source}</a> :
                                    markerData.point.source}
                            </p>
                        </div>

                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {userData && userData.role === 'moderator' ?
                    <Button variant="secondary" onClick={handleRelocateClick}>
                        Relocate
                    </Button>
                    : null}
                <Button variant="secondary" onClick={() => setShowMarkerModal(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
