// module import
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

// get a list of supported routes and set UI's routes property.
(async () => {
  const routes = await routeLocator.getRouteList(true);
  elcUI.routes = routes["Current"];
  console.log("routes", routes);
})();

// After the view has loaded, setup the event handlers for the ELC UI.
view.when(() => {
  elcUI.root.addEventListener("find-route-location-submit", async (e) => {
    const routeLocation = new RouteLocation(e.detail);
    console.log("find-route-location-submit", routeLocation);
    const locations = await routeLocator.findRouteLocations({locations: [routeLocation], outSR: mapSR});
    console.log("locations", locations);

    // TODO: Do something with the returned location, such as add graphic to map or show popup.
  });

  elcUI.root.addEventListener("find-nearest-route-location-submit", async (e) => {
    console.log("find-nearest-route-location-submit radius", e.detail);

    // TODO: When this event is triggered, call code to handle map click event
    // then call routeLocator.findNearestRouteLocations() using the point where the user
    // clicked and the radius from e.detail.radius.

    // const results = await routeLocator.findNearestRouteLocations()

    // TODO: Do something with the returned location, such as add graphic to map or show popup.
  });
})

