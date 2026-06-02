// Array of roles that can post food
var roles = ["Household", "Restaurant", "Admin", "Caterer"];

function safe(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'string') {
        var normalized = value.trim().toLowerCase();
        if (normalized === 'undefined' || normalized === 'null') return fallback;
    }
    return value;
}

function getField(val, keys, fallback) {
    for (var i = 0; i < keys.length; i++) {
        var candidate = val[keys[i]];
        if (candidate !== undefined && candidate !== null && candidate !== '') {
            if (typeof candidate === 'string') {
                var normalized = candidate.trim().toLowerCase();
                if (normalized === 'undefined' || normalized === 'null') {
                    continue;
                }
            }
            return candidate;
        }
    }
    return fallback;
}

function quantityLabel(quantity) {
    var cleaned = safe(quantity, 'N/A');
    if (!isNaN(cleaned) && cleaned !== '') return cleaned + ' Dishes';
    return cleaned;
}

function buildStatusButton(role, dataKey, childMobile, val) {
    if (sessionStorage.getItem("role") !== "NGO") {
        return '';
    }

    if (val.NGOStatus === "Pending") {
        return '<a href="feed2.html?token=' + dataKey + '&n=' + encodeURIComponent(childMobile) + '&r=' + encodeURIComponent(role) + '" class="btn-premium w-100 text-center" style="text-decoration: none; padding: 0.85rem 1rem;">Accept Donation</a>';
    }

    if (val.NGOStatus === "Accept") {
        return '<div class="w-100 text-center text-success fw-bold"><i class="bi bi-check-circle me-1"></i> Food Accepted</div>';
    }

    return '<div class="w-100 text-center text-danger fw-bold"><i class="bi bi-x-circle me-1"></i> Not Accepted</div>';
}

function renderDonation(role, dataKey, childMobile, val) {
    var displayRole = role === "Household" ? "Household Donation" : role + " Donation";
    var donorName = getField(val, ['RestaurantName', 'username', 'donorName', 'name', 'DonorName'], 'Unknown Donor');
    var hygiene = safe(getField(val, ['hygieneLevel', 'hygiene'], 'N/A'), 'N/A');
    var foodType = safe(getField(val, ['tyfood', 'foodType', 'type', 'typeOfFood'], 'Unknown'));
    var quantity = quantityLabel(getField(val, ['Quantity', 'quantity', 'qty'], 'N/A'));
    var cookedTime = safe(getField(val, ['cookTime', 'cooked_time', 'cookedTime'], '--'), '--');
    var expiryTime = safe(getField(val, ['expiryTime', 'expiry_time', 'expiresIn', 'expiry'], '--'), '--');
    var remarksRaw = getField(val, ['mark', 'remarks', 'remark'], 'No remarks');
    var remarks = remarksRaw === 'default' ? 'No remarks' : remarksRaw;
    var claimedContact = safe(getField(val, ['DeliveryContactN', 'deliveryContact', 'NGOContact', 'donorContact'], ''), 'Not claimed');
    var location = 'Unknown location';
    var addressLine = getField(val, ['address', 'pickupAddress', 'location'], '');
    var city = getField(val, ['city', 'town'], '');
    var state = getField(val, ['state', 'region'], '');
    if (addressLine || city || state) {
        location = [addressLine, city, state].filter(Boolean).join(', ');
    }
    var statusBar = buildStatusButton(role, dataKey, childMobile, val);

    var content = '';
    content += '<div class="feed-card" data-role="' + role + '">';
    content += '  <div class="feed-image-container">';
    content += '    <img src="images/feedfood.jpg" class="feed-image" alt="Food Image">';
    content += '    <div class="feed-badge text-warning"><i class="bi bi-star-fill me-1"></i> ' + hygiene + '/5</div>';
    content += '  </div>';
    content += '  <div class="feed-card-body">';
    content += '    <div class="feed-card-head">';
    content += '      <div>';
    content += '        <h3 class="feed-card-title">' + displayRole + '</h3>';
    content += '        <div class="feed-card-subtitle"><i class="bi bi-person-circle"></i>' + donorName + '</div>';
    content += '      </div>';
    content += '      <span class="badge bg-secondary text-white text-uppercase" style="font-size:0.75rem; letter-spacing:0.08em;">' + role + '</span>';
    content += '    </div>';
    content += '    <div class="feed-card-meta">';
    content += '      <span><i class="bi bi-geo-alt-fill"></i> ' + location + '</span>';
    content += '      <span><i class="bi bi-clock"></i> Expires in ' + expiryTime + '</span>';
    content += '    </div>';
    content += '    <div class="feed-metrics">';
    content += '      <div class="metric-item">';
    content += '        <span class="metric-label">Food Type</span>'; 
    content += '        <span class="metric-value text-info">' + foodType + '</span>'; 
    content += '      </div>';
    content += '      <div class="metric-item">';
    content += '        <span class="metric-label">Quantity</span>'; 
    content += '        <span class="metric-value text-warning">' + quantity + '</span>'; 
    content += '      </div>';
    content += '      <div class="metric-item">';
    content += '        <span class="metric-label">Cooked Time</span>'; 
    content += '        <span class="metric-value text-success">' + cookedTime + '</span>'; 
    content += '      </div>';
    content += '      <div class="metric-item">';
    content += '        <span class="metric-label">Status</span>'; 
    content += '        <span class="metric-value text-secondary">' + safe(val.NGOStatus, 'Pending') + '</span>'; 
    content += '      </div>';
    content += '    </div>';
    if (remarks) {
        content += '    <div class="feed-note">';
        content += '      <strong>Remarks:</strong> ' + remarks;
        content += '    </div>';
    }
    if (val.NGOStatus === "Accept" && claimedContact !== 'Not claimed') {
        content += '    <div class="feed-note" style="border-color: rgba(52, 211, 153, 0.22);">';
        content += '      <strong>Claimed by NGO Contact:</strong> ' + claimedContact;
        content += '    </div>';
    }
    if (statusBar !== '') {
        content += '    <div class="action-bar">' + statusBar + '</div>';
    }
    content += '  </div>';
    content += '</div>';

    return content;
}

