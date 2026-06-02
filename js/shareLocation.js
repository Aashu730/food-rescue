document.addEventListener('DOMContentLoaded', function() {
    const jobIdInput = document.getElementById('jobIdInput');
    const startBtn = document.getElementById('startShareBtn');
    const stopBtn = document.getElementById('stopShareBtn');
    const shareStatus = document.getElementById('shareStatus');
    const lastCoordinates = document.getElementById('lastCoordinates');
    const liveUrl = document.getElementById('liveUrl');
    const copyLinkBtn = document.getElementById('copyLinkBtn');

    let watchId = null;
    let activeJobId = '';

    const urlParams = new URLSearchParams(window.location.search);
    const presetJobId = urlParams.get('jobId') || '';

    if (presetJobId) {
        jobIdInput.value = presetJobId;
        jobIdInput.setAttribute('readonly', 'readonly');
        activeJobId = presetJobId;
    }

    function setStatus(message, type = 'text-white') {
        shareStatus.textContent = message;
        shareStatus.className = type + ' fw-semibold';
    }

    function updateLiveUrl(jobId) {
        const url = jobId ? 'trackPickup.html?jobId=' + encodeURIComponent(jobId) : 'trackPickup.html?jobId=<job_id>';
        liveUrl.textContent = url;
        return url;
    }

    function getJobId() {
        return jobIdInput.value.trim();
    }

    function startSharing() {
        const jobId = getJobId();
        if (!jobId) {
            setStatus('Job ID is required to start sharing.', 'text-warning');
            return;
        }

        activeJobId = jobId;
        updateLiveUrl(jobId);

        if (!navigator.geolocation) {
            setStatus('Geolocation is not supported by this browser.', 'text-danger');
            return;
        }

        setStatus('Waiting for location permission...', 'text-info');
        startBtn.disabled = true;
        jobIdInput.disabled = true;
        stopBtn.style.display = 'block';

        watchId = navigator.geolocation.watchPosition(function(position) {
            if (!position || !position.coords) {
                setStatus('Unable to read location. Retrying...', 'text-warning');
                return;
            }

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const timestamp = Date.now();

            firebase.database().ref('LiveTracking/' + activeJobId).set({
                lat: lat,
                lng: lng,
                timestamp: timestamp
            }).then(function() {
                setStatus('Sharing live location now.', 'text-success');
                lastCoordinates.textContent = 'Latitude: ' + lat.toFixed(6) + ' | Longitude: ' + lng.toFixed(6) + ' | Updated: ' + new Date(timestamp).toLocaleTimeString();
            }).catch(function(error) {
                setStatus('Failed to update Firebase: ' + error.message, 'text-danger');
            });
        }, function(error) {
            setStatus('Location error: ' + error.message, 'text-danger');
        }, {
            enableHighAccuracy: true,
            maximumAge: 3000,
            timeout: 15000
        });
    }

    function stopSharing() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        setStatus('Stopped sharing location.', 'text-secondary');
        stopBtn.style.display = 'none';
        startBtn.disabled = false;
    }

    startBtn.addEventListener('click', startSharing);
    stopBtn.addEventListener('click', stopSharing);

    copyLinkBtn.addEventListener('click', function() {
        const url = updateLiveUrl(getJobId());
        navigator.clipboard.writeText(window.location.origin + '/' + url).then(function() {
            setStatus('Tracking link copied to clipboard.', 'text-success');
        }).catch(function() {
            setStatus('Unable to copy link. Please copy manually.', 'text-warning');
        });
    });

    updateLiveUrl(activeJobId);
});
