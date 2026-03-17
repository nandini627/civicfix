import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position);
        }
    }, [position, map]);
    return null;
}

const LocationPicker = ({ onLocationSelect, initialPosition = null }) => {
  const [position, setPosition] = useState(initialPosition);
  const [loading, setLoading] = useState(!initialPosition);

  useEffect(() => {
    if (!initialPosition) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(newPos);
          onLocationSelect(newPos);
          setLoading(false);
        },
        () => {
          // Default to a central location if geolocation fails (e.g., London or NYC or user's specific city if known)
          const defaultPos = { lat: 20.5937, lng: 78.9629 }; // Center of India
          setPosition(defaultPos);
          onLocationSelect(defaultPos);
          setLoading(false);
        }
      );
    }
  }, [initialPosition, onLocationSelect]);

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    onLocationSelect(newPos);
  };

  if (loading) {
    return (
      <div className="h-64 md:h-80 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-pulse">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Acquiring GPS Signal...</p>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={handlePositionChange} />
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
