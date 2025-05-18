import React, { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapPicker = (props) => {
  const initialPosition = props.initialPosition || { lat: 41.2995, lng: 69.2401 };
  const onLocationSelect = props.onLocationSelect;

  const { isLoaded } = useLoadScript({
	googleMapsApiKey: "AIzaSyC7Q1pA9qy-MRh8nVWYClShjqVlql83SEQ", // <- bu yerga API kalitingizni yozing
  });

  const [selected, setSelected] = useState(initialPosition);

  const handleMapClick = (e) => {
	if (e.latLng) {
	  const lat = e.latLng.lat();
	  const lng = e.latLng.lng();
	  setSelected({ lat, lng });
	  if (onLocationSelect) {
		onLocationSelect(lat, lng);
	  }
	}
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
	<GoogleMap
	  mapContainerStyle={containerStyle}
	  center={selected}
	  zoom={13}
	  onClick={handleMapClick}
	>
	  <Marker position={selected} />
	</GoogleMap>
  );
};

export default MapPicker;
