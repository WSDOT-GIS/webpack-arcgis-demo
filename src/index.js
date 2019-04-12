// module import
import PopupTemplate from "esri/PopupTemplate";
import Graphic from "esri/Graphic";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "esri/symbols/SimpleLineSymbol";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import Extent from "esri/geometry/Extent";
import Expand from "esri/widgets/Expand";
import { RouteLocation, RouteLocator } from "wsdot-elc";
import { ElcUI } from "@wsdot/elc-ui";

/**
 * Extent of WA.
 * @see https://epsg.io/1416-area
 */
const waExtent = new Extent({
  xmax: -116.91,
  ymin: 45.54,
  xmin: -124.79,
  ymax: 49.05
});

// Create outSR value for ELC use.
const mapSR = 3857;

// Create map and map view.
const map = new EsriMap({
  basemap: "streets-navigation-vector"
});

const view = new MapView({
  map,
  container: "map",
  extent: waExtent
})

const elcDiv = document.createElement("div");
// See https://developers.arcgis.com/javascript/latest/guide/styling/index.html
elcDiv.classList.add("esri-widget");

// Create ELC UI and add inside of an Expand widget to the view UI.
const elcExpand = new Expand({
  content: elcDiv,
  expanded: true
});

const elcUI = new ElcUI(elcDiv);

view.ui.add(elcExpand, "top-left");

// Create route locator client object.
const routeLocator = new RouteLocator();
const graphicsLayer = new GraphicsLayer({
  fullExtent: waExtent
});
map.add(graphicsLayer);

// get a list of supported routes and set UI's routes property.
(async () => {
  const routes = await routeLocator.getRouteList(true);
  elcUI.routes = routes["Current"];
  console.log("routes", routes);
})();

// Setup default symbology and template content.
const defaultLineSymbol = new SimpleLineSymbol();
const defaultPointSymbol = new SimpleMarkerSymbol();
const defaultTemplate = new PopupTemplate({
  content: "{*}", // This will display all attributes of the selected graphic.
  title: "{Route}" // This will show the "Route" attribute of the selected graphic.
});

/**
 * Converts a RouteLocation into an ArcGIS API Graphic.
 * @param {RouteLocation} routeLocation
 * @returns {esri/Graphic}
 */
function routeLocationToGraphic(routeLocation) {
  const routeGeometry = routeLocation.RouteGeometry;
  delete routeLocation.RouteGeometry;
  let symbol;
  // Detect the geometry type.
  // Set the symbol to appropriate default for geometry type.
  let gType = routeGeometry.__type;
  if (/Polyline/i.test(gType)) {
    gType = "polyline";
    symbol = defaultLineSymbol;
  } else if (/Point/i.test(gType)) {
    gType = "point"
    symbol = defaultPointSymbol;
  } else {
    throw new TypeError(`unexpected geometry type ${gType}`);
  }
  // Remove the __type property and replace with ArcGIS style type property.
  delete routeGeometry.__type;
  routeGeometry.type = gType;

  // Create and return the Graphic object.
  return new Graphic({
    geometry: routeGeometry,
    attributes: routeLocation.toJSON(), // Convert to JSON so that popups do not display prototype functions, etc.
    symbol,
    popupTemplate: defaultTemplate
  });
}

// After the view has loaded, setup the event handlers for the ELC UI.
view.when(() => {
  elcUI.root.addEventListener("find-route-location-submit", async (e) => {
    // Create a route location using event detail.
    const routeLocation = new RouteLocation(e.detail);
    // Call ELC find route locations
    const locations = await routeLocator.findRouteLocations({ locations: [routeLocation], outSR: mapSR });
    // Convert found route locations to ArcGIS Graphics.
    const graphics = locations.map(routeLocationToGraphic);
    // add graphics to the Graphics layer.
    graphicsLayer.addMany(graphics);
    // Open the popup to show the graphics.
    view.popup.open({
      features: graphics
    });
  });

  // This event is triggered when the user clicks the button to find *nearest* route location.
  // Once user has clicked this button, they must click one more time on the map near a
  // state route (within the search radius).
  elcUI.root.addEventListener("find-nearest-route-location-submit", async (e) => {
    // Get the search radius from the event detail.
    const { radius } = e.detail;

    const handle = view.on("click", async (ev) => {
      const point = ev.mapPoint;
      const locations = await routeLocator.findNearestRouteLocations({
        coordinates: [point.x, point.y],
        inSR: point.spatialReference.wkid,
        outSR: point.spatialReference.wkid,
        searchRadius: radius,
        referenceDate: new Date()
      });
      const graphics = locations.map(routeLocationToGraphic);
      graphicsLayer.addMany(graphics);
      view.popup.open({
        features: graphics
      });
      // Disconnect the click event after it has been triggered.
      handle.remove();
    });
  });

  // Setup the clear graphics button
  const clearGfxBtn = document.querySelector("button.clear-graphics-button");
  clearGfxBtn.addEventListener("click", () => {
    if (window.confirm("Are you sure you want to clear all graphics")) {
      graphicsLayer.removeAll();
    }
  });

});

