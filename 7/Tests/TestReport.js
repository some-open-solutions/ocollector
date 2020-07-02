/*
    Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

	Kitten release (2019-20) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)
*/

function report_error(error,collector_error_message){
  if(typeof(collector_error_message) !== "undefined"){
    bootbox.alert(collector_error_message);
  }
  if(typeof(eel) !== "undefined"){
    eel.report_error(error);
    custom_alert("Error - check the error report in web/Tests/errors.txt");
  }
}
function report_success(success){
  if(typeof(eel) !== "undefined"){
    eel.report_success(success);
  }
}