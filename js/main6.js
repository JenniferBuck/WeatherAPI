// 08/25/20 v2
// Setup screen
// - Get search history
// - Get today's date
// 
// On a city input we then:
// 
// Use that city name to make a weather request for the current forecast
// - (what if there is more than one city with that name)
// - Save current city to search history
// 
// Display current forecast info
// - convert temp to local temperature format
// 
// Get the 5 day forecast data
// 
// Display 5 day forecast info

// eventListener for city input
// - create a api call url
// - use that call url to create a global data object
// - extract the data (need to know is it current/5 day)
// - display the data (need to know is it current/5 day)

/* $$$TODO 
		emoji lookup based on forecast
		add proper units to all data (e.g. %, mph)
		order the search history (alpha, most recent first???)
*/

//alert('aloha');
console.log('aloha');

let myCities = []; // Used for localStorage.
console.log(myCities);
let isLocalStorage = false; // Assume not localStorage.

const myApiKey = 'd208a9b6336ce3957f7233e1a2078f23';
const theEndPoint = 'https://api.openweathermap.org/data/2.5/';

const elButton =  document.querySelector( ".search-bar button" );
const el5DayTemp = document.querySelectorAll( "._5day .js-temp" );
const el5DayHumid = document.querySelectorAll( "._5day .js-humid" );
const elSearchHistory = document.querySelector( '.search-history' );

// *************************************************************************************************
function fetchAndDisplayWeatherData( thisCityName ) {

	let theWeatherData = {};
	
	// *****Current day forecast data.
	fetch(
		theEndPoint + 'weather/' + 
		'?q=' + thisCityName + 
		'&appid=' + myApiKey +
		'&units=imperial'
		) 

	.then(function(resp) { return resp.json() })
	.then(function(data) {
		let theWeatherData = data;	
		// console.log(theWeatherData);
		// console.log(theWeatherData.cod);
		if( theWeatherData.cod === 200 ) {			
			// Extract the data.
			const myTemp = theWeatherData.main.temp;
			const myHumid = theWeatherData.main.humidity;
			const myWind = theWeatherData.wind.speed;

			// Display the data.
			document.querySelector( ".js-data-today .js-temp" ).innerHTML=myTemp + '&deg;F';
			document.querySelector( ".js-data-today .js-humid" ).textContent=myHumid;
			document.querySelector( ".js-data-today .js-wind" ).textContent=myWind;
			document.querySelector( ".js-data-today .js-uv" ).textContent='Loading...';
			
				// ***** UV Index current forecast data.
				// Set these while we still have this data set active.
				const myCityLat = theWeatherData.coord.lat;
				const myCityLon = theWeatherData.coord.lon;
				
				fetch(
					theEndPoint + 'uvi' +  
					'?appid=' + myApiKey +
					'&lat=' + myCityLat +
					'&lon=' + myCityLon
					) 
				
				.then(function(resp) { return resp.json() })
				.then(function(data) {
					let theWeatherData = data;
					//console.log(theWeatherData);
					document.querySelector( ".js-data-today .js-uv" ).textContent=theWeatherData.value;   
				
				})
				.catch(function() {
					// Catch any errors
				}); // End UV Index current forecast data.

			}	else {
				alert( 'Sorry, there has been a problem - ' + theWeatherData.message + '.' );
			} // End if theWeatherData.cod === 200.
		})

		.catch(function() {
			// Catch any errors
		}); // End of current day weather.
	
	// *****Five day forecast data.
	fetch(
			theEndPoint + 'forecast/' + 
			'?q=' + thisCityName + 
			'&appid=' + myApiKey +
			'&units=imperial'
			) 

	.then(function(resp) { return resp.json() })
	.then(function(data) {

		let theWeatherData = data;
		console.log(theWeatherData);
		
		const myForecasts = theWeatherData.list;
		console.log(theWeatherData.list[0]);
		let myDay = moment.unix(theWeatherData.list[0].dt).format("DD");
		console.log(myDay);
		
		// Extract the data.
		// HERE BE DRAGONS...
		// This relies on the first entry being at 3AM tomorrow and subsequent forecast at 3 hour intervals.

		let j = 0;
		myForecasts.forEach( function( myForecast, i ) {
			//display the data.
			if( i===0 || i===7 || i===15 || i===23 || i===31 ) {
				//.innerHTML=myTemp + '&deg;F';
				el5DayTemp[j].innerHTML=myForecast.main.temp + '&deg;F';
				el5DayHumid[j].textContent=myForecast.main.humidity;
				j++;
			}  
		});
	})
	.catch(function() {
		// Catch any errors.
	}); // End of 5 day forecast.
    
	} //End of fetchAndDisplayWeatherData.
	

function handleUserInput ( event ) {
	event.preventDefault();
	myCityName = document.querySelector( "#inp-search" ).value;
	
	if( myCities.length > 0 ) {
		// Make sure the city is not already in the array and add it to the beginning.
		let addMe = true;
		for( i=0; i<myCities.length; i++) {
			if( myCityName === myCities[i] ) {
				addMe = false; // Don't add.
			}
		}

		if( addMe === true ) {
			myCities.unshift( myCityName );
		}

	} else {
		// There is no data currently stored in localStorage, so just add 'myCityName' as the initial item.
		myCities[0] = myCityName;
	}
	
	const strSave = JSON.stringify(myCities);
	window.localStorage.setItem("cityHistory", strSave);

	fetchAndDisplayWeatherData( myCityName );

}

function setup () {
	console.log('setup: top');
	const myDay = moment().format("M/DD/YYYY");
	const elDateToday = document.querySelector( ".js-data-today time");
	elDateToday.textContent=myDay;
	elDateToday.dateTime= moment().format("YYYY-MM-DD");;
	
	let myDates = document.querySelectorAll( "._5day time");
	// ***** REFACTOR forEach params
	myDates.forEach( function ( myDate, i ) {
		myDate.textContent = moment().add( i,'days').format("M/DD/YYYY");
		myDate.dateTime = moment().add(i,'days').format("YYYY-MM-DD");
	});

	// Get/Handle the user search history (localStorage).
	if (typeof (Storage) !== "undefined") {
		isLocalStorage = true;
		// Read local storage.
		if(localStorage.length > 0 ) {
			console.log('in IF');
			let myHTML = '';
			myCities = JSON.parse(window.localStorage.getItem("cityHistory"));
			console.log( typeof myCities, myCities );
			/* NOTE: from - https://stackoverflow.com/questions/31096596/why-is-foreach-not-a-function-for-this-object
					Object does not have forEach, it belongs to Array prototype. 
					If you want to iterate through each key-value pair in the 
					object and take the values. 
			*/
			if( myCities != null ) {
				Object.keys(myCities).forEach( function ( key ) {
					myHTML += '<li>' + myCities[key] + '</li>';
				});
				elSearchHistory.innerHTML = myHTML;
				const elItems = document.querySelectorAll( '.search-history li');
				elItems.forEach( function( elItem ) {
					elItem.addEventListener( 'click', function( event ) {
						document.querySelector( "#inp-search" ).value = event.target.textContent;
					})
				});
			}	
		} else {
			console.log( 'ls len: ', localStorage.length );
		}
	} // End typeof (Storage). 
	
	elButton.addEventListener('click', handleUserInput);
	

}

setup();