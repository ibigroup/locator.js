(function (locator, google, undefined) {

    var logger,
        $ref = this,
        defaultTimeout = 15;

    /* Public Methods
    *******************************************************************/

    locator.attachLogger = function (log) {
        logger = log;
        logger.log("attached logger");
    };

    locator.resolveLocation = function (successCallback, failCallback, timeout) {
        resolveLocation(successCallback, failCallback, timeout);
    };

    locator.getLocationDetails = function (latitude, longitude, successCallback, failCallback) {
        googleReverseGeocode(latitude, longitude, successCallback, failCallback);
    };

    locator.getFirstGeocodedAddress = function (results, successCallback, failCallback) {
        getFirstGeocodedAddress(results, successCallback, failCallback);
    };

    locator.getFirstGeocodedTown = function (results, successCallback, failCallback) {
        getFirstGeocodedTown(results, successCallback, failCallback);
    };

    locator.getClosestGeocodedAddressToLocation = function (location, successCallback, failCallback) {
        googleReverseGeocode(
            location.latitude,
            location.longitude,
            function (results) {
                getFirstGeocodedAddress(
                    results,
                    function (address) { successCallback(address); },
                    failCallback);
            },
            failCallback);
    };

    locator.getClosestGeocodedAddressToCurrentLocation = function (successCallback, failCallback, timeout) {
        resolveLocation(
            function (location) {
                $ref.getClosestGeocodedAddressToLocation(location, successCallback, failCallback);
            },
            failCallback,
            timeout
        );
    };

    locator.geocodeAddress = function (address, successCallback, failCallBack) {
        googleGeocode(address, successCallback, failCallBack);
    };

    /* Private Methods
    *******************************************************************/

    /// Looks up the user's location using HTML gelocation if available.
    /// If the user denies access or it's not available, it falls back to
    /// Google's geolocation API. If this isn't available or fails, the 
    /// failure callback is called.
    function resolveLocation(successCallback, failCallback, timeout) {
        // HTML5 geolocation
        if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {

            // _log("HTML5 geolocation available");
            timeout = timeout || defaultTimeout; // Set timeout to default if not added

            navigator.geolocation.getCurrentPosition(

                function (position) {
                    // _log("HTML5 geolocation success (" + position.coords.latitude + "," + position.coords.longitude + ")");
                    successCallback({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },

            // Revert to Google if user denies access
                function (error) {
                    // _log("HTML5 geolocation failed, reverting to Google");
                    googleLocation(successCallback, failCallback);
                },

                { timeout: timeout * 1000 }
            );
        }

        else {
            // _log("HTML5 geolocation unavailable, reverting to Google");
            googleLocation(successCallback, failCallback);
        }
    }

    /// Looks up the user's location using the Google geocoding API.
    function googleLocation(successCallback, failCallback) {
        if (canUseGoogle()) {
            // _log("Google geolocation available");
            var location = google.loader.ClientLocation;

            if (location) {
                // _log("Google geolocation success");
                successCallback({
                    latitude: location.latitude,
                    longitude: location.longitude
                });
            }
            else {
                // _log("Google geolocation failure");
                failCallback("Google geolocation failure");
            }
        }

        else {
            // _log("Google geolocation unavailable");
            failCallback("Google geolocation unavailable");
        }
    }

    /// Reverse gecodes a LatLng using the Google geocoder.
    function googleReverseGeocode(latitude, longitude, successCallback, failCallback) {
        // _log("Reverse geocoding");
        var geocoder = new google.maps.Geocoder();

        if (geocoder) {
            // _log("Reverse geocoding available");
            var latLng = new google.maps.LatLng(latitude, longitude);
            geocoder.geocode({ 'latLng': latLng }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    // _log("Reverse geocoding success");
                    successCallback(results);
                }
                else {
                    // _log("Reverse geocoding failure");
                    failCallback(status);
                }
            });
        }
        else {
            // _log("Reverse geocoding unavailable");
            failCallback("Reverse geocoding unavailable");
        }
    }

    // Gets the first formatted address from a list of geocoded results.
    function getFirstGeocodedAddress(results, successCallback, failCallback) {
        // _log("Getting geocoded address");
        var address = results[0].formatted_address;
        if (address) {
            // _log("Getting geocoded address success");
            successCallback(address);
        }
        else {
            // _log("Getting geocoded address failure");
            failCallback("Getting geocoded address failure");
        }
    }

    // Gets the first formatted address from a list of geocoded results.
    function getFirstGeocodedTown(results, successCallback, failCallback) {
        // _log("Getting geocoded town");
        var address = results[0].formatted_address;
        if (address) {
            // _log("Getting geocoded town success");
            successCallback(address);
        }
        else {
            // _log("Getting geocoded town failure");
            failCallback("Getting geocoded town failure");
        }
    }

    function googleGeocode(address, successCallback, failCallback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': address, 'region': 'GB' }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (successCallback) {
                    successCallback(results);
                }
            }
            else {
                if (failCallback) {
                    failCallback(status);
                }
            }
        });
    }

    // Check to see whether the google.loader.ClientLocation is available.
    function canUseGoogle() {
        return (typeof google == 'object') && google.loader && google.loader.ClientLocation;
    }


    function log(message) {
        if (logger) {
            logger.log(message);
        }
    }

} ( window.locator = window.locator || {}, google ))