var pendingRoles = roles.length;
var hasCards = false;
$('#loading-indicator').show();

function updateDonationCount() {
    var count = $('#ex-table .feed-card').length;
    $('#donation-count').text(count);
}

function setActiveFilter(filter) {
    $('.btn-filter').removeClass('active');
    $('.btn-filter[data-filter="' + filter + '"]').addClass('active');
    $('#ex-table .feed-card').each(function() {
        var role = $(this).data('role');
        if (filter === 'all' || role === filter) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

$('.btn-filter').on('click', function() {
    setActiveFilter($(this).data('filter'));
});

roles.forEach(function(role) {
    firebase.database().ref(role).once("value", function (snapshots) {
        if (!snapshots.exists()) {
            pendingRoles -= 1;
            if (pendingRoles === 0 && !hasCards) {
                $('#loading-indicator').text('No live donations available right now.');
            }
            return;
        }

        snapshots.forEach(function(childSnapshot) {
            firebase.database().ref(role + "/" + childSnapshot.key + "/Donation").once('value', function(snapshot) {
                if (!snapshot.exists()) {
                    pendingRoles -= 1;
                    if (pendingRoles === 0 && !hasCards) {
                        $('#loading-indicator').text('No live donations available right now.');
                    }
                    return;
                }

                var content = '';
                snapshot.forEach(function(data) {
                    hasCards = true;
                    content += renderDonation(role, data.key, childSnapshot.val().mobilenumber, data.val());
                });

                if (content !== '') {
                    $('#loading-indicator').hide();
                    $('#ex-table').append(content);
                    updateDonationCount();
                }
            });
        });
    });
});

// show the create post button for eligible users
var currentRole = sessionStorage.getItem('role');
if (currentRole == 'Household' || currentRole == 'Restaurant' || currentRole == 'Caterer' || currentRole == 'Admin') {
    $('#create-post-btn').show();
}

