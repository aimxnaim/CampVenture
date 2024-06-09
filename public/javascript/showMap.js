mapboxgl.accessToken = mapBoxToken;

const map = new mapboxgl.Map({
    container: 'mapShow',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: campground.geometry.coordinates,
    zoom: 10,
});

// Update the map style when a different option is selected
const layerList = document.querySelector('#menu select');
layerList.onchange = function () {
    const layerId = this.options[this.selectedIndex].id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
};

// Ensure the map resizes properly when the tab is shown
document.querySelector('#myTab').addEventListener('shown.bs.tab', function (event) {
    if (event.target.hash === '#map-tab-pane') {
        setTimeout(() => {
            map.resize();
        }, 200); // Ensure sufficient delay for tab transition
    }
});

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// Resize the map after load to ensure it renders correctly
map.on('load', function () {
    setTimeout(function () {
        map.resize();
    }, 500); // Adjust this value as needed
});

// Resize the map when the tab is clicked
document.querySelector('#map-tab').addEventListener('click', function () {
    setTimeout(() => {
        map.resize();
    }, 200); // Adjust this delay as needed
});

// Add a marker and popup to the map
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h7><strong>${campground.title}</strong></h7><p>${campground.location}</p>`
            )
    )
    .addTo(map);
