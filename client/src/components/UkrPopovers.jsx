import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Popover, Form, Row, Col, Button, FormControl, FormGroup, FormLabel, Dropdown } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Окремий компонент Popover для модератора
export const MapPopoverModerator = ({ points, updateFilteredPoints, setIsFiltered }) => {
    const handleCategorySelect = (categoryId) => {
    setSelectedCategories(prevState => {
        if (prevState.includes(categoryId)) {
            return prevState.filter(id => id !== categoryId);
        } else {
            return [...prevState, categoryId];
        }
    });
};

const handleWeaponSelect = (categoryId) => {
    setSelectedWeapon(prevState => {
        if (prevState.includes(categoryId)) {
            return prevState.filter(id => id !== categoryId);
        } else {
            return [...prevState, categoryId];
        }
    });
};

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedWeapon, setSelectedWeapon] = useState([]);
    const [weapons, setWeapons] = useState([]);
    useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${backendUrl}/getpoints`);
            const data = response.data;
            let categories = [];
            let weapon = [];
            data.forEach(point => {
                if (!categories.includes(point.category)) {
                categories.push(point.category);
                }
                if (!weapon.includes(point.typeOfWeapon.toLowerCase())) {
                    weapon.push(point.typeOfWeapon.toLowerCase());
                    }
            });
            console.log(categories);
            setWeapons(weapon);
            setCategories(categories); // Припустимо, що setCategories це setter для вашого стану, що зберігає категорії
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    fetchCategories();
}, []);

    

    const [searchTerm, setSearchTerm] = useState('');
    const [isPostedFilter, setIsPostedFilter] = useState('true');
    const [scheduleTypeFilter, setScheduleTypeFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    // Функція для фільтрації points
    const filterPoints = () => {
        let filteredPoints = points.filter(point => {
            const searchString = searchTerm.toLowerCase();
            const placeName = point.place_name.toLowerCase();
            const category = point.category.toLowerCase();
            const createdBy = point.createdBy.toLowerCase();
            const weapon = point.typeOfWeapon.toLowerCase();
            const searchMatch = placeName.includes(searchString) || createdBy.includes(searchString);
            const isPostedMatch = isPostedFilter === '' || point.isPosted === (isPostedFilter === 'true');
            //const categoryMatch = category.includes(categoryFilter);
            const scheduleTypeMatch = scheduleTypeFilter === '' || point.scheduleType === scheduleTypeFilter;
            const createdAt = new Date(point.createdAt).getTime(); // Перетворення часу створення в мілісекунди
            const dateMatch = (!startDate || createdAt >= startDate.getTime()) && (!endDate || createdAt <= endDate.getTime());
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const weaponMatch = selectedWeapon.length === 0 || selectedWeapon.includes(weapon);
            return searchMatch && isPostedMatch && scheduleTypeMatch && dateMatch && categoryMatch && weaponMatch;
        });
        
        return filteredPoints;
    };

    useEffect(() => {
        // Оновлюємо маркери, коли змінюється filteredPoints
        const filtered = filterPoints();
        if (filtered.length > 0) {
            setIsFiltered(true);
        }
        updateFilteredPoints(filtered);
    }, [searchTerm, startDate, endDate, scheduleTypeFilter, isPostedFilter, selectedCategories, selectedWeapon]);

    const popoverModerator = (
        <Popover id="filter-popover" className='filter-popover'>
    <Form.Control
        type="text"
        placeholder="Search by placename or createdBy."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
    />

<Form as={Row} className="justify-content-between mb-1">
    <Form.Group  as={Col} controlId="isPostedFilter" className="mb-2">
        <Form.Label>Is Posted</Form.Label>
        <Form.Control as="select" value={isPostedFilter} onChange={(e) => setIsPostedFilter(e.target.value)}>
            <option value="">Default</option>
            <option value="true">True</option>
            <option value="false">False</option>
        </Form.Control>
    </Form.Group>

    <Form.Group  as={Col} controlId="scheduleTypeFilter" className="mb-2">
        <Form.Label>Schedule Type</Form.Label>
        <Form.Control as="select" value={scheduleTypeFilter} onChange={(e) => setScheduleTypeFilter(e.target.value)}>
            <option value="">Default</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </Form.Control>
    </Form.Group>
</Form>
    <Form.Group controlId="categoryDropdown" className="mb-2">
        <Form.Label>Category</Form.Label>
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="categoryDropdown" className="w-100">
                Select Category
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {categories.map(category => (
                    <Dropdown.Item key={category} onClick={() => handleCategorySelect(category)} className={selectedCategories.includes(category) ? 'selected-category' : 'dropdown-custom'}>
                        {category}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </Form.Group>

    <Form.Group controlId="weaponDropdown" className="mb-2">
        <Form.Label>Weapon</Form.Label>
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="weaponDropdown" className="w-100">
                Select Weapon
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {weapons.map(weapon => (
                    <Dropdown.Item key={weapon} onClick={() => handleWeaponSelect(weapon)} className={selectedWeapon.includes(weapon) ? 'selected-category' : 'dropdown-custom'}>
                        {weapon}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </Form.Group>

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
                className="form-control datepicker-l"
            />
            <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="form-control datepicker-r"
            />
        </div>
    </Form.Group>
</Popover>
    );
    return (
        <OverlayTrigger trigger="click" placement="top" overlay={popoverModerator} rootClose={true} className="filter-popover">
            <div>
                {/* Елементи фільтрації */}
                <Button variant="primary" style={{ width: '140px', position: 'absolute', bottom: '20px', left: '10px', zIndex: 1 }}>Filter</Button>
            </div>
        </OverlayTrigger>
    );
};

export const MapPopoverUser = ({ points, updateFilteredPoints, setIsFiltered }) => {

    const handleCategorySelect = (categoryId) => {
        setSelectedCategories(prevState => {
            if (prevState.includes(categoryId)) {
                return prevState.filter(id => id !== categoryId);
            } else {
                return [...prevState, categoryId];
            }
        });
    };
    
    const handleWeaponSelect = (categoryId) => {
        setSelectedWeapon(prevState => {
            if (prevState.includes(categoryId)) {
                return prevState.filter(id => id !== categoryId);
            } else {
                return [...prevState, categoryId];
            }
        });
    };
    
        const [selectedCategories, setSelectedCategories] = useState([]);
        const [categories, setCategories] = useState([]);
        const [selectedWeapon, setSelectedWeapon] = useState([]);
        const [weapons, setWeapons] = useState([]);
        useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${backendUrl}/getpoints`);
                const data = response.data;
                let categories = [];
                let weapon = [];
                data.forEach(point => {
                    if (!categories.includes(point.category)) {
                    categories.push(point.category);
                    }
                    if (!weapon.includes(point.typeOfWeapon.toLowerCase())) {
                        weapon.push(point.typeOfWeapon.toLowerCase());
                        }
                });
                setWeapons(weapon);
                setCategories(categories); // Припустимо, що setCategories це setter для вашого стану, що зберігає категорії
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
    
        fetchCategories();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);


    const filterPoints = () => {
        let filteredPoints = points.filter(point => {
            const searchString = searchTerm.toLowerCase();
            const placeName = point.place_name.toLowerCase();
            const weaponType = point.typeOfWeapon.toLowerCase();
            const searchMatch = placeName.includes(searchString) || weaponType.includes(searchString);
            const dateOfDestruction = new Date(point.dateOfDestruction).getTime(); // Перетворення часу створення в мілісекунди
            const dateMatch = (!startDate || dateOfDestruction >= startDate.getTime()) && (!endDate || dateOfDestruction <= endDate.getTime());
            const category = point.category.toLowerCase();
            const weapon = point.typeOfWeapon.toLowerCase();
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(category);
            const weaponMatch = selectedWeapon.length === 0 || selectedWeapon.includes(weapon);
            return searchMatch && dateMatch && categoryMatch && weaponMatch;
        });
        return filteredPoints;
    };

    useEffect(() => {
        // Оновлюємо маркери, коли змінюється filteredPoints
        const filtered = filterPoints();
        if (filtered.length > 0) {
            setIsFiltered(true);
        }
        updateFilteredPoints(filtered);
    }, [searchTerm, startDate, endDate, selectedCategories, selectedWeapon]);

    const popoverUser = (
        <Popover id="filter-popover" className='filter-popover'>
            <Form.Control
                type="text"
                placeholder="Search by placename or weapon."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
            />

<Form.Group controlId="categoryDropdown" className="mb-2">
        <Form.Label>Category</Form.Label>
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="categoryDropdown" className="w-100">
                Select Category
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {categories.map(category => (
                    <Dropdown.Item key={category} onClick={() => handleCategorySelect(category)} className={selectedCategories.includes(category) ? 'selected-category' : 'dropdown-custom'}>
                        {category}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </Form.Group>

    <Form.Group controlId="weaponDropdown" className="mb-2">
        <Form.Label>Weapon</Form.Label>
        <Dropdown>
            <Dropdown.Toggle variant="primary" id="weaponDropdown" className="w-100">
                Select Weapon
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {weapons.map(weapon => (
                    <Dropdown.Item key={weapon} onClick={() => handleWeaponSelect(weapon)} className={selectedWeapon.includes(weapon) ? 'selected-category' : 'dropdown-custom'}>
                        {weapon}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    </Form.Group>

            <Form.Group controlId="dateRange" className="justify-content-between mb-2">
                <Form.Label>Date Range</Form.Label>
                <div className="d-flex ">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className="form-control datepicker-l"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="End Date"
                        className="form-control datepicker-r"
                    />
                </div>
            </Form.Group>
        </Popover>
    );
    return (
        <OverlayTrigger trigger="click" placement="top" overlay={popoverUser}>
            <div>
                {/* Елементи фільтрації */}
                <Button variant="primary" style={{ width: '140px', position: 'absolute', bottom: '20px', left: '10px', zIndex: 1 }}>Filter</Button>
            </div>
        </OverlayTrigger>
    );
};