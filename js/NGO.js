document.getElementById("ngoname").innerHTML = sessionStorage.getItem("username") + " NGO";
let counterno = 0;
let dish = 0;
let numOfDdone = 0;
let numOfFailed = 0;

// Global array to store data for the CSV audit report
window.auditData = [
    ["Donor Name", "Donor Role", "Food Type", "Quantity", "Hygiene Level", "Cooked Time", "Expiry Time", "Pickup Location", "Donor Contact", "Driver Name", "Driver Contact", "Status"]
];

var roles = ["Household", "Restaurant", "Caterer"];

roles.forEach(function(role) {
    firebase.database().ref(role).once("value", function (snapshots) {
        if (!snapshots.exists()) return;
        
        snapshots.forEach(function (chilsSnapshot) {
            firebase.database().ref(role + "/" + chilsSnapshot.key + "/Donation").once('value', function (snap) {
                if (!snap.exists()) return;
                
                var content = '';    
                
                snap.forEach(function (childCheck) {
                    var val = childCheck.val();
                    
                    // We only want to show donations that this specific NGO has claimed.
                    let currentNGO = sessionStorage.getItem("username");
                    if (val.ClaimedByNGO === currentNGO) {
                        
                        var hygieneLevelEdit = "";
                        var ngStatus = "";

                        if (val.NGOStatus == "Accept") {
                            numOfDdone++;
                            dish += parseInt(val.Quantity);
                            animateCount('#NoOfFeed', dish, '#10b981');
                            animateCount('#numOfDdone', numOfDdone, '#3b82f6');
                            
                            // Add to Audit Report data
                            window.auditData.push([
                                chilsSnapshot.val().username,
                                role,
                                val.tyfood,
                                val.Quantity,
                                val.hygieneLevel + "/5",
                                val.cookTime,
                                val.expiryTime + " hrs",
                                val.address + ", " + val.city,
                                chilsSnapshot.val().mobilenumber,
                                val.DeliveryPname || "N/A",
                                val.DeliveryContactN || "N/A",
                                "Accepted"
                            ]);
                            
                        } else if (val.NGOStatus == "Failed") {
                            numOfFailed++;
                            animateCount('#numOfFailed', numOfFailed, '#ef4444');
                        }

                        // Listing styling
                        if (val.hygieneLevel == 1) hygieneLevelEdit = '⭐';
                        else if (val.hygieneLevel == 2) hygieneLevelEdit = '⭐⭐';
                        else if (val.hygieneLevel == 3) hygieneLevelEdit = '⭐⭐⭐';
                        else if (val.hygieneLevel == 4) hygieneLevelEdit = '⭐⭐⭐⭐';
                        else hygieneLevelEdit = '⭐⭐⭐⭐⭐';

                        if (val.NGOStatus == "Accept") {
                            ngStatus = '<div class="text-success fw-bold fs-5"><i class="bi bi-check-circle-fill me-1"></i> Accepted</div>';
                        } else if (val.NGOStatus == "Pending") {
                            ngStatus = '<div class="text-warning fw-bold fs-5"><i class="bi bi-hourglass-split me-1"></i> Pending</div>';
                        } else {
                            ngStatus = '<div class="text-danger fw-bold fs-5"><i class="bi bi-x-circle-fill me-1"></i> Failed</div>';
                        }
                        
                        var roleIcon = role === "Household" ? "bi-house-heart" : "bi-shop";

                        content += '<div class="donation-list-card">';
                        content += '    <h4 class="text-white mb-3"><i class="bi ' + roleIcon + ' me-2 text-gradient"></i>' + chilsSnapshot.val().username + ' (' + role + ')</h4>';
                        content += '    <div class="row align-items-center">';
                        content += '        <div class="col-md-2 mb-3 mb-md-0">';
                        content += '            <img src="images/feedfood.jpg" class="img-fluid rounded" style="object-fit: cover; height: 120px; width: 100%;">';
                        content += '        </div>';
                        content += '        <div class="col-md-8">';
                        content += '            <div class="row g-3">';
                        content += '                <div class="col-sm-6 col-md-4">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Quantity</div>';
                        content += '                    <div class="text-white">' + val.Quantity + ' Dishes</div>';
                        content += '                </div>';
                        content += '                <div class="col-sm-6 col-md-4">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Food Type</div>';
                        content += '                    <div class="text-white">' + val.tyfood + '</div>';
                        content += '                </div>';
                        content += '                <div class="col-sm-6 col-md-4">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Hygiene Level</div>';
                        content += '                    <div class="text-warning">' + hygieneLevelEdit + '</div>';
                        content += '                </div>';
                        content += '                <div class="col-sm-6 col-md-4">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Cooked Time</div>';
                        content += '                    <div class="text-white">' + val.cookTime + '</div>';
                        content += '                </div>';
                        content += '                <div class="col-sm-6 col-md-4">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Expiry Time</div>';
                        content += '                    <div class="text-white">' + val.expiryTime + ' hours</div>';
                        content += '                </div>';
                        content += '                <div class="col-sm-6 col-md-4">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Donor Phone</div>';
                        content += '                    <div class="text-white">+91 ' + chilsSnapshot.val().mobilenumber + '</div>';
                        content += '                </div>';
                        content += '                <div class="col-12">';
                        content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Remarks</div>';
                        content += '                    <div class="text-white">' + (val.mark || "None") + '</div>';
                        content += '                </div>';
                        content += '            </div>';
                        content += '        </div>';
                        content += '        <div class="col-md-2 mt-3 mt-md-0 text-md-end">';
                        content += '            <div class="text-secondary small text-uppercase fw-bold mb-1">Status</div>';
                        content += '            ' + ngStatus;
                        content += '        </div>';
                        content += '    </div>';
                        content += '</div>';
                    }
                });
                $('#ex-table').append(content);
            });
        });
    });
});

function animateCount(elementId, targetValue, color) {
    $({ Counter: parseInt($(elementId).text()) || 0 }).animate({
        Counter: targetValue
    }, {
        duration: 1500,
        easing: 'swing',
        step: function () {
            $(elementId).text(Math.ceil(this.Counter));
        }
    });
}

function generateAuditReport() {
    if (window.auditData.length <= 1) {
        alert("No accepted donations found to generate an audit report.");
        return;
    }
    
    // Convert array to CSV string
    let csvContent = "data:text/csv;charset=utf-8,";
    window.auditData.forEach(function(rowArray) {
        // Escape quotes and wrap items in quotes to handle commas within data
        let row = rowArray.map(item => '"' + String(item).replace(/"/g, '""') + '"').join(",");
        csvContent += row + "\r\n";
    });

    // Trigger download
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    var dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", "NGO_Audit_Report_" + dateStr + ".csv");
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ----------------------------------------------------
// REAL-TIME NOTIFICATION LISTENER
// ----------------------------------------------------
let pageLoadTime = Date.now();
firebase.database().ref("System/LatestDonation").on('value', snap => {
    if(!snap.exists()) return;
    
    let data = snap.val();
    // Only show notification if the donation happened AFTER this page was loaded
    if(data.timestamp > pageLoadTime) {
        // Illuminate the notification bell
        document.getElementById('ngoNotifBadge').style.display = 'block';
        
        // Show the toast popup
        let msg = `<strong>${data.donorName || "A donor"}</strong> just posted ${data.quantity} dishes of ${data.foodType}!`;
        document.getElementById('toastMessage').innerHTML = msg;
        
        var toastEl = document.getElementById('liveToast');
        var toast = new bootstrap.Toast(toastEl, { delay: 10000 });
        toast.show();
    }
});