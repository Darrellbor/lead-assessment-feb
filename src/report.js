const { getTrips, getDriver, getVehicle } = require('api');
const { normalizeAmount } = require('./utils');

/**
 * This function should return the data for drivers in the specified format
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  try {
    //final result variable
    const result = [];

    // fetch all trips
    const trips = await getTrips();

    //group trips by drivers (i.e unique to driverId)
    let driverTally = {},
      driverTrips = {};

    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];

      //set driver tally
      driverTally[trip.driverID]
        ? (driverTally[trip.driverID] += 1)
        : (driverTally[trip.driverID] = 1);

      //set driver trips
      driverTrips[trip.driverID]
        ? (driverTrips[trip.driverID] = [
            ...driverTrips[trip.driverID],
            {
              user: trip.user.name,
              created: trip.created,
              pickup: trip.pickup.address,
              destination: trip.destination.address,
              billed: parseFloat(
                normalizeAmount(trip.billedAmount).toFixed(2),
                10,
              ),
              isCash: trip.isCash,
            },
          ])
        : (driverTrips[trip.driverID] = [
            {
              user: trip.user.name,
              created: trip.created,
              pickup: trip.pickup.address,
              destination: trip.destination.address,
              billed: parseFloat(
                normalizeAmount(trip.billedAmount).toFixed(2),
                10,
              ),
              isCash: trip.isCash,
            },
          ]);
    }

    //iterate through drivers and start formatting
    for (let i = 0; i < Object.keys(driverTally).length; i++) {
      const eachDriver = {};
      const driverId = Object.keys(driverTally)[i];
      let driver = {};

      //fetch the driver details
      try {
        // console.log(
        //   Object.keys(driverTally),
        //   Object.keys(driverTally)[i],
        //   driverId,
        // );
        driver = await getDriver(driverId);
      } catch (err) {
        console.log(err);
      }

      //begin formatting
      eachDriver['id'] = driverId;
      if (Object.keys(driver).length > 0) {
        eachDriver['fullName'] = driver.name;
        eachDriver['phone'] = driver.phone;
      }
      eachDriver['noOfTrips'] = driverTally[driverId];
      eachDriver['trips'] = driverTrips[driverId];
      //eachDriver['noOfVehicles'] = driver.vehicleID.length;

      // store vehicle data in vehicles array
      let vehicles = [];

      //iterate through vehicle ids
      for (
        let j = 0;
        j < (driver && driver.vehicleID ? driver.vehicleID.length : 0);
        j++
      ) {
        const vehicleID = driver.vehicleID[j];

        //fetch vehicle data
        const vehicle = await getVehicle(vehicleID);
        vehicles.push({
          plate: vehicle.plate,
          manufacturer: vehicle.manufacturer,
        });
      }

      // attach vehicles to driver data
      eachDriver['vehicles'] = vehicles;

      //begin iteration for trip related data
      for (
        let j = 0;
        j < (driverTrips[driverId] ? driverTrips[driverId].length : 0);
        j++
      ) {
        const trip = driverTrips[driverId][j];
        //console.log(trip.driverID, driverId, trip.driverID === driverId, trip);

        //check for cash trips
        if (trip.isCash)
          eachDriver['noOfCashTrips']
            ? eachDriver['noOfCashTrips']++
            : (eachDriver['noOfCashTrips'] = 1);

        //check for non cash trips
        if (!trip.isCash)
          eachDriver['noOfNonCashTrips']
            ? eachDriver['noOfNonCashTrips']++
            : (eachDriver['noOfNonCashTrips'] = 1);

        //add total amount earned
        eachDriver['totalAmountEarned']
          ? (eachDriver['totalAmountEarned'] += normalizeAmount(trip.billed))
          : (eachDriver['totalAmountEarned'] = normalizeAmount(trip.billed));

        //add total amount earned via cash trips
        if (trip.isCash)
          eachDriver['totalCashAmount']
            ? (eachDriver['totalCashAmount'] += normalizeAmount(trip.billed))
            : (eachDriver['totalCashAmount'] = normalizeAmount(trip.billed));

        //add total amount earned via non cash trips
        if (!trip.isCash)
          eachDriver['totalNonCashAmount']
            ? (eachDriver['totalNonCashAmount'] += normalizeAmount(trip.billed))
            : (eachDriver['totalNonCashAmount'] = normalizeAmount(trip.billed));
      }

      //check all variable existence and if non-existent set to 0
      if (!eachDriver['noOfCashTrips']) eachDriver['noOfCashTrips'] = 0;
      if (!eachDriver['noOfNonCashTrips']) eachDriver['noOfNonCashTrips'] = 0;
      if (!eachDriver['totalAmountEarned']) eachDriver['totalAmountEarned'] = 0;
      if (!eachDriver['totalCashAmount']) eachDriver['totalCashAmount'] = 0;
      if (!eachDriver['totalNonCashAmount'])
        eachDriver['totalNonCashAmount'] = 0;

      result.push({
        ...eachDriver,
        totalAmountEarned: parseFloat(
          eachDriver.totalAmountEarned.toFixed(2),
          10,
        ),
        totalCashAmount: parseFloat(eachDriver.totalCashAmount.toFixed(2), 10),
        totalNonCashAmount: parseFloat(
          eachDriver.totalNonCashAmount.toFixed(2),
          10,
        ),
      });
    }

    return result;
  } catch (err) {
    throw err;
  }
}

// driverReport()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));
module.exports = driverReport;
