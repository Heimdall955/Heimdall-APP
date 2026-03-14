import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
  color: string;
  isFavorite?: boolean;
  isUser?: boolean;
}

interface TrailMapProps {
  userLat: number;
  userLng: number;
  markers: MapMarker[];
  height?: number;
  onMarkerPress?: (id: string) => void;
  selectedId?: string | null;
}

export function TrailMap({ userLat, userLng, markers, height = 300, onMarkerPress, selectedId }: TrailMapProps) {
  const webviewRef = useRef<WebView>(null);

  const markersJson = JSON.stringify(markers);
  const selected = selectedId || '';

  const html = `
<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#1a1a2e}
  #map{width:100%;height:100vh;border-radius:12px;overflow:hidden}
  .user-marker{background:#4361ee;border:3px solid #fff;border-radius:50%;width:16px;height:16px;box-shadow:0 0 12px rgba(67,97,238,0.6)}
  .trail-marker{width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)}
  .fav-marker{width:14px;height:14px;border-radius:50%;border:2px solid #ffd700;box-shadow:0 0 8px rgba(255,215,0,0.5)}
  .selected-marker{width:16px;height:16px;border:3px solid #fff;box-shadow:0 0 16px rgba(255,255,255,0.6)}
  .popup-content{font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:4px}
  .popup-content h3{font-size:13px;margin:0 0 4px}
  .popup-content p{font-size:11px;margin:0;color:#666}
  .leaflet-popup-content-wrapper{border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
</style>
</head><body>
<div id="map"></div>
<script>
var map = L.map('map',{zoomControl:false,attributionControl:false}).setView([${userLat},${userLng}],13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(map);

// User marker
var userIcon = L.divIcon({className:'user-marker',iconSize:[16,16],iconAnchor:[8,8]});
L.marker([${userLat},${userLng}],{icon:userIcon}).addTo(map).bindPopup('<div class="popup-content"><h3>Tu ubicacion</h3></div>');

var markers = ${markersJson};
var selectedId = '${selected}';
var group = L.featureGroup();

markers.forEach(function(m){
  var cls = m.isFavorite ? 'fav-marker' : 'trail-marker';
  if(m.id === selectedId) cls += ' selected-marker';
  var icon = L.divIcon({
    className: cls,
    iconSize: m.id === selectedId ? [16,16] : [12,12],
    iconAnchor: m.id === selectedId ? [8,8] : [6,6],
    html: '<div style="width:100%;height:100%;border-radius:50%;background:'+m.color+'"></div>'
  });
  var mk = L.marker([m.lat,m.lng],{icon:icon}).addTo(map);
  mk.bindPopup('<div class="popup-content"><h3>'+m.name+'</h3></div>');
  mk.on('click',function(){
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'marker',id:m.id}));
  });
  group.addLayer(mk);
});

// Also add user to group for bounds
group.addLayer(L.marker([${userLat},${userLng}]));
if(group.getLayers().length > 1) map.fitBounds(group.getBounds().pad(0.15));

L.control.zoom({position:'bottomright'}).addTo(map);
</script>
</body></html>`;

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'marker' && onMarkerPress) {
        onMarkerPress(data.id);
      }
    } catch {}
  }, [onMarkerPress]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
          title="trail-map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
