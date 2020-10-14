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
  categories:["data",
              "helper",
              "mods",
              "studies",
              "surveys",
              "trialtypes"],
  pipeline:[
    "start",
    "after_start"
  ],
  pipe_position: "start",

  /*
  * categories of test
  */
  data:{

  },
  helper:{
    startup:{
      outcome: "awaiting",
      text:    "Can the user see the helper at start up (dropbox only)?",
      type:    "start"
    }
  },
  mods:{
    list:{
      outcome: "awaiting",
      text:    "Are the mods listed?",
      type:    "start"
    }
  },
  studies:{
    list:{
      outcome: "awaiting",
      text:    "Are the studies listed?",
      type:    "start"
    },
    save_at_start:{
      outcome: "awaiting",
      text:    "Does Collector break if pressing the save button at the start?",
      type:    "after_start",
      action: function(){
        $("#save_btn").click();
      }
    }
  },
  surveys:{
    list: {
      outcome: "awaiting",
      text:    "Are surveys listed?",
      type:    "start"
    }
  },
  trialtypes:{
    list: {
      outcome: "awaiting",
      text:    "Are trialtypes listed?",
      type:    "start"
    }
  },
  /*
  * running tests and their results
  */
  activate_pipeline:function(){
    var this_type = Collector.tests.pipe_position;
    var old_index = Collector.tests.pipeline.indexOf(this_type);
    if(old_index < Collector.tests.pipeline.length - 1){
      Collector.tests.pipe_position  = Collector.tests.pipeline[old_index + 1];
      this.categories.forEach(function(test_category){
        Object.keys(Collector.tests[test_category]).forEach(function(this_test){
          if(Collector.tests[test_category][this_test].type == Collector.tests.pipe_position){
             Collector.tests[test_category][this_test].action();
          }
        });
      });
    } else {
      // reached the end of the pipeline
    }
  },

  count_remaining_tests: function(output_span){
    var this_type       = Collector.tests.pipe_position;
    var tests_remaining = 0;

    this.categories.forEach(function(test_category){
      Object.keys(Collector.tests[test_category]).forEach(function(this_test){

        if(Collector.tests[test_category][this_test].type    == this_type &&
           Collector.tests[test_category][this_test].outcome == "awaiting"){
          tests_remaining++;
        }

      });
    });
    if(tests_remaining == 0 &&
       Collector.tests.pipeline.indexOf(this_type) < Collector.tests.pipeline.length - 1){
      this.activate_pipeline(this_type);
    }
    $("#start_tests_remaining_span").html(tests_remaining);
  },
  fail:function(test_category,
                this_test,
                error){
    Collector.tests[test_category][this_test].outcome = "fail";
    $("#test_" +
      test_category +
      "_" +
      this_test).html("<span class='text-danger'>Fail</span>");
    bootbox.alert("error occurred " + test_category + "-" + this_test);
  },
  pass:function(test_category,
                this_test){
    Collector.tests[test_category][this_test].outcome = "pass";
    var this_id = "#test_" + test_category + "_" + this_test;
    $(this_id).fadeOut(function(){
      $(this_id).html("<span class='text-success'>Pass</span>");
      $(this_id).fadeIn();
    });

    /*
    * Check if all "start" tests have passed yet before moving on to "after start"
    */
    Collector.tests.count_remaining_tests("start_tests_remaining_span");
  },
  run:function(){
    if($_GET.testing){
      var test_text = "<div style='max-height:700px; overflow:auto;'>" +
                      "<h1 class='text-primary'> Running tests</h1>" +
                      "<h4> Start tests remaining:<span id='start_tests_remaining_span'></span></h4>" +
                      "<h4> After start tests remaining:<span id='after_start_tests_remaining_span'></span></h4>" +
                      "<table class='table'>";
     this.categories.forEach(function(test_category){

        // first letter capital


        test_text += "<tr>" +
                        "<td colspan=2><h4>" +
                          //solution by Little Roys at https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript/53930826#53930826
                          test_category.replace(/^./, str => str.toUpperCase()) +
                        "</h4></td>";
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
      test_text += "</table>" +
                  "</div>";

      bootbox.alert(test_text);
      // And wait for other parts of Collector to trigger the tests
    }
  },

  /*
  * reporting succeess and errors (note that success isn't used yet)
  */
  report_error: function(error,collector_error_message){
    if(typeof(collector_error_message) !== "undefined"){
      bootbox.alert(collector_error_message +
                    ":" +
                    error +
                    " - please send this information to your administrator or put it on the collectalk.com forum with a description of what lead to it.");
    }
  },
  report_success: function(success){
    // this might become deprecated
  }
}
