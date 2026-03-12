let currentTemp = null;

document.getElementById("detectLocation").onclick = function(){

navigator.geolocation.getCurrentPosition(function(position){

let lat = position.coords.latitude;
let lon = position.coords.longitude;

console.log("Lat:",lat);
console.log("Lon:",lon);


// obtener ciudad
fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
.then(response => response.json())
.then(data => {

let city = data.address.city || data.address.town || data.address.village;

console.log("Ciudad detectada:", city);

document.getElementById("city").value = city;

});


// obtener clima
fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
.then(response => response.json())
.then(weather => {

currentTemp = weather.current_weather.temperature;
let wind = weather.current_weather.windspeed;
let weatherCode = weather.current_weather.weathercode;

console.log("Temperatura actual:", currentTemp);

document.getElementById("weatherInfo").innerHTML = `
🌡️ Temperatura: ${currentTemp}°C
<br>
💨 Viento: ${wind} km/h
`;

});

});

};

document.getElementById("plannerForm").addEventListener("submit",async function(e){

e.preventDefault();

let city = document.getElementById("city").value;
let geo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
let geoData = await geo.json();

let lat = geoData[0].lat;
let lon = geoData[0].lon;

console.log("Lat:", lat);
console.log("Lon:", lon);
let category = document.getElementById("category").value;
let sun = parseInt(document.getElementById("sun").value);
let space = document.getElementById("space").value;
let container = document.getElementById("container").value;

let climateType = "mild";

if(currentTemp !== null){

if(currentTemp > 25){
climateType = "warm";
}

else if(currentTemp < 18){
climateType = "cool";
}

}

let sunType = "medium";

if(sun <= 3){
sunType = "low";
}
else if(sun >= 8){
sunType = "high";
}

let plants = plantsDatabase.filter(p =>
p.category === category &&
p.climate === climateType &&
p.sun === sunType &&
p.space.includes(space) &&
p.container.includes(container)
);

if(plants.length === 0){
plants = plantsDatabase.filter(p => p.category === category);
}

let html = "<h3>En " + city + " puedes cultivar:</h3>";

plants.forEach(function(plant){

let today = new Date();
let harvestDate = new Date();

harvestDate.setDate(today.getDate() + plant.harvest);

let harvestString = harvestDate.toLocaleDateString();
let message = "🌱 Buen momento para sembrar";

if(currentTemp !== null){
  if(currentTemp < 10){
    message = "⚠️ Temperatura muy baja para la mayoría de cultivos";
  } 
  else if(currentTemp > 35){
    message = "⚠️ Temperatura muy alta, protege las plantas del sol";
  }
}

html += `
<div class="plant-card">

<img src="${plant.image}" class="plant-img">

<h4>${plant.name}</h4>

<p>🌱 Germinación: ${plant.germination}</p>
<p>⏳ Cosecha: ${plant.harvest} días</p>
<p>📅 Cosecha estimada: ${harvestString}</p>
<p>${message}</p>
<p>💧 Riego: ${plant.water}</p>

</div>
`;

});
document.getElementById("result").innerHTML = html;

});
document.getElementById("city").addEventListener("input", async function(){

let query = this.value;

if(query.length < 3) return;

let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

let response = await fetch(url);
let data = await response.json();

let datalist = document.getElementById("citySuggestions");

datalist.innerHTML = "";

data.slice(0,5).forEach(place => {

let option = document.createElement("option");

option.value = place.display_name;

datalist.appendChild(option);

});

});
document.getElementById("englishBtn").onclick = function(){
alert("English version coming soon!");
};
