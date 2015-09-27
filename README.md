CDO-Quick-Data-Tool
====

A single page web app to get quick data from Climate Data Online.
[See it in action](http://wtoldt.github.io/CDO-Quick-Data-Tool/)

What is Quick Data?
----

[Climate Data Online](http://www.ncdc.noaa.gov/cdo-web) allows users access to PDF forms of weather data, among many other weather data products. CDO is intended to allow users to place orders for lots of PDF forms, or get a single PDF form instantly. Orders are processed offline and transferred to a public FTP server while the "quick data" is available through the website on stations pages [such as this one](http://www.ncdc.noaa.gov/cdo-web/datasets/GHCND/stations/GHCND:USC00100010/detail). This tool is designed to give users a shortcut to this "quick data" feature.


Usage
----
1. **Select a date**
Click the "date at a glace" icon on the right side of the top bar and choose a day on the date picker.
2. **Select a location**
Type your desired location into the top bar or just start scrolling and panning away on the map.
3. **Click a marker to see station information**
Station ID, name, and a link to quick data PDF for that day appear in a balloon. If the station reports data for any of the 5 core GHCND elements, that data is also displayed.

GHCND Elements
----
+ **TMAX** Maximum temperature for the day.
+ **TMIN** Minimum temperature for the day.
+ **TAVG** Average temperature for the day.
+ **SNOW** How much it snowed that day.
+ **PRCP** How much it rained that day.

Planned Features
----
Currently, only the [GHCND dataset](http://www.ncdc.noaa.gov/cdo-web/datasets#GHCND) is supported. I'd like to be support [GHCNDMS](http://www.ncdc.noaa.gov/cdo-web/datasets#GHCNDMS) and [Normals Monthly](http://www.ncdc.noaa.gov/cdo-web/datasets#NORMAL_MLY) datasets as well.

However, when I went to implement support for these datasets I realized that a calendar with year/month/day didn't make sense for monthly data, or data that represents 30 year averages. In an ideal world, I would build out my "date at a glance" idea and replace the JQuery datepicker with a custom rolled solution that can elegantly handle day/month/year, month/year, and just month selections.

The project also uses my personal CDO API Token, Ideally I'd offer users the option of changing the token parameter.

