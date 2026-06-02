document.addEventListener('DOMContentLoaded', function() {
    // 1. Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const driverName = urlParams.get('dname') || "Unknown Agent";
    const driverPhone = urlParams.get('dphone') || "";

    // 2. Populate UI
    document.getElementById('driverName').textContent = decodeURIComponent(driverName);
    
    if (driverPhone) {
        document.getElementById('driverPhone').textContent = "+91 " + decodeURIComponent(driverPhone);
        document.getElementById('callBtn').href = "tel:" + decodeURIComponent(driverPhone);
    } else {
        document.getElementById('driverPhone').textContent = "No number provided";
        document.getElementById('callBtn').style.display = "none";
    }

    const jobId = urlParams.get('jobId') || '';
    const shareLive = urlParams.get('share') === '1' || urlParams.get('share') === 'true';

    // 3. Initialize Leaflet Map (Simulated coordinates in India)
    const targetLat = 19.0760;
    const targetLng = 72.8777;
    
    const driverLat = targetLat - 0.05;
    const driverLng = targetLng - 0.05;

    var map = L.map('map').setView([targetLat, targetLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Custom Icons
    var donorIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2907/2907150.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38]
    });

    var driverIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3089/3089791.png',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });

    // Markers
    var donorMarker = L.marker([targetLat, targetLng], {icon: donorIcon}).addTo(map)
        .bindPopup("<b>Your Location</b>").openPopup();
        
    var driverMarker = L.marker([driverLat, driverLng], {icon: driverIcon}).addTo(map)
        .bindPopup("<b>Driver</b><br>En route");

    var routeLine = L.polyline([[driverLat, driverLng], [targetLat, targetLng]], {
        color: '#10b981',
        weight: 4,
        dashArray: '8 6'
    }).addTo(map);

    var bounds = L.featureGroup([donorMarker, driverMarker]).getBounds().pad(0.4);
    map.fitBounds(bounds);

    var statusEl = document.getElementById('liveStatus');
    var lastUpdateEl = document.getElementById('lastUpdate');
    var shareHintEl = document.getElementById('shareHint');
    var simInterval = null;
    var isLiveTracking = false;

    function setStatus(message) {
        if (statusEl) statusEl.textContent = message;
    }

    function setShareHint(message) {
        if (shareHintEl) shareHintEl.innerHTML = message;
    }

    function setLastUpdate(timestamp) {
        if (lastUpdateEl) lastUpdateEl.textContent = timestamp ? 'Last update: ' + new Date(timestamp).toLocaleTimeString() : 'Last update: not available';
    }

    function updateDriverMarker(lat, lng, message) {
        driverMarker.setLatLng([lat, lng]);
        if (message) {
            driverMarker.bindPopup('<b>Driver</b><br>' + message).openPopup();
        }
        map.panTo([lat, lng], {animate: true, duration: 1});
        bounds = L.featureGroup([donorMarker, driverMarker]).getBounds().pad(0.4);
        map.fitBounds(bounds);
    }

    function startSimulation() {
        setStatus('Using estimated driver route until live location is available.');
        setLastUpdate(null);

        let currentLat = driverLat;
        let currentLng = driverLng;
        let stepCount = 0;
        const stepLat = (targetLat - driverLat) / 100;
        const stepLng = (targetLng - driverLng) / 100;

        simInterval = setInterval(() => {
            if (stepCount < 95) {
                currentLat += stepLat;
                currentLng += stepLng;
                driverMarker.setLatLng([currentLat, currentLng]);
                stepCount++;
            } else {
                driverMarker.bindPopup('<b>Driver has arrived!</b>').openPopup();
                clearInterval(simInterval);
            }
        }, 1000);
    }

    function stopSimulation() {
        if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
        }
    }

    function enableLiveTracking() {
        if (!jobId) {
            setStatus('Live tracking requires a jobId parameter.');
            return;
        }

        var liveRef = firebase.database().ref('LiveTracking/' + jobId);

        liveRef.on('value', function(snapshot) {
            var liveData = snapshot.val();
            if (liveData && liveData.lat && liveData.lng) {
                stopSimulation();
                isLiveTracking = true;
                updateDriverMarker(liveData.lat, liveData.lng, shareLive ? 'Sharing live location' : 'Live location');
                setStatus(shareLive ? 'Sharing your live location with admin.' : 'Receiving live driver location from backend.');
                setLastUpdate(liveData.timestamp);
            } else {
                if (!isLiveTracking) {
                    setStatus('No live location posted yet. Using estimated route map.');
                    startSimulation();
                }
            }
        }, function(error) {
            setStatus('Live tracking unavailable: ' + error.message);
            if (!isLiveTracking) {
                startSimulation();
            }
        });

        if (shareLive) {
            if (!navigator.geolocation) {
                setStatus('Geolocation is not supported by this browser.');
                return;
            }

            setStatus('Starting live location sharing. Please allow location access.');
            navigator.geolocation.watchPosition(function(position) {
                var update = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    timestamp: Date.now()
                };
                firebase.database().ref('LiveTracking/' + jobId).set(update).catch(function(error) {
                    setStatus('Failed to update location: ' + error.message);
                });
            }, function(error) {
                setStatus('Unable to access location: ' + error.message);
            }, {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            });
        }
    }

    if (jobId) {
        if (!shareLive) {
            setShareHint('Driver can share live location using <a href="shareLocation.html?jobId=' + encodeURIComponent(jobId) + '" target="_blank">shareLocation.html?jobId=' + encodeURIComponent(jobId) + '</a>');
        }
        enableLiveTracking();
    } else {
        setStatus('No jobId provided. Showing estimated driver route.');
        setLastUpdate(null);
        startSimulation();
    }
});
