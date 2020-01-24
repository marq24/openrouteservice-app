angular.module("orsApp.push-service", []).factory("orsPushService", [
  "$q",
  "$http",
  ($q, $http) => {
    let orsPushService = {};
    orsPushService.requests = [];
    orsPushService.clear = () => {
      for (let req of orsPushService.requests) {
        if ("cancel" in req) req.cancel("Cancel last request");
      }
      orsPushService.requests = [];
    };

    /**
     * Requests locations
     * @param {String} requestData: XML for request payload
     */
    orsPushService.pushRoute = (requestPayLoad, lat, lng) => {
      var url = "https://route.emacberry.com/push/share.php";
      //var url = "https://maps.sinyax.net/push/share.php";//?lat="+lat+"&lng="+lng;
      var requestData = { lat, lng };

      var canceller = $q.defer();
      var cancel = reason => {
        canceller.resolve(reason);
      };
      var promise = $http
        .post(url, requestPayLoad, {
          params: requestData,
          //headers: {"Content-Type" : "application/json"},
          timeout: canceller.promise
        })
        .then(response => {
          return response.data;
        });
      return {
        promise: promise,
        cancel: cancel
      };
    };

    return orsPushService;
  }
]);
