import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'chartjs-adapter-moment';

const Statistics = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [data, setData] = useState(null);
    const [dataPie, setDataPie] = useState(null);
    const [chartType, setChartType] = useState('category');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${backendUrl}/fetchstatistics?chartType=${chartType}&startDate=${startDate}&endDate=${endDate}`);
                const responsePie = await axios.get(`${backendUrl}/fetchstatisticspie?chartType=${chartType}&startDate=${startDate}&endDate=${endDate}`);
                setData(response.data);
                setDataPie(responsePie.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        fetchData();
    }, [chartType, startDate, endDate]);

    useEffect(() => {
        if (!barChartRef.current || !data) return;
    
        const ctx = barChartRef.current.getContext('2d');
        const datasets = [];
        const uniqueLabels = {};
        const dateLabels = [];
        data[chartType].forEach((item, index) => {
            const labelKey = item._id.type;
            const dateStr = item._id.date; // Рядок з датою у форматі "YYYY-MM-DD"
            const [year, month, day] = dateStr.split('-'); // Розбиваємо рядок на частини
            const dateObj = new Date(year, month - 1, day); 
            dateLabels.push(dateObj);
            if (!uniqueLabels[labelKey]) {
                datasets.push({
                    type: 'bar',
                    label: item._id.type,
                    data: [{ x: dateObj, y: item.count }],
                    borderWidth: 1,
                    barThickness: 10,
                    grouped: true,
                    backgroundColor: customPalette[index % customPalette.length],
                    offset: true,
                });
                console.log(dateObj);
                uniqueLabels[labelKey] = true;

            } else {
                console.log('else', datasets);
                const existingDataset = datasets.find(dataset => dataset.label === item._id.type);
                if (existingDataset) {
                    existingDataset.data.push({ x: dateObj, y: item.count });
                }
            }
        });
    
        if (barChartRef.current.chart) {
            barChartRef.current.chart.destroy();
        }
    
        barChartRef.current.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dateLabels,
                datasets: datasets,
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                },
                
                scales: {
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Points',
                        },
                    },
                    x: {
                        stacked: true,
                        type: 'time',
                        offset: true,
                        time: {
                            format: "DD.MM.YYYY HH:mm",
                            displayFormats: {
                                'hour': 'DD.MM',
                                'week': 'DD.MM',
                                'month': 'DD.MM',
                                'year': 'MMMM',
                            },
                        },
                        title: {
                            display: true,
                            text: 'Time Period',
                        },
                    },
                },
            },
        });

        
    }, [data, chartType, startDate, endDate]);

    useEffect(() => {
        if (!pieChartRef.current || !dataPie) return;
    
        const ctxPie = pieChartRef.current.getContext('2d');
        const pieDatasets = [];
        const uniqueLabels = {};
        const dataP = [];
        dataPie[chartType].forEach((item, index) => {
        const labelKey = item._id.type;
            if (!uniqueLabels[labelKey]) {
                pieDatasets.push({
                    label: item._id.type,
                    data: [item.count],
                    backgroundColor: customPalettePie[index % customPalette.length],
                });
                dataP.push([item.count]);
                uniqueLabels[labelKey] = true;

            } else {
                const existingDataset = pieDatasets.find(dataset => dataset.label === item._id.type);
                if (existingDataset) {
                    existingDataset.data.push([item.count]);
                    dataP.push([item.count]);
                }
            }
        });
    
        if (pieChartRef.current.chart) {
            pieChartRef.current.chart.destroy();
        }
        console.log(dataP);
        pieChartRef.current.chart = new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: pieDatasets.map(dataset => dataset.label),
                datasets: [{
                    data: dataP,
                    hoverOffset: 4,
                    backgroundColor: customPalettePie,
                  }],
            },
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                },
            },
        });
    }, [dataPie, chartType, startDate, endDate]);
    
    const customPalette = [
        '#42519B', // Темно-синій
    '#AAAABC', // Сірий
    '#767687', // Сірий
    '#97343D', // Темно-червоний
    '#D2686D', // Темно-червоний
    '#5E5F84', // Темно-синій
    '#BEBFC9', // Сірий
    '#8A8B98', // Сірий
    '#A12F37', // Темно-червоний
    '#E2858F', // Темно-червоний
    // Додані кольори
    '#3B478A', // Темно-синій
    '#9A9AA8', // Сірий
    '#6E6E7C', // Сірий
    '#8C2F37', // Темно-червоний
    '#C25962', // Темно-червоний
    '#54567A', // Темно-синій
    '#B0B0BA', // Сірий
    '#7C7C89', // Сірий
    '#912B34', // Темно-червоний
    '#DB7A85'  // Темно-червоний
];
    const customPalettePie = [
        '#42519B', // Темно-синій
    '#AAAABC', // Сірий
    '#767687', // Сірий
    '#97343D', // Темно-червоний
    '#D2686D', // Темно-червоний
    '#5E5F84', // Темно-синій
    '#BEBFC9', // Сірий
    '#8A8B98', // Сірий
    '#A12F37', // Темно-червоний
    '#E2858F', // Темно-червоний
    // Додані кольори
    '#3B478A', // Темно-синій
    '#9A9AA8', // Сірий
    '#6E6E7C', // Сірий
    '#8C2F37', // Темно-червоний
    '#C25962', // Темно-червоний
    '#54567A', // Темно-синій
    '#B0B0BA', // Сірий
    '#7C7C89', // Сірий
    '#912B34', // Темно-червоний
    '#DB7A85'  // Темно-червоний
];
    return (
        <div className="container mt-4 chart-content">
            <div className="row">
                <div className="col-md-6">
                    <label htmlFor="startDate" className="form-label">Start Date:</label>
                    <input type="date" id="startDate" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label htmlFor="endDate" className="form-label">End Date:</label>
                    <input type="date" id="endDate" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col">
                    <div className="btn-group mb-3" role="group">
                        <button type="button" className={`btn btn-${chartType === 'category' ? 'primary' : 'secondary'}`} onClick={() => setChartType('category')}>Category</button>
                        <button type="button" className={`btn btn-${chartType === 'city' ? 'primary' : 'secondary'}`} onClick={() => setChartType('city')}>City</button>
                        <button type="button" className={`btn btn-${chartType === 'typeOfWeapon' ? 'primary' : 'secondary'}`} onClick={() => setChartType('typeOfWeapon')}>Type of Weapon</button>
                    </div>
                    <canvas ref={barChartRef} id="barChart" width="200" height="140"></canvas>
                    
                </div><div className="col mt-5">
                        <canvas ref={pieChartRef} height="100" id="pieChart"></canvas>
                    </div>
            </div>
            
        </div>
    );
};

export default Statistics;