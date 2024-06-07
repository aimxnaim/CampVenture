// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM
// https://account.mapbox.com
mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
    container: 'mapShow', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

const layerList = document.querySelector('#menu select');

layerList.onchange = function () {
    const layerId = this.options[this.selectedIndex].id;
    map.setStyle('mapbox://styles/mapbox/' + layerId);
};

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h7><strong>${campground.title}</strong></h7><p>${campground.location}</p>`
            )
    )
    .addTo(map);