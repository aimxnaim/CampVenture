import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const CampgroundMap = ({ campgrounds }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || !mapContainer.current) {
      return undefined;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [101.9758, 4.2105],
      zoom: 5
    });

    map.addControl(new mapboxgl.NavigationControl());
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const markers = [];

    campgrounds
      .filter((campground) => campground.geometry?.coordinates?.length === 2)
      .forEach((campground) => {
        const marker = new mapboxgl.Marker({ color: '#198754' })
          .setLngLat(campground.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 24 }).setHTML(
              `<div style="max-width: 220px;">
                <h6 style="margin-bottom: 0.5rem;">${campground.title}</h6>
                <p style="margin: 0; font-size: 0.85rem; color: #64748b;">${campground.location}</p>
              </div>`
            )
          )
          .addTo(map);

        markers.push(marker);
      });

    if (markers.length) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((marker) => bounds.extend(marker.getLngLat()));
      map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 800 });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [campgrounds]);

  if (!token) {
    return (
      <div className="alert alert-warning" role="alert">
        Mapbox token is not configured. Set the <code>VITE_MAPBOX_TOKEN</code> environment variable to enable the interactive map.
      </div>
    );
  }

  return <div ref={mapContainer} style={{ height: 400, borderRadius: '1rem', overflow: 'hidden' }} />;
};

export default CampgroundMap;
