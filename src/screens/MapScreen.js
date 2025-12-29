import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

const styles = StyleSheet.create({
container: {
...StyleSheet.absoluteFillObject,
flex: 1,
justifyContent: 'flex-end',
alignItems: 'center',
},
map: {
...StyleSheet.absoluteFillObject,
},
button: {
position: 'absolute',
bottom: 30,
backgroundColor: '#4285F4',
padding: 15,
borderRadius: 8,
elevation: 5,
},
buttonText: {
color: '#FFF',
fontWeight: 'bold',
fontSize: 16,
},
});

export default function GoogleMapsScreen() {
const mapRef = useRef(null);

const [region, setRegion] = useState({
latitude: 37.78825,
longitude: -122.4324,
latitudeDelta: 0.015,
longitudeDelta: 0.0121,
});

// Markers data
const markers = [
{
id: 1,
coordinate: {
latitude: 37.78825,
longitude: -122.4324,
},
title: "San Francisco",
description: "Starting point in San Francisco",
},
{
id: 2,
coordinate: {
latitude: 37.79025,
longitude: -122.4350,
},
title: "Destination",
description: "Nearby destination point",
},
];

useEffect(() => {
// Animate to region when coordinates change
if (mapRef.current) {
mapRef.current.animateToRegion(region, 1000); // 1000ms animation
}
}, [region.latitude, region.longitude]);

const goToNewDelhi = () => {
setRegion({
latitude: 28.6139,
longitude: 77.2090,
latitudeDelta: 0.015,
longitudeDelta: 0.0121,
});
};

return (
<View style={styles.container}>
<MapView
ref={mapRef}
provider={PROVIDER_GOOGLE} 
style={styles.map}
initialRegion={region}
>
{markers.map((marker) => (
<Marker
key={marker.id}
coordinate={marker.coordinate}
title={marker.title}
description={marker.description}
/>
))}
</MapView>

<TouchableOpacity style={styles.button} onPress={goToNewDelhi}>
<Text style={styles.buttonText}>Go to New Delhi</Text>
</TouchableOpacity>
</View>
);
}