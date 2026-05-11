import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import StatePopup from "./StatePopup";

const riskColors = {
  SAFE: "#3fbf7f",
  MODERATE: "#d9bd4a",
  RISKY: "#d9823a",
  "HIGH RISK": "#c9534b",
};

const normalizeState = (name = "") =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const IndiaSafetyMap = ({ mapData, onStateSelect, selectedState }) => {
  const [geoJson, setGeoJson] = useState(null);
  const [error, setError] = useState("");

  const stateByName = useMemo(() => {
    const pairs = (mapData?.states || []).flatMap((state) => [
      [normalizeState(state.state), state],
      [state.id, state],
    ]);
    return Object.fromEntries(pairs);
  }, [mapData?.states]);

  useEffect(() => {
    if (!mapData?.geoJsonUrl) return;
    fetch(mapData.geoJsonUrl)
      .then((response) => {
        if (!response.ok) throw new Error("GeoJSON boundary file not available.");
        return response.json();
      })
      .then(setGeoJson)
      .catch((err) => setError(err.message || "Unable to load India boundaries."));
  }, [mapData?.geoJsonUrl]);

  const getState = (feature) => stateByName[normalizeState(feature?.properties?.st_nm)];

  return (
    <div className="h-[460px] overflow-hidden rounded-lg border border-white/10 bg-[#100d0b] xl:h-[500px]">
      {error && <div className="p-4 text-sm text-red-200">{error}</div>}
      <MapContainer
        attributionControl={false}
        center={[22.7, 79.5]}
        className="h-full w-full"
        maxBounds={[[5.5, 66], [37.5, 98]]}
        minZoom={4}
        scrollWheelZoom
        zoom={5}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {geoJson && (
          <GeoJSON
            data={geoJson}
            key={`${selectedState?.id || "none"}-${mapData?.states?.length || 0}`}
            onEachFeature={(feature, layer) => {
              const state = getState(feature);
              if (state) {
                layer.bindTooltip(state.state, {
                  className: "safety-map-tooltip",
                  direction: "center",
                  opacity: 0,
                  permanent: false,
                  sticky: true,
                });
              }
              layer.bindPopup(StatePopup(state));
              layer.on({
                click: () => state && onStateSelect(state),
                mouseout: () => {
                  const isSelected = selectedState?.id && selectedState.id === state?.id;
                  layer.setStyle({
                    color: isSelected ? "#f7e7c6" : "#2b211a",
                    fillOpacity: isSelected ? 0.62 : 0.36,
                    weight: isSelected ? 2.2 : 0.9,
                  });
                  layer.closeTooltip();
                },
                mouseover: () => {
                  layer.setStyle({
                    color: "#f7e7c6",
                    fillOpacity: 0.68,
                    weight: 2.6,
                  });
                  layer.openTooltip();
                },
              });
            }}
            style={(feature) => {
              const state = getState(feature);
              const isSelected = selectedState?.id && selectedState.id === state?.id;
              const color = riskColors[state?.safetyCategory] || "#3f3a34";
              return {
                color: isSelected ? "#f7e7c6" : "#2b211a",
                fillColor: color,
                fillOpacity: state ? (isSelected ? 0.62 : 0.36) : 0.12,
                opacity: 1,
                weight: isSelected ? 2.2 : 0.9,
              };
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default IndiaSafetyMap;
