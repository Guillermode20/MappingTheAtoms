import { memo, useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNuclearData } from '../../hooks/useNuclearData';
import CountrySelector from './CountrySelector';
import ReactorModal from './ReactorModal';
import {
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_LAYER_URL,
  PLACEHOLDER_TILE,
  countryViews,
} from '../../utils/MapConstants';
import {
  getMarkerStyle,
  createClusterIcon,
  handleClusterClick,
  restorePreviousView,
} from '../../utils/MapUtils';

const MapComponent = memo(function MapComponent({ isFullscreen }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(null);
  const previousViewRef = useRef(null);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedReactors, setSelectedReactors] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { plants: nuclearPowerPlants } = useNuclearData();

  const RENDERER = useRef(L.canvas({ preferCanvas: true }));

  const createAndAddMarkers = useCallback((plants) => {
    if (!markersRef.current || !mapInstance.current) {
      console.warn('Map or markers not initialized yet');
      return;
    }
    
    if (!plants?.length) {
      console.warn('No plants data provided:', plants);
      return;
    }

    markersRef.current.clearLayers();

    const filteredMarkers = plants.filter((plant) => {
      return plant && plant.Latitude && plant.Longitude && plant.Name;
    });

    console.log('Filtered markers:', filteredMarkers);

    const groupedMarkers = filteredMarkers.reduce((acc, plant) => {
      if (!plant.Name) {
        console.warn('Plant missing name:', plant);
        return acc;
      }

      // Remove unit indicators like A1, B2, Unit 1, etc.
      const baseName = plant.Name
        .replace(/[-\s]?(Unit\s+\d+|\([^)]*\)|\s*[A-Z]?\d+)$/i, '')
        .replace(/[-\s]+$/, '')
        .replace(/-[A-Z]\d+$/, '');
      
      // Create a unique key combining base name and location
      const key = `${baseName}_${plant.Latitude}_${plant.Longitude}`;
      
      acc[key] = acc[key] || [];
      acc[key].push(plant);
      return acc;
    }, {});

    Object.entries(groupedMarkers).forEach(([, group]) => {
      // Use coordinates from the first plant in the group
      const lat = group[0].Latitude; // Changed from lowercase
      const lng = group[0].Longitude; // Changed from lowercase
      const primaryStatus = group[0]?.Status; // Changed from lowercase
      const style = getMarkerStyle(primaryStatus);

      // Create a div element for the marker
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          width: ${style.radius * 2}px;
          height: ${style.radius * 2}px;
          background-color: ${style.fillColor};
          border: ${style.weight}px solid ${style.color};
          border-radius: 50%;
          opacity: ${style.fillOpacity};
        "></div>`,
        iconSize: [style.radius * 2, style.radius * 2],
        iconAnchor: [style.radius, style.radius]
      });

      const marker = L.marker([lat, lng], { icon });

      marker.on('click', (e) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        setSelectedReactors(group);
        setIsModalOpen(true);
      });

      markersRef.current.addLayer(marker);
    });

    // Ensure the marker cluster is added to the map
    if (mapInstance.current && !mapInstance.current.hasLayer(markersRef.current)) {
      mapInstance.current.addLayer(markersRef.current);
    }
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;

    console.log('Initializing map...');
    const map = L.map(mapRef.current, {
      center: [20, 0], // Set default center to global view
      zoom: 2, // Set default zoom level to show the global view
      maxBounds: [[-90, -180], [90, 180]], // Changed from -Infinity/Infinity to -180/180
      maxBoundsViscosity: 1.5,
      preferCanvas: true,
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      renderer: RENDERER.current,
      fadeAnimation: true,
      zoomAnimation: true,
      wheelDebounceTime: isFullscreen ? 100 : 150,
      updateWhenZooming: false, // Avoid redundant tile requests during zoom
      keepBuffer: 16, // Increase buffer to retain more tiles around the viewport
      padding: 16, // Increase padding to load tiles outside the viewport
      // Add these new options
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      worldCopyJump: true,
    });

    // Create custom pane for markers to ensure they render above tiles
    map.createPane('markers');
    map.getPane('markers').style.zIndex = 650;

    // Remove the scale control code that was here

    mapInstance.current = map;

    L.tileLayer(TILE_LAYER_URL, {
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      attribution: '© OpenStreetMap contributors',
      errorTileUrl: PLACEHOLDER_TILE,
      updateWhenIdle: true,
      keepBuffer: 100, // Increase buffer to retain more tiles around the viewport
      padding: 100, // Increase padding to load tiles outside the viewport
      // Add these options for better tile rendering
      className: 'dark-tiles',
      tileSize: 512,
      zoomOffset: -1,
      crossOrigin: true
    }).addTo(map);

    const markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      chunkProgress: (processed, total) => {
        console.log(`Loading markers: ${processed}/${total}`);
      },
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      removeOutsideVisibleBounds: true, // Optimize for performance
      maxClusterRadius: 40,
      iconCreateFunction: createClusterIcon,
      // Add these options
      animate: true,
      animateAddingMarkers: true,
      disableClusteringAtZoom: 15,
      pane: 'markers'
    });

    markerCluster.on('clusterclick', (event) => {
      handleClusterClick(event, mapInstance, previousViewRef);
    });

    map.on('click', (e) => {
      if (!e.originalEvent.defaultPrevented) {
        restorePreviousView(mapInstance, previousViewRef);
      }
    });

    markersRef.current = markerCluster;
    map.addLayer(markerCluster);

  }, [isFullscreen]); // Remove createAndAddMarkers and nuclearPowerPlants from dependencies

  const handleCountryChange = (event) => {
    const country = event.target.value;
    setSelectedCountry(country);
    if (mapInstance.current && countryViews[country]) {
      mapInstance.current.flyTo(countryViews[country].center, countryViews[country].zoom, { duration: 1 });
      const filteredMarkers = nuclearPowerPlants.filter(
        (plant) => plant.CountryCode === country && plant.Latitude && plant.Longitude // Changed from lowercase
      );
      createAndAddMarkers(filteredMarkers);
    }
  };

  const handleReactorChange = (event) => {
    const reactorId = parseInt(event.target.value, 10);
    const reactor = nuclearPowerPlants.find((plant) => plant.Id === reactorId);
    if (reactor && mapInstance.current) {
      mapInstance.current.flyTo([reactor.Latitude, reactor.Longitude], 10, { duration: 1 });
      setSelectedReactors([reactor]);
      // Remove the line that opens the modal
      // setIsModalOpen(true);
    }
  };


  const handleBackClick = () => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([20, 0], 2, { duration: 1 });
      setSelectedCountry('');
      createAndAddMarkers(nuclearPowerPlants);
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      if (markersRef.current) {
        markersRef.current.clearLayers();
      }
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initializeMap]);

  // Add new effect to handle marker creation after data loads
  useEffect(() => {
    if (nuclearPowerPlants?.length > 0 && mapInstance.current) {
      console.log('Creating markers with plants:', nuclearPowerPlants);
      createAndAddMarkers(nuclearPowerPlants);
    }
  }, [nuclearPowerPlants, createAndAddMarkers]);

  return (
    <div
      className={`relative h-full w-full bg-transparent rounded-xl ${isFullscreen ? 'p-0' : 'p-2 md:p-4'} transition-colors`}
    >
      <div
        ref={mapRef}
        className="absolute inset-0 w-full h-full rounded-lg overflow-hidden"
        style={{ outline: 'none' }}
      />

      <CountrySelector
        selectedCountry={selectedCountry}
        onCountryChange={handleCountryChange}
        onBack={handleBackClick}
        reactors={nuclearPowerPlants.filter((plant) => plant.Country === selectedCountry)}
        onReactorChange={handleReactorChange}
      />

      {isModalOpen && selectedReactors && (
        <ReactorModal reactors={selectedReactors} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
});

MapComponent.propTypes = {
  isFullscreen: PropTypes.bool,
};

export default MapComponent;
