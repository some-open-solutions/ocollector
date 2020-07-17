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
Collector.tests = {
  /*
  * categories of test
  */
  data:{
    
  },
  mods:{
    list:{
      outcome: "awaiting",
      text: "Are the mods listed?"
    }
  },
  studies:{
    list:{
      outcome: "awaiting",
      text: "Are the studies listed?"
    }
  },
  surveys:{
    list: {
      outcome: "awaiting",
      text: "Are surveys listed?"
    }
  },
  trialtypes:{
    list: {      
      outcome:"awaiting",
      text: "Are trialtypes listed?"
    }
  },
  /*
  * running tests and their results
  */
  fail:function(test_category,
                this_test,
                error){
    Collector.tests[test_category][this_test].outcome = "fail";
    $("#test_" +
      test_category + 
      "_" +
      this_test).html("<span class='text-danger'>Fail</span>");
    bootbox.alert(error);
  },
  pass:function(test_category,
                this_test){
    Collector.tests[test_category][this_test].outcome = "pass";
    var this_id = "#test_" + test_category + "_" + this_test;
    $(this_id).fadeOut(function(){
      $(this_id).html("<span class='text-success'>Pass</span>");
      $(this_id).fadeIn();  
    });
    
  },
  run:function(){
    if($_GET.testing){
      var test_text = "<h1 class='text-primary'> Running tests </h1>" +
                      "<table class='table'>";
     ["data",
      "mods",
      "studies",
      "surveys",
      "trialtypes"].forEach(function(test_category){
        test_text += "<tr>" +
                        "<td colspan=2><h4>" + test_category + "</h4></td>";
        Object.keys(Collector.tests[test_category]).forEach(function(this_test){
          test_text += "<tr>" +
                         "<td class='text-primary'>" + Collector.tests[test_category][this_test].text    + "</td>" +
                         "<td class='text-dark' " +
                             "id='test_"+ 
                                  test_category + 
                                  "_" +
                                  this_test +"'>" + 
                                    '<div class="spinner-border text-secondary" role="status">' +
                                      '<span class="sr-only">Loading...</span>' +
                                    '</div>' +
                                    "</td>" + 
                       "</tr>";
        });
      });
      test_text += "</table>";                  
                        
      bootbox.alert(test_text);
      // And wait for other parts of Collector to trigger the tests
    }
  },
  
  /*
  * reporting succeess and errors (note that success isn't used yet)
  */  
  report_error: function(error,collector_error_message){
    if(typeof(collector_error_message) !== "undefined"){
      bootbox.alert(collector_error_message);
    }
    if(typeof(eel) !== "undefined"){
      eel.report_error(error);
      custom_alert("Error - check the error report in web/Tests/errors.txt");
    }
  },
  report_success: function(success){
    if(typeof(eel) !== "undefined"){
      eel.report_success(success);
    }
  }
}