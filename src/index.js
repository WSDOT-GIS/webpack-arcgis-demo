// module import
import { RouteLocation, RouteLocator } from "wsdot-elc";

// Create route locator client object.
const routeLocator = new RouteLocator();

// Find route location. Minimum required parameters.

(async () => {
  const dateString = "12/31/2011";
  const rl = new RouteLocation({
    Route: "005",
    Arm: 0,
    ReferenceDate: new Date(dateString)
  });

  const params = {
    useCors: true,
    locations: [rl]
  };

  const locations = await routeLocator.findRouteLocations(params);
  // do something with the locations.
  console.log("operation 1 results", locations);
})();

// use a single reference date insteat of per-location date
(async () => {
  const dateString = "12/31/2011";
  const rl = new RouteLocation({
    Route: "005",
    Arm: 0
  });

  const params = {
    useCors: true,
    locations: [rl],
    referenceDate: new Date(dateString)
  };

  const locations = await routeLocator.findRouteLocations(params);
  // do something with locations.
  console.log("operation 2 results", locations);
})();

// find nearest route location
(async () => {
  const params = {
    useCors: true,
    coordinates: [1083893.182, 111526.885],
    referenceDate: new Date("12/31/2011"),
    searchRadius: 1,
    inSR: 2927
  };

  const locations = await routeLocator.findNearestRouteLocations(params);
  // do something with locations.
  console.log("operation 2 results", locations);
})();

// get a list of supported routes
(async () => {
  const routes = await routeLocator.getRouteList(true);
  console.log("routes", routes);
})();