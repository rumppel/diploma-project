import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ModerateUsers = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [users, setUsers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editedUserData, setEditedUserData] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('asc');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    const renderUsers = isFiltered => {
        const usersToRender = isFiltered ? filteredUsers : users;
        return usersToRender.map(user => (
            <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.createdAt}</td>
                <td className="d-flex">
                    <Button variant="primary flex-fill mx-1" onClick={() => handleEditClick(user)}>Edit</Button>
                    <Button variant="danger flex-fill mx-1" onClick={() => handleDeleteClick(user._id)}>Delete</Button>
                </td>
            </tr>
        ));
    };

    useEffect(() => {
        const sortedUsers = users.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortBy] > b[sortBy] ? 1 : -1;
            } else {
                return a[sortBy] < b[sortBy] ? 1 : -1;
            }
        });
    
        // Фільтрація за пошуковим терміном у назві місця (place_name)
        const filteredUsers = sortedUsers.filter(user => {
            const searchString = searchTerm.toLowerCase();
            const username = user.username.toLowerCase();

            const createdAt = new Date(user.createdAt).getTime(); // Перетворення часу створення в мілісекунди

            // Перевірка чи містить назва місця, створювач або дата створення введений пошуковий термін
            const searchMatch = username.includes(searchString);
            const dateMatch = (!startDate || createdAt >= startDate.getTime()) && (!endDate || createdAt <= endDate.getTime());
            return searchMatch && dateMatch;
            // Перевірка чи містить назва місця або створювач введений пошуковий термін
            //return placeName.includes(searchString) || createdBy.includes(searchString);
        });
    
        setFilteredUsers(filteredUsers);
        
    }, [users, searchTerm, startDate, endDate, sortBy, sortOrder]);
    

    useEffect(() => {
        axios.get(`${backendUrl}/users`, { withCredentials: true })
            .then(result => {
                setUsers(result.data);
            })
            .catch(err => console.log(err));
    }, []);

    const handleEditClick = (data) => {
            setSelectedUser(data);
            setEditedUserData({ ...data });
            setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
            setEditedUserData(prevState => ({
                ...prevState,
                [name]: value
            }));
    };

    const handleEditSubmit = () => {
            axios.put(`${backendUrl}/users/${selectedUser._id}`, editedUserData, { withCredentials: true })
                .then(() => {
                    const updatedUsers = users.map(user =>
                        user._id === selectedUser._id ? editedUserData : user
                    );
                    setUsers(updatedUsers);
                    setShowEditModal(false);
                })
                .catch(err => console.log(err));
    }

    const handleDeleteClick = (dataId) => {
            axios.delete(`${backendUrl}/users/${dataId}`, { withCredentials: true })
                .then(() => {
                    const updatedUsers = users.filter(user => user._id !== dataId);
                    setUsers(updatedUsers);
                })
                .catch(err => console.log(err));
    };

    return (
        <>
        <Form.Control
                type="text"
                placeholder="Search by username or createdBy."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
            />
            
            <Form as={Row} className="justify-content-between mb-1">
                <Form.Group as={Col} controlId="sortBy">
                    <Form.Label>Sort By</Form.Label>
                    <Form.Control as="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="username">Username</option>
                        <option value="email">E-mail</option>
                        <option value="createdAt">Created At</option>
                    </Form.Control>
                </Form.Group>

                <Form.Group as={Col} controlId="sortOrder">
                    <Form.Label>Sort Order</Form.Label>
                    <Form.Control as="select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group as={Col} controlId="dateRange" className="mb-0">
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

            </Form>
            <h1>Moderate Users</h1>
            <div className="table-responsive">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {renderUsers(searchTerm || (startDate && endDate))}
                </tbody>
            </Table>
            </div>
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} dialogClassName="modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" name="username" value={editedUserData.username} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" name="email" value={editedUserData.email} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formRole">
                            <Form.Label>Role</Form.Label>
                            <Form.Control as="select" name="role" value={editedUserData.role} onChange={handleEditChange}>
                                <option value="user">user</option>
                                <option value="moderator">moderator</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formCity">
                            <Form.Label>City</Form.Label>
                            <Form.Control type="text" name="city" value={editedUserData.city} onChange={handleEditChange} />
                        </Form.Group>
                        <Form.Group controlId="formDistrict">
                            <Form.Label>District</Form.Label>
                            <Form.Control type="text" name="district" value={editedUserData.district} onChange={handleEditChange} />
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

export default ModerateUsers;
