import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});


const locationIcon = new L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E83D39" width="40px" height="40px" style="filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.4));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`,
  className: "custom-location-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const currentLocationIcon = new L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3498db" width="40px" height="40px" style="filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.4));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`,
  className: "custom-location-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Reverse geocode to get district
async function reverseGeocode(lat, lng) {
  let district = "";
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await response.json();
    if (data && data.address) {
      const region = data.address.state_district || data.address.county || data.address.state || "";
      district = region.replace(" District", "");
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }
  return district;
}

function LocationMarker({ setFormData, formData, mode }) {
  const [position, setPosition] = useState(
    formData.latitude && formData.longitude
      ? [formData.latitude, formData.longitude]
      : null
  );

  // Sync position when formData changes (e.g. from "Use Current Location")
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setPosition([formData.latitude, formData.longitude]);
    }
  }, [formData.latitude, formData.longitude]);

  useMapEvents({
    async click(e) {
      // Only allow clicking to pin when in "pin" mode
      if (mode !== "pin") return;

      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      const district = await reverseGeocode(lat, lng);

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        district: district
      }));
    },
  });

  const icon = mode === "current" ? currentLocationIcon : locationIcon;

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

// Component to fly to a location on the map
function FlyToLocation({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ formData, setFormData }) {
  const [mode, setMode] = useState("pin"); // "pin" or "current"
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const district = await reverseGeocode(lat, lng);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          district: district,
        }));
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied. Please allow location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setGeoError("Location request timed out. Please try again.");
            break;
          default:
            setGeoError("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setGeoError("");
    // Clear previous location when switching modes
    setFormData((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
      district: "",
    }));
  };

  return (
    <div className="location-picker-wrapper">
      {/* Mode Toggle */}
      <div className="location-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${mode === "pin" ? "mode-btn-active" : ""}`}
          onClick={() => handleModeSwitch("pin")}
        >
          <span className="mode-icon">📌</span>
          <span>Pin on Map</span>
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "current" ? "mode-btn-active" : ""}`}
          onClick={() => handleModeSwitch("current")}
        >
          <span className="mode-icon">📡</span>
          <span>Use Current Location</span>
        </button>
      </div>

      {/* Current Location Button */}
      {mode === "current" && (
        <div className="current-location-section">
          <button
            type="button"
            className="get-location-btn"
            onClick={handleUseCurrentLocation}
            disabled={geoLoading}
          >
            {geoLoading ? (
              <>
                <span className="location-spinner"></span>
                <span>Detecting location...</span>
              </>
            ) : (
              <>
                <span>🎯</span>
                <span>Detect My Location</span>
              </>
            )}
          </button>
          {geoError && <p className="geo-error">{geoError}</p>}
          {formData.latitude && !geoError && (
            <p className="geo-success">✅ Location detected successfully!</p>
          )}
        </div>
      )}

      {/* Map hint */}
      {mode === "pin" && !formData.latitude && (
        <p className="map-hint">👆 Click on the map below to pin the violation location</p>
      )}

      {/* Map */}
      <div className="map-container-wrapper">
        <MapContainer
          center={[7.8731, 80.7718]} // Sri Lanka center
          zoom={7}
          minZoom={7}
          maxBounds={[[5.9, 79.5], [9.9, 81.9]]}
          style={{ height: "350px", width: "100%", borderRadius: "12px" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker
            formData={formData}
            setFormData={setFormData}
            mode={mode}
          />

          {/* Fly to detected location */}
          {formData.latitude && formData.longitude && (
            <FlyToLocation lat={formData.latitude} lng={formData.longitude} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
