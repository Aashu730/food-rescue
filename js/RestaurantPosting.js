//Check if Resturant or Not 
var role = sessionStorage.getItem("role");
if (role != "Restaurant" && role != "Admin" && role != "Caterer" && role != "Household") {
    alert("You do not have permission to post.");
    window.location.href  = "index.html";
} else {
    var zipcodeFormate = /(^\d{6}$)|(^\d{6}-\d{4}$)/;
    
    document.getElementById("saveData").addEventListener("click", function () {
        var output = "";
        //Donation Information
        const quantity = document.getElementById("quantity").value;
        const typeOfFood = document.getElementById("type").value;
        const cooked_time = document.getElementById("cooked_time").value;
        const expiry_time = document.getElementById("expiry_time").value;
        const hygiene = document.getElementById("hygiene").value;

        //Delivery Information
        var address = document.getElementById("address").value;
        var city = document.getElementById("city").value;
        var state = document.getElementById("State").value;
        var zipcode = document.getElementById("zipcode").value;
        var mark = document.getElementById("mark").value;

        //User Information Validation 
        if (quantity == "" || typeOfFood == "" || cooked_time == "" || expiry_time == "" || hygiene == "" || address == "" || city == "" || state == "" || zipcode == "") {
            alert("Please fill up all required fields in the form!");
        } else {
            if (!zipcode.match(zipcodeFormate)) {
                alert("Please enter a valid Zipcode (e.g., 400001)!");
            } else {
                if (mark == "") {
                    output = "default";
                } else {
                    output = mark;
                }
                
                var mnumber = sessionStorage.getItem("mnumber");
                if (!mnumber) {
                    alert("Error: Mobile number not found in session. Please log in again.");
                    return;
                }

                firebase.database().ref(role).orderByChild("mobilenumber").equalTo(mnumber).once('value', snap => {
                    if (!snap.exists()) {
                        alert("Error: User record not found in database. Try logging in again.");
                        return;
                    }
                    
                    snap.forEach(function (childSnapshot) {
                        firebase.database().ref(role+"/"+childSnapshot.key+"/Donation").push({
                            NGOStatus:"Pending",
                            Quantity: quantity,
                            tyfood:typeOfFood,
                            cookTime:cooked_time,
                            expiryTime:expiry_time,
                            hygieneLevel:hygiene,
                            address: address,
                            city: city,
                            state: state,
                            zipcode: zipcode,
                            mark: output,
                            RestaurantName:sessionStorage.getItem("username")
                        }).then(()=>{
                            // Broadcast Notification for NGOs
                            firebase.database().ref("System/LatestDonation").set({
                                timestamp: Date.now(),
                                foodType: typeOfFood,
                                quantity: quantity,
                                donorName: sessionStorage.getItem("username")
                            });
                            
                            alert("Congratulations! Successfully Donated Your Food!");
                            window.location.href = "RestaurantCaterer.html";
                        }).catch((error) => {
                            alert("Failed to post donation: " + error.message);
                            console.error(error);
                        });
                    });
                }).catch((error) => {
                    alert("Database error: " + error.message);
                });
            }
        }
    });
}