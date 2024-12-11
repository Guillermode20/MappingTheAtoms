// MapConstants.js
export const MAX_ZOOM = 20;
export const MIN_ZOOM = 2;
export const FORCE_UNCLUSTERED_ZOOM = 15;
export const TILE_LAYER_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const PLACEHOLDER_TILE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const countryViews = {
    Argentina: { center: [-38.4161, -63.6167], zoom: 5 },
    Armenia: { center: [40.0691, 45.0382], zoom: 6 },
    Belgium: { center: [50.8503, 4.3517], zoom: 7 },
    Brazil: { center: [-14.2350, -51.9253], zoom: 4 },
    Bulgaria: { center: [42.7339, 25.4858], zoom: 6 },
    // ...other countries...
};