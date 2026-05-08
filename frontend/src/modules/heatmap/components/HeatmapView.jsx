import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import HeatLayer from "../HeatLayer";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const HeatmapView = ({ points }) => (
  <article className="overflow-hidden rounded-lg border border-white/10 bg-police-panel">
    <div className="h-[68vh] min-h-[520px]">
      <MapContainer center={[20.5937, 78.9629]} className="h-full w-full" scrollWheelZoom zoom={5}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <HeatLayer points={points} />
        {points.map((point, index) => (
          <Marker icon={markerIcon} key={`${point.latitude}-${point.longitude}-${point.createdAt}-${index}`} position={[point.latitude, point.longitude]}>
            <Popup>
              <strong>{point.crimeType}</strong><br />
              Status: {point.status}<br />
              Date: {new Date(point.createdAt).toLocaleDateString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  </article>
);

export default HeatmapView;
