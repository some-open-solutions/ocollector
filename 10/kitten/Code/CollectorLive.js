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

  Kitten release (201920) author: Dr. Anthony Haffey (team@someopen.solutions)
*/


/*
* Check if Collector is still connected
*/
function collector_live(){
  $("#top_navbar").addClass("bg-primary");
}


setInterval(function(){
	/*
	* detect if online or installed version
	*/
	switch(Collector.detect_context()){
		case "github":
		case "github":
		case "server":
			if(navigator.onLine){
				collector_live();
			} else {
        // change background until validated that Collector is live
        $("#top_navbar").removeClass("bg-primary");
				bootbox.alert("You seem to not be connected to the internet " +
                      "- changes will not be saved until you are connected again.");
			}
			break;
		case "localhost":
      break;
	}
},30000);
