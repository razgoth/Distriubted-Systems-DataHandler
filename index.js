var subscriber = require('./src/subscriber.js');
var publisher = require('./src/publisher.js');
var Locations = require('./src/Locations.js');
var indexChecker = new Array();
var takenCoordinatesRed = new Array();
var availableCoordinatesRed = new Array();
var stringTaken = "0";


subscriber.start(); //starts the subscriber.js module
publisher.start(); //starts the publisher.js module


subscriber.eventListener.on("mqttRecieved", function(topic, payload) {
    try {
        if (payload.length < 50) { // date payload length is a maximum of 27
            var dayName = Locations.extractDay(payload)
            var timeChosen = Locations.extractTime(payload)
            var booleanValue = Locations.validateTime(dayName, timeChosen)

            if (booleanValue != true) {
                //     publisher.publish("no booking the time chosen is not valid by any dentist office"); // the visualize will give booking response of rejection
            }
        } else {
            var dentistData = Locations.extractDentistData(payload) // booking payload load length is about 70
            var takenDate = Locations.storeChosenOnes(dentistData)
                //console.log(takenDate)
            if (indexChecker.includes(takenDate)) {
                var takenCoordinates = Locations.extractDnetistCoordinates(payload)
                takenCoordinatesRed.push(takenCoordinates)
                    //console.log(takenCoordinatesRed)
                stringTaken = JSON.stringify(takenCoordinatesRed)

                //   publisher.publish(stringTaken)
                publisher.publish(JSON.stringify({ status: "Its already taken" }))
            } else {
                indexChecker.push(takenDate)
                console.log(indexChecker)
                publisher.publish(JSON.stringify({
                    status: "Confirmation"
                }))
            }


            var allCoordinates = Locations.entireCoordinates();

            var countKey = Object.keys(stringTaken).length; // how many elements in the array
            console.log(countKey)
            if (countKey == "1") {
                var coordinatesInString = JSON.stringify(allCoordinates)
                var withoutQuotes = coordinatesInString.replace(/"/g, '');
                // console.log(withoutQuotes)

                var wihtoutQuotesString = JSON.stringify(withoutQuotes)
                publisher.publish(wihtoutQuotesString)
            } else {

                for (var i = 0; i < takenCoordinatesRed.length; i++) {
                    var taken = takenCoordinatesRed[i]
                    if (allCoordinates.includes(taken)) {
                        allCoordinates.splice(i, 1)
                            //console.log(allCoordinates)

                        var coordinatesInString = JSON.stringify(allCoordinates)
                        var withoutQuotes = coordinatesInString.replace(/"/g, '');
                        var wihtoutQuotesString = JSON.stringify(withoutQuotes)

                        //console.log(coordinatesInString)
                        publisher.publish(wihtoutQuotesString)
                    }
                }
            }
        }


    } catch (error) {
        console.log(error.message)
    }

});