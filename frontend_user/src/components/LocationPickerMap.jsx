import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Fix default icon paths broken by webpack */
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/* Inner component that listens to click events */
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * LocationPickerMap
 * Props:
 *   lat      {number|null}  current latitude
 *   lng      {number|null}  current longitude
 *   onChange {Function}     called with (lat, lng) when user clicks
 *   height   {string}       CSS height, default "280px"
 */
export default function LocationPickerMap({ lat, lng, onChange, height = "280px" }) {
  /* Default centre = Sri Lanka */
  const defaultCenter = [7.8731, 80.7718];
  const zoom = lat ? 13 : 7;

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(84,172,191,0.45)" }}>
      <MapContainer
        center={lat ? [lat, lng] : defaultCenter}
        zoom={zoom}
        style={{ height, width: "100%" }}
        key={`${lat}-${lng}`}   /* re-mount when coords change externally */
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <ClickHandler onPick={onChange} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>

      {/* Coordinates display */}
      <div style={{
        padding: "8px 14px",
        background: "rgba(2,8,20,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: "rgba(167,235,242,0.8)" }}>
          📍 Click on the map to pin your location
        </span>
        {lat && lng ? (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#a7ebf2", fontFamily: "monospace" }}>
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "rgba(167,235,242,0.4)" }}>No pin set</span>
        )}
      </div>
    </div>
  );
}
