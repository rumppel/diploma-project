import React, { useState, useEffect, useContext } from 'react';
import MapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button, Modal, Form, FormControl, FormGroup, FormLabel, Carousel } from 'react-bootstrap';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { MapPopoverModerator, MapPopoverUser } from './UkrPopovers'; // Додані окремі компоненти Popover
import { ModalAddPoint, ModalPointDetails } from './UkrModals';
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
const backendUrl = import.meta.env.VITE_BACKEND_URL;
import { UserContext } from './UserProvider';

// Основний компонент
const UkraineMap = () => {

    const [viewport, setViewport] = useState({
        width: '100%',
        height: 'calc(100vh - 60px)',
        initialViewState: {
            latitude: 48.538994,
            longitude: 31.244384,
            zoom: 5.3,
        }
    });
    const { userData, setUser } = useContext(UserContext);
    const [showModal, setShowModal] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [isAddingPoint, setIsAddingPoint] = useState(false);

    const [showMarkerModal, setShowMarkerModal] = useState(false);
    const [markerData, setMarkerData] = useState(null);


    const [points, setPoints] = useState([]);
    const [filteredPoints, setFilteredPoints] = useState([]);

    const [isRelocating, setIsRelocating] = useState(false);

    const [formData, setFormData] = useState({
        category: '',
        description: '',
        typeOfWeapon: '',
        images: [],
        dateOfDestruction: '',
        source: '',
    });

    const [isFiltered, setIsFiltered] = useState(false);

    // useEffect(() => {
    //         axios.get(`${backendUrl}/getsession`, { withCredentials: true })
    //             .then(result => {
    //                 const userData = result.data;
    //                 setUser(userData);
    //             })
    //             .catch(err => console.log(err));
    //     }, []);
        
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${backendUrl}/getpoints`);
                const data = response.data;
                setPoints(data);
                // Фільтруємо маркери зі списку отриманих даних, які мають поле isPosted: true
                const postedMarkers = data.filter(marker => marker.isPosted);
                setMarkers(postedMarkers);
            } catch (error) {
                console.error('Помилка при отриманні маркерів з бази даних:', error);
            }
        };

        fetchData();
    }, []);
    // Функція для оновлення filteredPoints
    const updateFilteredPoints = (filtered) => {
        setFilteredPoints(filtered);
    };

    useEffect(() => {
        // Оновлюємо маркери, коли змінюється filteredPoints
        setFilteredPoints(filteredPoints);
    }, [filteredPoints]);


    const renderPoints = () => {
        const pointsToRender = isFiltered ? filteredPoints : markers;
        return pointsToRender.map((m, i) => (
            <Marker color="rgba(202, 4, 4)" key={i} longitude={m.longitude} latitude={m.latitude}
                draggable={isRelocating}
                onDragEnd={handleMarkerDragEnd}
                onClick={() => handleMarkerClick(m)
                }> <div className='single-marker'></div>
            </Marker>
        ));
    };


    const handleClick = async ({ lngLat }) => {
        if (isAddingPoint) {
            const { lng, lat } = lngLat;
            setSelectedPoint({ lng, lat });
            const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`, { withCredentials: false });
            const data = response.data;
            formData.category = data.features[0].properties.category || 'residential house';
            setShowModal(true);
        }

    };

    const handleButtonClick = () => {
        setIsAddingPoint(!isAddingPoint);
    };

    const handleRelocateClick = () => {
        setShowMarkerModal(false); // Закриваємо модальне вікно
        setIsRelocating(true);
    };

    const handleMarkerDragEnd = async (event) => {
        const { lngLat, target } = event;
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxToken}`, { withCredentials: false });
        const data = response.data;
        const placeName = data.features[0].place_name;
        const contextPlace = data.features[0].context.find(context => context.id.includes('place'));
        const city = contextPlace ? contextPlace.text || 'Unknown' : 'Unknown';
        await updateMarkerLocation(lngLat.lng, lngLat.lat, placeName, city);
    };

    const updateMarkerLocation = async (longitude, latitude, placeName, city) => {
        try {
            const requestData = {
                longitude,
                latitude,
                place_name: placeName,
                city,
                moderatedBy: userData.username // Передача імені користувача з об'єкту userData
            };
            await axios.put(
                `${backendUrl}/updatelocation/${markerData.point._id}`, requestData,
                { withCredentials: false }
            );
            console.log('Геодані оновлено успішно');
            setIsRelocating(false);
            setShowMarkerModal(false);
            window.location.reload();
        } catch (error) {
            console.error('Помилка при оновленні геоданих:', error);
        }
    };

    useEffect(() => {
        const storedMarker = localStorage.getItem('selectedMarker');
        if (storedMarker) {
            const marker = JSON.parse(storedMarker);
            handleMarkerClick(marker); // Викликати handleMarkerClick зі збереженим маркером
        }
        // Очистити збережені дані маркера після використання
        localStorage.removeItem('selectedMarker');
    }, []);

    const handleMarkerClick = async (marker) => {
        const dataDB = await fetchMarkerData(marker.longitude, marker.latitude);
        setMarkerData(dataDB);
        setShowMarkerModal(true);

    };

    const fetchMarkerData = async (longitude, latitude) => {
        const timeoutMs = 5000; // 10 seconds timeout
        try {
            const responsePromise = axios.get(`${backendUrl}/getpoint?longitude=${longitude}&latitude=${latitude}`);
            const response = await Promise.race([responsePromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))]);
            return response.data; // Return data on success
        } catch (error) {
            let marker = {longitude, latitude};
            localStorage.setItem('selectedMarker', JSON.stringify(marker));
            console.error('Error fetching marker data:', error);
            window.location.reload();
            //throw new Error('Failed to fetch marker data'); // Повертаємо null у разі помилки
        }
    };

    

    return (
        <div className='map-container mt-5 page-content'>
            <MapGL
                {...viewport}
                mapboxAccessToken={mapboxToken}
                onViewportChange={newViewport => setViewport(newViewport)}
                mapStyle="mapbox://styles/sonyalemeshova/clvpftkv1008e01pfcdzn0qfw"
                onClick={handleClick}
            >
                {renderPoints()}
            </MapGL>

            {/* <div className="map-button-container"> */}
                {userData && userData.role === 'moderator' ? (
                    <MapPopoverModerator points={points} updateFilteredPoints={updateFilteredPoints} setIsFiltered={setIsFiltered}/> // Використання окремого компонента Popover для модератора
                ) : (
                    <MapPopoverUser points={markers} updateFilteredPoints={updateFilteredPoints} setIsFiltered={setIsFiltered}/> // Використання окремого компонента Popover для користувача
                )}
                {userData && userData.role === 'moderator' && isRelocating ? (
                    <Button variant="secondary" onClick={() => setIsRelocating(false)} style={{ width: '140px', position: 'absolute', bottom: '20px', right: '160px', zIndex: 1 }} className="cancel-relocate-button">
                        Cancel Relocate
                    </Button>
                ) : null}
                {userData ?

                    <Button onClick={() => handleButtonClick()} variant="primary" style={{ width: '140px', position: 'absolute', bottom: '20px', right: '10px', zIndex: 1 }} className="add-marker-button">
                        {isAddingPoint ?
                            'Cancel'
                            : 'Add Point'}
                    </Button>

                    :
                    <Button variant="primary" disabled={true} style={{ width: '180px', position: 'absolute', bottom: '20px', right: '10px', zIndex: 1 }}>
                        Log in to add point
                    </Button>
                }
            {/* </div> */}

            <ModalAddPoint userData={userData} formData={formData} setFormData={setFormData} selectedPoint={selectedPoint} showModal={showModal} setSelectedPoint={setSelectedPoint} setShowModal={setShowModal} setMarkerData={setMarkerData}/>
            <ModalPointDetails userData={userData} markerData={markerData} showMarkerModal={showMarkerModal} setShowMarkerModal={setShowMarkerModal} handleRelocateClick={handleRelocateClick} />
        </div>
    );
};

export default UkraineMap;