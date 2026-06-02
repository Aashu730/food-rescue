Save.onclick = function(){
    const name = document.getElementById("Dname").value;
    const Dnumber = document.getElementById("Dnumber").value;
    
    // Safely parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('token');
    const n = urlParams.get('n');
    let r = urlParams.get('r');
    
    // Fallback to "Restaurant" if role isn't provided (for backward compatibility)
    if (!r) r = "Restaurant";

    var numberFomrate = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
    if(name == "" || Dnumber == ""){
        alert("Please Fill up the Form!");
    }else if(!Dnumber.match(numberFomrate)){
        alert("Please Enter Valid Mobile Number!");
    }else{
        firebase.database().ref(r).orderByChild("mobilenumber").equalTo(n).once("value", function (snapshots) {
            snapshots.forEach(function(childSnaShot){
                firebase.database().ref(r+"/"+childSnaShot.key+"/Donation/"+id).update({
                    NGOStatus:"Accept",
                    DeliveryPname:name,
                    DeliveryContactN:Dnumber,
                    ClaimedByNGO: sessionStorage.getItem("username")
                }).then(()=>{
                    alert("Successfully Accepted Donator Food!");
                    window.location.href = "feed.html";
                });
            });
        });    
    }
}