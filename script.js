const startTrackingButton = document.getElementById("startTracking");
const velocityChartElement = document.getElementById("velocityChart");

const chartData = {
    labels: [],
    datasets: [{
        label: "Velocity (km/h)",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.1,
        fill: false
    }]
};

const chartOptions = {
    scales: {
        x: {
            title: {
                display: true,
                text: "Kilometers"
            }
        },
        y: {
            title: {
                display: true,
                text: "Velocity (km/h)"
            },
            min: 0
        }
    }
};

const velocityChart = new Chart(velocityChartElement, {
    type: "line",
    data: chartData,
    options: chartOptions
});

startTrackingButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        let previousPosition = null;
        let distance = 0;
        
        navigator.geolocation.watchPosition(
            position => {
                if (previousPosition) {
                    const currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    
                    const deltaDistance = haversineDistance(previousPosition, currentPosition);
                    distance += deltaDistance;
                    
                    const deltaTime = (position.timestamp - previousPosition.timestamp) / 1000;
                    const velocity = (deltaDistance / deltaTime) * 3.6;
                    
                    chartData.labels.push(distance.toFixed(2));
                    chartData.datasets[0].data.push(velocity.toFixed(2));
                    
                    velocityChart.update();
                }
                
                previousPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: position.timestamp
                };
            },
            error => {
                console.log("Error: " + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

function haversineDistance(coord1, coord2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);
    const lat1 = toRad(coord1.latitude);
    const lat2 = toRad(coord2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRad(value) {
    return value * Math.PI / 180;
}
const captureAndDownloadButton = document.getElementById("captureAndDownload");
const downloadImageLink = document.getElementById("downloadImage");

captureAndDownloadButton.addEventListener("click", async () => {
    try {
        const canvas = await html2canvas(velocityChartElement);
        const imageDataUrl = canvas.toDataURL("image/png");
        downloadImageLink.href = imageDataUrl;
        downloadImageLink.style.display = "block";
        downloadImageLink.click();
    } catch (error) {
        console.log("Error capturing the chart: " + error.message);
    }
});
