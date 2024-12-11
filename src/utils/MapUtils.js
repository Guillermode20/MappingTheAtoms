// MapUtils.js
import L from 'leaflet';
import { FORCE_UNCLUSTERED_ZOOM } from './MapConstants';

export const getMarkerStyle = (status) => {
    const baseStyle = {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
    };

    const statusLower = status?.toLowerCase();

    if (statusLower?.includes('shutdown') || statusLower?.includes('decommissioned')) {
        return { ...baseStyle, fillColor: '#ff4444' };
    } else if (statusLower?.includes('operational') || statusLower?.includes('operating')) {
        return { ...baseStyle, fillColor: '#44ff44' };
    }

    return { ...baseStyle, fillColor: '#ffaa44' };
};

export const createClusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 30 : count < 100 ? 35 : 40;

    return L.divIcon({
        html: `<div style="
        background-color: rgba(255, 255, 255, 0);
        border: 2px solid #ffffff;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        font-weight: bold;
        color: white;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      ">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: L.point(size, size),
    });
};

export const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('shutdown') || statusLower?.includes('decommissioned')) {
        return 'text-red-400';
    } else if (statusLower?.includes('operational') || statusLower?.includes('operating')) {
        return 'text-green-400';
    } else if (statusLower?.includes('construction')) {
        return 'text-yellow-400';
    }
    return 'text-orange-400';
};

export const formatValue = (value, unit = '') => value ? `${value} ${unit}`.trim() : 'N/A';

export const handleClusterClick = (event, mapInstance, previousViewRef) => {
    const cluster = event.layer;
    const childMarkers = cluster.getAllChildMarkers();
    const currentZoom = mapInstance.current.getZoom();

    previousViewRef.current = { center: mapInstance.current.getCenter(), zoom: currentZoom };

    const bounds = L.latLngBounds(childMarkers.map((marker) => marker.getLatLng()));

    if (currentZoom >= FORCE_UNCLUSTERED_ZOOM - 1) {
        mapInstance.current.setView(cluster.getLatLng(), FORCE_UNCLUSTERED_ZOOM);
        return;
    }

    const targetZoom = Math.max(
        mapInstance.current.getBoundsZoom(bounds),
        currentZoom + 1,
        Math.min(currentZoom + 3, FORCE_UNCLUSTERED_ZOOM)
    );

    mapInstance.current.flyToBounds(bounds, {
        duration: 0.5,
        maxZoom: targetZoom,
        padding: [50, 50],
    });
};

export const restorePreviousView = (mapInstance, previousViewRef) => {
    if (previousViewRef.current) {
        const { center, zoom } = previousViewRef.current;
        mapInstance.current.flyTo(center, zoom, { duration: 0.5 });
        previousViewRef.current = null;
    }
};