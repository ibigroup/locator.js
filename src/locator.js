var locator = function () {

    var _logger,
        $ref = this,
        defaultTimeout = 15;

    /* Public Methods
    *******************************************************************/

    this.attachLogger = function (logger) {
        _logger = logger;
        _logger.log("attached logger");
    };

    this.resolveLocation = function (successCallback, failCallback, timeout) {
        _resolveLocation(successCallback, failCallback, timeout);
    };

    this.getLocationDetails = function (latitude, longitude, successCallback, failCallback) {
        _googleReverseGeocode(latitude, longitude, successCallback, failCallback);
    };

    this.getFirstGeocodedAddress = function (results, successCallback, failCallback) {
        _getFirstGeocodedAddress(results, successCallback, failCallback);
    };

    this.getFirstGeocodedTown = function (results, successCallback, failCallback) {
        _getFirstGeocodedTown(results, successCallback, failCallback);
    };

    this.getClosestGeocodedAddressToLocation = function (location, successCallback, failCallback) {
        _googleReverseGeocode(
            location.latitude,
            location.longitude,
            function (results) {
                _getFirstGeocodedAddress(
                    results,
                    function (address) { successCallback(address); },
                    failCallback);
            },
            failCallback);
    };

    this.getClosestGeocodedAddressToCurrentLocation = function (successCallback, failCallback, timeout) {
        _resolveLocation(
            function (location) {
                $ref.getClosestGeocodedAddressToLocation(location, successCallback, failCallback);
            },
            failCallback,
            timeout
        );
    };

    this.geocodeAddress = function (address, successCallback, failCallBack) {
        _googleGeocode(address, successCallback, failCallBack);
    };


    /* Private Methods
    *******************************************************************/

    /// Looks up the user's location using HTML gelocation if available.
    /// If the user denies access or it's not available, it falls back to
    /// Google's geolocation API. If this isn't available or fails, the 
    /// failure callback is called.
    var _resolveLocation = function (successCallback, failCallback, timeout) {
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
                    _googleLocation(successCallback, failCallback);
                },

                { timeout: timeout * 1000 }
            );
        }

        else {
            // _log("HTML5 geolocation unavailable, reverting to Google");
            _googleLocation(successCallback, failCallback);
        }
    },

    /// Looks up the user's location using the Google geocoding API.
    _googleLocation = function (successCallback, failCallback) {
        if (_canUseGoogle()) {
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
    },

    /// Reverse gecodes a LatLng using the Google geocoder.
    _googleReverseGeocode = function (latitude, longitude, successCallback, failCallback) {
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
    },

    // Gets the first formatted address from a list of geocoded results.
    _getFirstGeocodedAddress = function (results, successCallback, failCallback) {
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
    },

    // Gets the first formatted address from a list of geocoded results.
    _getFirstGeocodedTown = function (results, successCallback, failCallback) {
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
    },

    _googleGeocode = function (address, successCallback, failCallback) {
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
    },

    // Check to see whether the google.loader.ClientLocation is available.
    _canUseGoogle = function () {
        return (typeof google == 'object') && google.loader && google.loader.ClientLocation;
    },


    _log = function (message) {
        if (_logger) {
            _logger.log(message);
        }
    };

};