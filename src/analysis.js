const { getTrips, getDriver } = require('api');
const { normalizeAmount, maxObjVal } = require('./utils');

/**
 * This function should return the trip data analysis
 *
 * @returns {any} Trip data analysis
 */
async function analysis() {
  try {
    const trips = await getTrips();
    let billedTotal = 0,
      cashBilledTotal = 0,
      noOfCashTrips = 0,
      noOfNonCashTrips = 0;
    (nonCashBilledTotal = 0),
      (noOfDriversWithMoreThanOneVehicle = 0),
      (totalAmountEarnedByDriver = 0);
    let driverTally = {},
      driverRevenueTally = {},
      driverDetails,
      maxDriverDetails = null,
      maxDriverDetailsByRevenue = null;

    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];
      if (!trip.isCash) {
        noOfNonCashTrips++;
        nonCashBilledTotal += normalizeAmount(trip.billedAmount);
      }
      if (trip.isCash) {
        noOfCashTrips++;
        cashBilledTotal += normalizeAmount(trip.billedAmount);
      }
      billedTotal += normalizeAmount(trip.billedAmount);


      //set driver tally
      driverTally[trip.driverID]
        ? (driverTally[trip.driverID] += 1)
        : (driverTally[trip.driverID] = 1);

      //set driver revenue tally
      driverRevenueTally[trip.driverID]
        ? (driverRevenueTally[trip.driverID] += normalizeAmount(
            trip.billedAmount,
          ))
        : (driverRevenueTally[trip.driverID] = normalizeAmount(
            trip.billedAmount,
          ));
    }

    //Sum drivers with more than one vehicle
    for (let i = 0; i < Object.keys(driverTally).length; i++) {
      const driverId = Object.keys(driverTally)[i];
      try {
        driver = await getDriver(driverId);
      } catch (err) {
        console.log(err);
      }

      if (Object.keys(driver).length > 0) {
        if (driver.vehicleID.length > 1) noOfDriversWithMoreThanOneVehicle++;
      }
    }

    const maxDriverId = maxObjVal(driverTally);
    const maxDriverByRevenue = maxObjVal(driverRevenueTally);

    try {
      //retrieve driver details
      maxDriverDetails = (await getDriver(maxDriverId)) || null;
    } catch (err) {
      console.log(err);
    }

    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];
      if (trip.driverID == maxDriverId)
        totalAmountEarnedByDriver += normalizeAmount(trip.billedAmount);
    }
    const mostTripsByDriver = {
      name: maxDriverDetails.name,
      email: maxDriverDetails.email,
      phone: maxDriverDetails.phone,
      noOfTrips: driverTally[maxDriverId],
      totalAmountEarned: parseFloat(totalAmountEarnedByDriver.toFixed(2), 10),
    };

    try {
      //retrieve driver details
      maxDriverDetailsByRevenue = (await getDriver(maxDriverByRevenue)) || null;
    } catch (err) {
      console.log(err);
    }

    const highestEarningDriver = {
      name: maxDriverDetailsByRevenue.name,
      email: maxDriverDetailsByRevenue.email,
      phone: maxDriverDetailsByRevenue.phone,
      noOfTrips: driverTally[maxDriverId],
      totalAmountEarned: parseFloat(
        driverRevenueTally[maxDriverByRevenue].toFixed(2),
        10,
      ),
    };

    return {
      noOfCashTrips,
      noOfNonCashTrips,
      billedTotal: parseFloat(billedTotal.toFixed(2), 10),
      cashBilledTotal: parseFloat(cashBilledTotal.toFixed(2), 10),
      nonCashBilledTotal: parseFloat(nonCashBilledTotal.toFixed(2), 10),
      noOfDriversWithMoreThanOneVehicle,
      mostTripsByDriver,
      highestEarningDriver,
    };
  } catch (err) {
    throw err;
  }
}

// analysis()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

module.exports = analysis;
