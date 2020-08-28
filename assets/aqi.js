// Purple Air Documentation: https://docs.google.com/document/d/15ijz94dXJ-YAZLi9iZ_RaBwrZ4KtYeCy08goGBwnbCU/edit
loadJSON(
    // Source
    "https://www.purpleair.com/json?key=50HL95ZEMVGJ983O&show=14285",
    // Success
    function(data) { 
        var PM = aqiFromPM(data.results[0].PM2_5Value);

        // Output
        document.querySelector("#data").innerHTML = 
            `<p>The air quality for <span class="location">El Cerrito, CA</span> is <span class="quality">${getAQIDescription(PM)}</span> with a PM2.5 index of <span class="index">${PM}</span>.<p>` +
            `<p class="alert">${getAQIMessage(PM).split(":")[1]}</p>` +
            `<p class="date">Last updated: ${convert_unix_timestamp(data.results[0].LastUpdateCheck)}</p>`;

        // Adds data quality to body
        document.querySelector("body").setAttribute('data-quality',getAQIDescription(PM));
    },
    // Error
    function(xhr) { 
        console.error(xhr); 
    }
);

// Get JSON
function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

// Convert Air Quality Index from PM
// https://docs.google.com/document/d/15ijz94dXJ-YAZLi9iZ_RaBwrZ4KtYeCy08goGBwnbCU/edit#heading=h.47kx5k34pty3
function aqiFromPM(pm) {
    if (isNaN(pm)) return "-";
    if (pm == undefined) return "-";
    if (pm < 0) return pm;
    if (pm > 1000) return "-";
    /*      
    Good                              0 - 50         0.0 - 15.0         0.0 – 12.0
    Moderate                        51 - 100           >15.0 - 40        12.1 – 35.4
    Unhealthy for Sensitive Groups   101 – 150     >40 – 65          35.5 – 55.4
    Unhealthy                                 151 – 200         > 65 – 150       55.5 – 150.4
    Very Unhealthy                    201 – 300 > 150 – 250     150.5 – 250.4
    Hazardous                                 301 – 400         > 250 – 350     250.5 – 350.4
    Hazardous                                 401 – 500         > 350 – 500     350.5 – 500
    */
    if (pm > 350.5) {
        return calcAQI(pm, 500, 401, 500, 350.5);
    } else if (pm > 250.5) {
        return calcAQI(pm, 400, 301, 350.4, 250.5);
    } else if (pm > 150.5) {
        return calcAQI(pm, 300, 201, 250.4, 150.5);
    } else if (pm > 55.5) {
        return calcAQI(pm, 200, 151, 150.4, 55.5);
    } else if (pm > 35.5) {
        return calcAQI(pm, 150, 101, 55.4, 35.5);
    } else if (pm > 12.1) {
        return calcAQI(pm, 100, 51, 35.4, 12.1);
    } else if (pm >= 0) {
        return calcAQI(pm, 50, 0, 12, 0);
    } else {
        return undefined;
    }

}

// Calculates air quality
function calcAQI(Cp, Ih, Il, BPh, BPl) {

    var a = (Ih - Il);
    var b = (BPh - BPl);
    var c = (Cp - BPl);
    return Math.round((a / b) * c + Il);

}

// Gets air quality description
function getAQIDescription(aqi) {
    if (aqi >= 401) {
        return 'Hazardous';
    } else if (aqi >= 301) {
        return 'Hazardous';
    } else if (aqi >= 201) {
        return 'Very Unhealthy';
    } else if (aqi >= 151) {
        return 'Unhealthy';
    } else if (aqi >= 101) {
        return 'Unhealthy for Sensitive Groups';
    } else if (aqi >= 51) {
        return 'Moderate';
    } else if (aqi >= 0) {
        return 'Good';
    } else {
        return undefined;
    }
}

// Air quality message
function getAQIMessage(aqi) {
    if (aqi >= 401) {
        return '>401: Health alert: everyone may experience more serious health effects';
    } else if (aqi >= 301) {
        return '301-400: Health alert: everyone may experience more serious health effects';
    } else if (aqi >= 201) {
        return '201-300: Health warnings of emergency conditions. The entire population is more likely to be affected. ';
    } else if (aqi >= 151) {
        return '151-200: Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
    } else if (aqi >= 101) {
        return '101-150: Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
    } else if (aqi >= 51) {
        return '51-100: Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.';
    } else if (aqi >= 0) {
        return '0-50: Air quality is considered satisfactory, and air pollution poses little or no risk';
    } else {
        return undefined;
    }
}

// Converts unix timestamp to something human readable, local time zone.
function convert_unix_timestamp(unix_timestamp){
    var date = new Date(unix_timestamp * 1000);
    var formattedTime = new Intl.DateTimeFormat('en-US', { 
        month: 'long',
        year: 'numeric', 
        day: 'numeric',
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric',
        hour12: true
    }).format(date);

    return formattedTime;
}