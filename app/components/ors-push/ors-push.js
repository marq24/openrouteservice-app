angular.module("orsApp.ors-push", []).component("orsPush", {
  templateUrl: "components/ors-push/ors-push.html",
  bindings: {
    onfinish: "<"
  },
  controller: [
    "$scope",
    "$filter",
    "orsRouteService",
    "orsPushService",
    function($scope, $filter, orsRouteService, orsPushService) {
      let ctrl = this;
      ctrl.btDisabled = false;
      ctrl.spinner = false;
      ctrl.closeDialogOnMsgOk = true;
      ctrl.showMsgDialog = false;
      ctrl.message = "";
      $scope.translateFilter = $filter("translate");

      ctrl.okOnDialog = function() {
        ctrl.showMsgDialog = false;
        if (ctrl.closeDialogOnMsgOk) {
          ctrl.onfinish();
        }
      };

      ctrl.pushRoute = () => {
        //ctrl.message = $scope.translateFilter('PUSH_NO_LOCATION_MSG');
        //ctrl.closeDialogOnMsgOk = false;
        //ctrl.showMsgDialog = true;
        //return;

        ctrl.btDisabled = true;
        ctrl.spinner = true;

        // POST the current route as JSON to emacberry.com
        // backend...
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              let lat =
                Math.round(position.coords.latitude * 1000000) / 1000000;
              let lng =
                Math.round(position.coords.longitude * 1000000) / 1000000;

              let currentRoute =
                orsRouteService.data.features[
                  orsRouteService.getCurrentRouteIdx()
                ];
              // removing nodes from the geometry data that is for sure not needed
              // by 3'rd party...
              delete currentRoute.extras;
              delete currentRoute.geometryRaw;
              delete currentRoute.$$hashKey;

              // MARQ24: point_information have an massive effect on the actual file size!
              // So I am not 100% sure if this should be included or not in the exported
              // json data - personally I do not have any need for this info on my mobile
              // client - that's why IMHO it can/should be removed from the raw output
              delete currentRoute.point_information;

              // sending request..
              const request = orsPushService.pushRoute(currentRoute, lat, lng);
              orsPushService.requests.push(request);
              request.promise.then(
                function(response) {
                  //orsLocationsService.addLocationsToMap(response);
                  console.log("SUCCESS", response);
                  ctrl.spinner = false;
                  ctrl.btDisabled = false;

                  // closing the popup window...
                  ctrl.message = $scope.translateFilter("START_GPSLOGGER_MSG");
                  ctrl.closeDialogOnMsgOk = true;
                  ctrl.showMsgDialog = true;
                },
                function(response) {
                  console.log("FAILED", response);
                  ctrl.spinner = false;
                  ctrl.btDisabled = false;

                  ctrl.message = $scope.translateFilter("PUSH_FAILED_MSG");
                  ctrl.closeDialogOnMsgOk = false;
                  ctrl.showMsgDialog = true;
                }
              );
            },
            function error(err) {
              ctrl.spinner = false;
              ctrl.btDisabled = false;

              ctrl.message = $scope.translateFilter("PUSH_NO_LOCATION_MSG");
              ctrl.closeDialogOnMsgOk = false;
              ctrl.showMsgDialog = true;
            }
          );
        } else {
          ctrl.spinner = false;
          ctrl.btDisabled = false;

          ctrl.message = $scope.translateFilter("PUSH_NO_LOCATION_MSG");
          ctrl.closeDialogOnMsgOk = false;
          ctrl.showMsgDialog = true;
        }
      };
    }
  ]
});
