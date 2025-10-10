import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const CampgroundDetailMap = ({ campground }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const coordinates = campground?.geometry?.coordinates;

  useEffect(() => {
    if (!token || !mapContainer.current || !coordinates || coordinates.length !== 2) {
      return undefined;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coordinates,
      zoom: 10
    });

    map.addControl(new mapboxgl.NavigationControl());

    const marker = new mapboxgl.Marker({ color: '#dc3545' })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 24 }).setHTML(
          `<div style="max-width: 220px;">
            <h6 style="margin-bottom: 0.5rem;">${campground.title}</h6>
            <p style="margin: 0; font-size: 0.85rem; color: #64748b;">${campground.location}</p>
          </div>`
        )
      )
      .addTo(map);

    mapRef.current = map;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [token, coordinates, campground?.title, campground?.location]);

  if (!token) {
    return (
      <div className="alert alert-warning" role="alert">
        Mapbox token is not configured. Set the <code>VITE_MAPBOX_TOKEN</code> environment variable to enable the map.
      </div>
    );
  }

  if (!coordinates || coordinates.length !== 2) {
    return <p className="text-muted">Map location will appear once coordinates are available.</p>;
  }

  return <div ref={mapContainer} style={{ height: 400, borderRadius: '1rem', overflow: 'hidden' }} />;
};

export default CampgroundDetailMap;
