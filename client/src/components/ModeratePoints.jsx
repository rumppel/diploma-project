import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserContext } from './UserProvider';

const ModeratePoints = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { userData, setUser } = useContext(UserContext);
    const [points, setPoints] = useState([]);
    const [showEditModalPoint, setShowEditModalPoint] = useState(false);
    const [editedPointData, setEditedPointData] = useState({});
    const [editedPointImage, setEditedPointImage] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);

    const [filteredPoints, setFilteredPoints] = useState([]);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isPostedFilter, setIsPostedFilter] = useState('');
    const [scheduleTypeFilter, setScheduleTypeFilter] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [existingImages, setExistingImages] = useState([]);

    const renderPoints = isFiltered => {
        const pointsToRender = isFiltered ? filteredPoints : points;
        return pointsToRender.map(point => (
            <tr key={point._id}>
                <td>{point.place_name.split(', Ukraine')[0]}</td>
                <td>{point.isPosted ? 'true' : 'false'}</td>
                <td>{point.scheduleType}</td>
                <td>{point.createdBy}</td>
                <td>{point.createdAt.split('T')[0]}</td>
                <td>{point.updatedAt ? `${point.updatedAt.split('T')[0]}  |  ${point.updatedAt.split('T')[1].split('.')[0]}` : `Hasn't been updated`}</td>
                <td className="d-flex">
                    <Button variant="primary flex-fill mx-1" onClick={() => handleEditClick(point)}>Edit</Button>
                    <Button variant="danger flex-fill mx-1" onClick={() => handleDeleteClick(point._id)}>Delete</Button>
                </td>
            </tr>
        ));
    };

    useEffect(() => {
        axios.get(`${backendUrl}/points`, { withCredentials: true })
            .then(result => {
                setPoints(result.data);
            })
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        const sortedPoints = points.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortBy] > b[sortBy] ? 1 : -1;
            } else {
                return a[sortBy] < b[sortBy] ? 1 : -1;
            }
        });
    
        // Фільтрація за пошуковим терміном у назві місця (place_name)
        const filteredPoints = sortedPoints.filter(point => {
            const searchString = searchTerm.toLowerCase();
            const placeName = point.place_name.toLowerCase();
            const createdBy = point.createdBy.toLowerCase();

            const createdAt = new Date(point.createdAt).getTime(); // Перетворення часу створення в мілісекунди

            // Перевірка чи містить назва місця, створювач або дата створення введений пошуковий термін
            const searchMatch = placeName.includes(searchString) || createdBy.includes(searchString);
            const dateMatch = (!startDate || createdAt >= startDate.getTime()) && (!endDate || createdAt <= endDate.getTime());
            return searchMatch && dateMatch;
            // Перевірка чи містить назва місця або створювач введений пошуковий термін
            //return placeName.includes(searchString) || createdBy.includes(searchString);
        });
    
        setFilteredPoints(filteredPoints);
        
        // Фільтрація за іншими критеріями
        const finalFilteredPoints = filterPoints(filteredPoints);
        setFilteredPoints(finalFilteredPoints);
    }, [points, searchTerm, startDate, endDate, sortBy, sortOrder, isPostedFilter, scheduleTypeFilter]);
    

    const filterPoints = (sortedPoints) => {
        return sortedPoints.filter(point => {
            if (isPostedFilter !== '' && point.isPosted !== (isPostedFilter === 'true')) {
                return false;
            }
            if (scheduleTypeFilter !== '' && point.scheduleType !== scheduleTypeFilter) {
                return false;
            }
            return true;
        });
    };

    const handleEditClick = (data) => {
        axios.get(`${backendUrl}/points/${data._id}`, { withCredentials: true })
            .then(result => {
                setSelectedPoint(result.data.point);
                setEditedPointData({ ...result.data.point });
                const imageArray = Object.values(result.data.images); 
                setEditedPointImage(imageArray);
                setExistingImages(result.data.images);
                //existingImages = result.data.images;
                console.log('imageArray', existingImages);
                console.log('edited point', result.data.point);
    
                // Додаємо код setShowEditModalPoint(true) в середині .then,
                // щоб він виконався після завершення оновлення стану.
                setShowEditModalPoint(true);
            })
            .catch(err => console.log(err));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedPointData(prevState => ({
            ...prevState,
            [name]: value
        }));

    };

    const handleEditSubmit = () => {
        const formData = new FormData();
        formData.append('place_name', editedPointData.place_name);
        formData.append('description', editedPointData.description);
        formData.append('isPosted', editedPointData.isPosted);
        formData.append('scheduleType', editedPointData.scheduleType);
        formData.append('customScheduleDate', editedPointData.customScheduleDate !== null ? editedPointData.customScheduleDate : '');
        formData.append('dateOfDestruction', editedPointData.dateOfDestruction);
        formData.append('city', editedPointData.city);
        formData.append('category', editedPointData.category);
        formData.append('typeOfWeapon', editedPointData.typeOfWeapon);
        formData.append('moderatedBy', userData.username);
        formData.append('source', editedPointData.source);
        existingImages.forEach((image) => {
            formData.append('imageIds', image._id);
        });
        editedPointImage.forEach((image) => {
            //const file = dataURLtoFile(image.dataUri, image.filename);
            formData.append('images', image);
        });

        console.log(existingImages);
        axios.put(`${backendUrl}/points/${selectedPoint._id}`, formData, { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } })
            .then(() => {
                const updatedPoints = points.map(point =>
                    point._id === selectedPoint._id ? editedPointData : point
                );
                setPoints(updatedPoints);
                setShowEditModalPoint(false);
            })
            .catch(err => console.log(err));
    }

    const handleDeleteClick = (dataId) => {
        axios.delete(`${backendUrl}/points/${dataId}`, { withCredentials: true })
            .then(() => {
                const updatedPoints = points.filter(point => point._id !== dataId);
                setPoints(updatedPoints);
            })
            .catch(err => console.log(err));
    };


    const handleFileChange = (e) => {
        const files = e.target.files;
        const updatedImages = [...editedPointImage]; // Копіюємо існуючі зображення
        
         for (let i = 0; i < files.length; i++) {
             const file = files[i];
             updatedImages.push(file);
         }
         setEditedPointImage(updatedImages); // Оновлюємо стан зображень
        console.log(updatedImages);
    };

    const handleDeleteImage = (index) => {
        console.log('delete image');
        const updatedImages = [...editedPointImage];
        updatedImages.splice(index, 1);
        setEditedPointImage(updatedImages);
        setExistingImages(updatedImages);
    };

    // useEffect(() => {
    //     axios.get(`${backendUrl}/getsession`, { withCredentials: true })
    //         .then(result => {
    //             const userData = result.data;
    //             setUser(userData);
    //         })
    //         .catch(err => console.log(err));
    // }, []);


    return (
        <>
            <Form.Control
                type="text"
                placeholder="Search by placename or createdBy."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
            />
            <Form.Group controlId="dateRange" className="mb-2">
                <Form.Label>Date Range</Form.Label>
                <div className="d-flex">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="form-control"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="End Date"
                        className="form-control"
                    />
                </div>
            </Form.Group>
            <Form as={Row} className="justify-content-between mb-1">
    <Form.Group as={Col} controlId="sortBy" xs={6} sm={6} md={3}>
        <Form.Label>Sort By</Form.Label>
        <Form.Control as="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="place_name">Placename</option>
            <option value="isPosted">Is Posted</option>
            <option value="scheduleType">Schedule type</option>
            <option value="createdBy">Created By</option>
            <option value="createdAt">Created At</option>
            <option value="updatedAt">Moderated At</option>
        </Form.Control>
    </Form.Group>

    <Form.Group as={Col} controlId="sortOrder" xs={6} sm={6} md={3}>
        <Form.Label>Sort Order</Form.Label>
        <Form.Control as="select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
        </Form.Control>
    </Form.Group>

    <Form.Group as={Col} controlId="isPostedFilter" xs={6} sm={6} md={3}>
        <Form.Label>Is Posted Filter</Form.Label>
        <Form.Control as="select" value={isPostedFilter} onChange={(e) => setIsPostedFilter(e.target.value)}>
            <option value="">All</option>
            <option value="true">True</option>
            <option value="false">False</option>
        </Form.Control>
    </Form.Group>

    <Form.Group as={Col} controlId="scheduleTypeFilter" xs={6} sm={6} md={3}>
        <Form.Label>Schedule Type Filter</Form.Label>
        <Form.Control as="select" value={scheduleTypeFilter} onChange={(e) => setScheduleTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </Form.Control>
    </Form.Group>
</Form>

            <h1>Moderate Points</h1>
            <div className="table-responsive">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Placename</th>
                        <th>Is Posted</th>
                        <th>Schedule type</th>
                        <th>Created By</th>
                        <th>Created At</th>
                        <th>Moderated At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>{renderPoints(isPostedFilter || scheduleTypeFilter || searchTerm || (startDate && endDate))}</tbody>
            </Table>
            </div>
            <Modal show={showEditModalPoint} onHide={() => setShowEditModalPoint(false)} dialogClassName="modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Point</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formPlacename">
                            <Form.Label>Placename</Form.Label>
                            <Form.Control type="text" name="place_name" value={editedPointData.place_name} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" name="description" value={editedPointData.description} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formIsPosted">
                            <Form.Label>Is Posted</Form.Label>
                            <Form.Control as="select" name="isPosted" value={editedPointData.isPosted} onChange={handleEditChange}>
                                <option value="true">true</option>
                                <option value="false">false</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formScheduleType">
                            <Form.Label>Schedule Type</Form.Label>
                            <Form.Control as="select" name="scheduleType" value={editedPointData.scheduleType} onChange={handleEditChange}>
                                <option value="low">low</option>
                                <option value="medium">medium</option>
                                <option value="high">high</option>
                                <option value="custom">custom</option>
                            </Form.Control>
                        </Form.Group>
                        {editedPointData.scheduleType === 'custom' && (
                            <Form.Group controlId="formCustomDate">
                                <Form.Label>Custom Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="customScheduleDate"
                                    value={editedPointData.customScheduleDate.split('T')[0]}
                                    onChange={handleEditChange}
                                />
                            </Form.Group>
                        )}
                        {editedPointData.dateOfDestruction && (
                        <Form.Group controlId="formDateOfDestruction">
                                <Form.Label>Incident Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateOfDestruction"
                                    value={editedPointData.dateOfDestruction.split('T')[0]}
                                    onChange={handleEditChange}
                                />
                            </Form.Group>
                        )}
                        <Form.Group controlId="formCity">
                            <Form.Label>City</Form.Label>
                            <Form.Control type="text" name="city" value={editedPointData.city} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Control type="text" name="category" value={editedPointData.category} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formWeapon">
                            <Form.Label>Weapon type</Form.Label>
                            <Form.Control type="text" name="typeOfWeapon" value={editedPointData.typeOfWeapon} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formImages">
                            <Form.Label>Images</Form.Label>
                            <Form.Control type="file" name="images" onChange={handleFileChange} multiple className='mb-3' />
                            {/* <div className="w-100"> */}
                            <Row >
                                {editedPointImage.map((image, index) => (
                                    <Col key={image._id} md={4} className="mb-4" >
                                        <div className="position-relative" >
                                            <img
                                                className="img-fluid"
                                                src={image.dataUrl}
                                                alt={`Image ${image._id}`}

                                                style={{ height: '200px', objectFit: 'contain' }}
                                            />
                                            <Button
                                                variant="btn btn-outline-danger"
                                                className="position-absolute top-0 end-0"
                                                onClick={() => handleDeleteImage(index)}
                                            >
                                                x
                                            </Button>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                            {/* </div> */}
                        </Form.Group>
                        <Form.Group controlId="formWeapon">
                            <Form.Label>Source</Form.Label>
                            <Form.Control type="text" name="source" value={editedPointData.source} onChange={handleEditChange} />
                        </Form.Group>
                    </Form>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleEditSubmit}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ModeratePoints;
