import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";


const containerStyle = {
  width: "100%",
  height: "100%", 
};

interface MapPickerProps {
  initialPosition?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void; 
  disabledMap?: boolean; 
  zoom?: number; 
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialPosition = null, 
  onLocationSelect,
  disabledMap = false,
  zoom = 13, 
}) => {
  
  const { isLoaded, loadError } = useLoadScript({
    
    googleMapsApiKey: "AIzaSyC7Q1pA9qy-MRh8nVWYClShjqVlql83SEQ",
   
  });

  
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    initialPosition
  );


 
 
useEffect(() => {
  if (initialPosition) {
    setSelected({
      lat: initialPosition.lat,
      lng: initialPosition.lng,
    });
  } else {
    setSelected(null);
  }
  console.log("MapPicker: initialPosition updated", initialPosition);
}, [initialPosition?.lat, initialPosition?.lng]);
 

  
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
  

    
    if (disabledMap || !onLocationSelect) {
      console.log("MapPicker: Click disabled or onLocationSelect missing. Returning.");
      return;
    }

    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      console.log("MapPicker: Clicked at", { lat, lng });
      setSelected({ lat, lng }); 
      onLocationSelect(lat, lng); 
      console.log("MapPicker: onLocationSelect called");
    }
  };

  
  if (loadError) {
    return <p>Error loading map: {loadError.message}</p>;
  }

  
  if (!isLoaded) {
    return <p>Loading Map...</p>;
  }

  
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selected || { lat: 41.2995, lng: 69.2401 }} 
      zoom={zoom} 
      onClick={handleMapClick} 
      options={{
       
        gestureHandling: disabledMap ? 'none' : 'auto',
        zoomControl: !disabledMap, 
        streetViewControl: !disabledMap, 
        fullscreenControl: !disabledMap, 
        disableDoubleClickZoom: disabledMap, 
      }}
    >
    
      {selected && <Marker position={selected} />}
    </GoogleMap>
  );
};

export default MapPicker;
