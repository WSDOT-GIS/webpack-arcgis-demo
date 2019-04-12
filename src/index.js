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

const defaultLineSymbol = new SimpleLineSymbol();
const defaultPointSymbol = new SimpleMarkerSymbol();
const defaultTemplate = new PopupTemplate({
  content: "{*}",
  title: "{Route}"
});

/**
 * Converts a RouteLocation into an ArcGIS API Graphic.
 * @param {RouteLocation} routeLocation
 * @returns {esri/Graphic}
 */
function routeLocationToGraphic(routeLocation) {
  const routeGeometry = routeLocation.RouteGeometry;
  delete routeLocation.RouteGeometry;
  let gType = routeGeometry.__type;
  let symbol;
  if (/Polyline/i.test(gType)) {
    gType = "polyline";
    symbol = defaultLineSymbol;
  } else if (/Point/i.test(gType)) {
    gType = "point"
    symbol = defaultPointSymbol;
  } else {
    throw new TypeError(`unexpected geometry type ${gType}`);
  }
  delete routeGeometry.__type;
  routeGeometry.type = gType;
  return new Graphic({
    geometry: routeGeometry,
    attributes: routeLocation.toJSON(),
    symbol,
    popupTemplate: defaultTemplate
  });
}

// After the view has loaded, setup the event handlers for the ELC UI.
view.when(() => {
  elcUI.root.addEventListener("find-route-location-submit", async (e) => {
    const routeLocation = new RouteLocation(e.detail);
    console.log("find-route-location-submit", routeLocation);
    const locations = await routeLocator.findRouteLocations({ locations: [routeLocation], outSR: mapSR });
    console.log("locations", locations);
    const graphics = locations.map(routeLocationToGraphic);
    console.debug("graphics", graphics);
    // add graphic to map or show popup.
    graphicsLayer.addMany(graphics);

    view.popup.open({
      features: graphics
    });
  });

  elcUI.root.addEventListener("find-nearest-route-location-submit", async (e) => {
    const { radius } = e.detail;
    console.log("find-nearest-route-location-submit: radius", radius);


    view.on("click", async (ev) => {
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

