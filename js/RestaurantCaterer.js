let currentRole = sessionStorage.getItem("role") || "Restaurant";
let displaySuffix = currentRole === "Household" ? " Household" : " " + currentRole;
document.getElementById("rcname").innerHTML = sessionStorage.getItem("username") + displaySuffix;
let nof = 0,nodd = 0, nofd = 0;

firebase.database().ref(currentRole).orderByChild("mobilenumber").equalTo(sessionStorage.getItem("mnumber")).once('value',snapshot=>{
    snapshot.forEach(function(chilsSnapshot){
       firebase.database().ref(currentRole+"/"+chilsSnapshot.key+"/Donation").once('value',function(childQuerySnapshot){
        var content = '';    
        var hygieneLevelEdit = "";
        var ngStatus = "";
        var dNo;
        childQuerySnapshot.forEach(function(queryData){
            var val = queryData.val();
                nof++;
                $({ Counter: 0 }).animate({
                    Counter: nof
                  }, {
                    duration: 1000,
                    easing: 'swing',
                    step: function() {
                      $('#nof').text(Math.ceil(this.Counter));
                      $("#nof").css("color","blue");
                    }
                });
                if(queryData.val().NGOStatus == "Accept"){
                    nodd++;
                    $({ Counter: 0 }).animate({
                        Counter: nodd
                      }, {
                        duration: 1000,
                        easing: 'swing',
                        step: function() {
                          $('#nodd').text(Math.ceil(this.Counter));
                          $("#nodd").css("color","green");
                        }
                    });
                }else if(queryData.val().NGOStatus == "Failed"){
                    nofd++;
                    $({ Counter: 0 }).animate({
                        Counter: nofd
                      }, {
                        duration: 1000,
                        easing: 'swing',
                        step: function() {
                          $('#nofd').text(Math.ceil(this.Counter));
                          $("#nofd").css("color","red");
                        }
                    });
                }
                /*Listing*/
                
                if(val.hygieneLevel == 1){
                    hygieneLevelEdit = '⭐';
                }else if(val.hygieneLevel == 2){
                    hygieneLevelEdit = '⭐⭐';
                }else if(val.hygieneLevel == 3){
                    hygieneLevelEdit = '⭐⭐⭐';
                }else if(val.hygieneLevel == 4){
                    hygieneLevelEdit = '⭐⭐⭐⭐';
                }else{
                    hygieneLevelEdit = '⭐⭐⭐⭐⭐';
                }
                if(val.NGOStatus == "Accept"){
                    ngStatus = '<td class="text-success fw-bold">Accept</td>';
                }else if(val.NGOStatus == "Pending"){
                    ngStatus = '<td class="text-warning fw-bold">Pending</td>';
                }else{
                    ngStatus = '<td class="text-danger fw-bold">Failed</td>';
                }
                if(val.DeliveryContactN==null){
                    dNo = "Pending";
                }else{
                    dNo = "+91 "+ val.DeliveryContactN;
                }

                var trackBtn = '';
                if(val.NGOStatus == "Accept" && val.DeliveryContactN) {
                    $('#notifBadge').show(); // Turn on notification bell
                    
                    var driverName = val.DeliveryPname ? encodeURIComponent(val.DeliveryPname) : "Driver";
                    var driverPhone = val.DeliveryContactN ? encodeURIComponent(val.DeliveryContactN) : "";
                    var jobId = encodeURIComponent(queryData.key || '');
                    trackBtn = '<a href="trackPickup.html?dname=' + driverName + '&dphone=' + driverPhone + '&jobId=' + jobId + '" class="btn-premium mt-3 w-100 text-center" style="text-decoration: none; display: block;"><i class="bi bi-geo-alt-fill me-2"></i> Track Driver</a>';
                }

                content += '<div class="donation-list-card">';
                content += '    <h4 class="text-white mb-3"><i class="bi bi-box2 me-2 text-gradient"></i>' + chilsSnapshot.val().username + '</h4>';
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
                content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Delivery No</div>';
                content += '                    <div class="text-white">' + dNo + '</div>';
                content += '                </div>';
                content += '                <div class="col-12">';
                content += '                    <div class="text-secondary small text-uppercase fw-bold mb-1">Remarks</div>';
                content += '                    <div class="text-white">' + val.mark + '</div>';
                content += '                </div>';
                content += '            </div>';
                content += '        </div>';
                content += '        <div class="col-md-2 mt-3 mt-md-0 text-md-end">';
                content += '            <div class="text-secondary small text-uppercase fw-bold mb-1">Status</div>';
                content += '            <div class="fs-5">' + ngStatus + '</div>';
                content += '            ' + trackBtn;
                content += '        </div>';
                content += '    </div>';
                content += '</div>';
            }); 
            $('#ex-table').append(content);
       });
    });
});


