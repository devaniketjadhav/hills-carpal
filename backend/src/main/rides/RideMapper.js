class RideMapper {
  static entityToDto(ride) {
    if (!ride) {
      return null;
    }

    return Object.assign(
      {},
      {
        client: ride.client,
        pickupTimeAndDateInUTC: new Date(ride.pickupTimeAndDateInUTC),
        locationFrom: {
          latitude: ride.locationFrom.x,
          longitude: ride.locationFrom.y,
          suburb: ride.suburbFrom,
          postcode: ride.postCodeFrom,
          placeName: ride.placeNameFrom
        },
        locationTo: {
          latitude: ride.locationTo.x,
          longitude: ride.locationTo.y,
          suburb: ride.suburbTo,
          postcode: ride.postCodeTo,
          placeName: ride.placeNameTo
        },
        driverGender: ride.driverGender,
        carType: ride.carType,
        status: ride.status,
        deleted: parseInt(ride.deleted + ''),
        facilitatorId: ride.facilitatorId || ride.facilitatorEmail,
        description: ride.description,
        hasMps: !!ride.hasMps, // force bool
        id: ride.id
      },
      ride.driver_email
        ? {
            driver: {
              email: ride.driver_email,
              confirmed: ride.confirmed,
              updated_at: ride.updated_at,
              ride_id: ride.id
            }
          }
        : {}
    );
  }

  static dtoToEntity(ride, facilitatorId) {
    if (!ride) {
      return null;
    }
    return {
      client: `${ride.client}`,
      pickupTimeAndDateInUTC: new Date(ride.pickupTimeAndDateInUTC),
      locationFrom: {
        latitude: ride.locationFrom.latitude,
        longitude: ride.locationFrom.longitude,
        suburb: ride.locationFrom.suburb,
        placeName: ride.locationFrom.placeName,
        postcode: ride.locationFrom.postcode
      },
      locationTo: {
        latitude: ride.locationTo.latitude,
        longitude: ride.locationTo.longitude,
        suburb: ride.locationTo.suburb,
        placeName: ride.locationTo.placeName,
        postcode: ride.locationTo.postcode
      },
      driverGender: ride.driverGender,
      carType: ride.carType,
      status: ride.status,
      deleted: 0,
      facilitatorId: facilitatorId,
      hasMps: !!ride.hasMps, // force bool
      description: ride.description
    };
  }
}

module.exports = RideMapper;
