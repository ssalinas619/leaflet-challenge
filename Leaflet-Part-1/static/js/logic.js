// Store our API endpoint as queryUrl
// All earthquakes from the past day
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  createMap(data.features);
});

function createMap(earthquakeData) {
  // Reflect the magnitude of the earthquake by size of the data marker
  function markerSize(magnitude) {
    return magnitude * 5;
  }

  // Reflect depth of the earthquake by color of the data marker
  function markerColor(depth) {
    return depth > 90 ? '#FFD6C9' :
    depth > 70  ? '#FFE7D1' :
    depth > 50  ? '#FFF8B8' :
    depth > 30  ? '#FFEFFD6' :
    depth > 10   ? '#E0FFCC':
    depth > -10   ? '#CAF2C2':
               '#CAF2C2';
  }

  // Include popups that provide additional information about the earthquake when its associated marker is clicked
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3>
      <hr>
      <p>Magnitude: ${feature.properties.mag}</p>
      <p>Depth: ${feature.geometry.coordinates[2]} km</p>
      <p>Time: ${new Date(feature.properties.time)}</p>`
    );
  }

  // Create an array to hold the earthquake markers.
  let earthquakeMarkers = [];

  // Loop through the earthquakeData and create markers for each earthquake.
  earthquakeData.forEach(function (earthquake) {
    let coordinates = earthquake.geometry.coordinates;
    let magnitude = earthquake.properties.mag;
    let depth = coordinates[2];

    let earthquakeMarker = L.circleMarker([coordinates[1], coordinates[0]], {
      radius: markerSize(magnitude),
      fillColor: markerColor(depth),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 1,
    });

    earthquakeMarkers.push(earthquakeMarker);
  });

  // Create a layer group for the earthquake markers.
  let earthquakes = L.layerGroup(earthquakeMarkers);

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create map
  let myMap = L.map("map", {
    center: [
      30.26, -97.74
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Create legend
 let legend = L.control({ position: "bottomright" });

 legend.onAdd = function () {
  let div = L.DomUtil.create("div", "info legend");
  let depths = [-10, 10, 30, 50, 70, 90];
  let colors = ['#CAF2C2', '#E0FFCC', '#FFEFFD6', '#FFF8B8', '#FFE7D1', '#FFD6C9'];

  for (let i = 0; i < depths.length; i++) {
    let color = colors[i];
    let depthLabel = depths[i];
    let nextDepthLabel = depths[i + 1];

    let labelText = depthLabel + (nextDepthLabel ? "&ndash;" + nextDepthLabel : "+") + " km";

    div.innerHTML +=
      '<i style="background:' + color + '"></i> ' + labelText + "<br>";
  }

  return div;
};
 
 
 // Add the legend to the map.
 legend.addTo(myMap);


}
