import L from "leaflet";
import "leaflet.heat";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const HeatLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;

    const heatPoints = points.map((point) => [point.latitude, point.longitude, 0.7]);
    const layer = L.heatLayer(heatPoints, {
      radius: 28,
      blur: 22,
      maxZoom: 14,
      gradient: {
        0.2: "#C89B7B",
        0.5: "#8B5E3C",
        0.8: "#d97706",
        1: "#ef4444",
      },
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
};

export default HeatLayer;
