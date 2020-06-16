/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
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
 		
		Kitten release (2019) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)		
*/
var this_sheet;
var this_selection;
function isTrialTypeHeader(colHeader) {
	var isTrialTypeCol = false;
  if (colHeader === 'trial type') isTrialTypeCol = true;
  if (   colHeader.substr(0, 5).toLowerCase() === 'post '
		&& colHeader.substr(-11)  === ' trial type'
	) {
		postN = colHeader.substr(5, colHeader.length - 16);
		postN = parseInt(postN);
		if (!isNaN(postN) && postN != 0) {
			isTrialTypeCol = true;
		}
	}
	return isTrialTypeCol;
}
function isNumericHeader(colHeader) {
	var isNum = false;
	if (colHeader.toLowerCase().substr(-4) === 'item')     isNum = true;
	if (colHeader.toLowerCase().substr(-8) === 'max time') isNum = true;
	if (colHeader.toLowerCase().substr(-8) === 'min time') isNum = true;
	return isNum;
}
function isShuffleHeader(colHeader) {
	var isShuffle = false;
	if (colHeader.toLowerCase().indexOf('shuffle') !== -1) isShuffle = true;
	return isShuffle;
}
function firstRowRenderer(instance, td, row, col, prop, value, cellProperties) {
	Handsontable.renderers.TextRenderer.apply(this, arguments);
	td.style.fontWeight = 'bold';
	if (value == '') {
		$(td).addClass("htInvalid");
	}
}
function numericRenderer(instance, td, row, col, prop, value, cellProperties) {
	Handsontable.renderers.TextRenderer.apply(this, arguments);
	if (isNaN(value) || value === '') {
		td.style.background = '#D8F9FF';
	}
}
function shuffleRenderer(instance, td, row, col, prop, value, cellProperties) {
	Handsontable.renderers.TextRenderer.apply(this, arguments);
	if (value === '') {
		td.style.background = '#DDD';
	} else if (
		typeof value === 'string' 
	 && (   value.indexOf('#') !== -1
		 || value.toLowerCase() === 'off'
		)
	) {
		td.style.background = '#DDD';
	}
}
function trialTypesRenderer(instance, td, row, col, prop, value, cellProperties) {
	Handsontable.renderers.AutocompleteRenderer.apply(this, arguments);
	if (value === 'Nothing' || value === '') {
		if (instance.getDataAtCell(0,col) === 'trial type') {
			$(td).addClass("htInvalid");
		} else {
			td.style.background = '#DDD';
		}
	}
}
function updateDimensions(hot, addWidth, addHeight) {
	var addW = addWidth  || 0;
	var addH = addHeight || 0;

	var container   = hot.container;

	var thisSizeBox = $(container).find(".wtHider");

	var thisWidth  = thisSizeBox.width()+22+addW;
	var thisHeight = thisSizeBox.height()+22+addH;

	var thisArea = $(container).closest(".tableArea");

	thisWidth  = Math.min(thisWidth,  thisArea.width());
	thisHeight = Math.min(thisHeight, thisArea.height());

	hot.updateSettings({
		width:  thisWidth,
		height: thisHeight
	});
}
function updateDimensionsDelayed(hot, addWidth, addHeight) {
	updateDimensions(hot, addWidth, addHeight);
	setTimeout(function() {
		updateDimensions(hot);
	}, 0);
}


function createHoT(container, data,sheet_name) {
	var table = new Handsontable(container, {
		data: data,
		minSpareCols: 1,
		minSpareRows: 1,            
        
		afterChange: function(changes, source) {
			var middleColEmpty=0;
			var middleRowEmpty=0;
			var postEmptyCol=0; //identify if there is a used col after empty one
			var postEmptyRow=0; // same for rows

			//identify if repetition has occurred and adjusting value
			var topRow=[];
			for (var k=0; k<this.countCols()-1; k++){
				var cellValue=this.getDataAtCell(0,k);
				topRow[k]=this.getDataAtCell(0,k);
				for (l=0; l<k; l++){
					if (this.getDataAtCell(0,k)==this.getDataAtCell(0,l)){
						this.setDataAtCell(0,k,this.getDataAtCell(0,k)+'*');
					}
				}
			}
			for (var k=0; k<this.countCols()-1; k++){
				//checking for invalid item number (1)
				if(this.getDataAtCell(0,k).toLowerCase()=="item"){
					for(m=0;m<this.countRows();m++){
						if(this.getDataAtCell(m,k)==1){
							bootbox.alert("Warning v1: 1 does not refer to any row in the Stimuli sheet! The first row is row 2 (as row 1 is the header). Fix row "+(m+1)+" in your Procedure's Item column.");
						}
						if(this.getDataAtCell(m,k) !== null){
							if(this.getDataAtCell(m,k).indexOf(":") !== -1){
								this.setDataAtCell(m,k,this.getDataAtCell(m,k).replace(":"," to "));
							}
						}
						/*
						if(this.getDataAtCell(m,k).indexOf(":") !== -1){
							
							
							// replace ":" with " to " but take care of spacing
							this.setDataAtCell(m,k,this.getDataAtCell(m,k).replace(":"," to "));
							
							
							
						}
						*/
					}
				}
				
				//Removing Empty middle columns
				if (this.isEmptyCol(k)){
					if (middleColEmpty==0){
						middleColEmpty=1;
					}
				}            
				if (!this.isEmptyCol(k) & middleColEmpty==1){
					postEmptyCol = 1;
					this.alter("remove_col",k-1); //delete column that is empty 
					middleColEmpty=0;
				}            
			}
							
			//Same thing for rows
			for (var k=0; k<this.countRows()-1; k++){
				if (this.isEmptyRow(k)){
					if (middleRowEmpty==0){
						middleRowEmpty=1;
					}
				}            
				if (!this.isEmptyRow(k) & middleRowEmpty==1){
					postEmptyRow =1;
					this.alter("remove_row",k-1); //delete column that is empty
					middleRowEmpty=0;
				}            
			}        
			if(postEmptyCol != 1 ){
				while(this.countEmptyCols()>1){  
					this.alter("remove_col",this.countCols); //delete the last col
				}
			}
			if(postEmptyRow != 1){
				while(this.countEmptyRows()>1){  
					this.alter("remove_row",this.countRows);//delete the last row
				}
			}

			var experiment = master_json.exp_mgmt.experiment;
			var this_exp   = master_json.exp_mgmt.experiments[experiment];
			
			if(sheet_name.toLowerCase() == "conditions.csv"){
				this_exp.cond_array = this.getData();
			} else {
				if(typeof(this_exp.all_stims[sheet_name]) !== "undefined"){
					this_exp.all_stims[sheet_name] = this.getData();
				}
				else if(typeof(this_exp.all_procs[sheet_name]) !== "undefined"){
					this_exp.all_procs[sheet_name] = this.getData();
				}
				else {
					alert("error - "+sheet_name+" not found in "+experiment);
				}
			}
		},
    afterInit: function() {
      updateDimensions(this);
    },
    afterCreateCol: function() {
      updateDimensionsDelayed(this, 55, 0);
    },
    afterCreateRow: function() {
      updateDimensionsDelayed(this, 0, 28);
    },
    afterRemoveCol: function() {
      updateDimensionsDelayed(this);
    },
    afterRemoveRow: function() {
      updateDimensionsDelayed(this);
    },
    afterSelectionEnd: function(){
      thisCellValue = this.getValue();
      
      var coords        = this.getSelected();
      var column        = this.getDataAtCell(0,coords[1]); 
      var thisCellValue = this.getDataAtCell(coords[0],coords[1]);
      console.dir(column);
      console.dir(thisCellValue);
      console.dir(sheet_name);
      thisCellValue = thisCellValue == null ? thisCellValue = "" : thisCellValue;
      column        = column        == null ? column        = "" : column;
      window['Current HoT Coordinates'] = coords;
      helperActivate(column, thisCellValue,sheet_name);
    },
    cells: function(row, col, prop) {
		var cellProperties = {};        
		if (row === 0) {
			cellProperties.renderer = firstRowRenderer;
		} else {
			var thisHeader = this.instance.getDataAtCell(0,col);
			if (typeof thisHeader === 'string' && thisHeader != '') {
				if (isTrialTypeHeader(thisHeader)) {
					cellProperties.type = 'dropdown';
					cellProperties.source = trialTypes;
					cellProperties.renderer = trialTypesRenderer;
				} else {
					cellProperties.type = 'text';
					if (isNumericHeader(thisHeader)) {
						cellProperties.renderer = numericRenderer;
					} else if (isShuffleHeader(thisHeader)) {
						cellProperties.renderer = shuffleRenderer;
					} else {
						cellProperties.renderer = Handsontable.renderers.TextRenderer;
					}
				}
			} else {
				cellProperties.renderer = Handsontable.renderers.TextRenderer;
			}
		}                
		return cellProperties;
	},
	cells: function(row, col, prop) {},
	wordWrap: false,
	contextMenu: {
		items: {
			"about": { // Own custom option
        name: function () { // `name` can be a string or a function
          return '<b>Edit cell</b>'; // Name can contain HTML
        },
        hidden: function () { // `hidden` can be a boolean or a function
          // Hide the option when the first column was clicked
          return this.getSelectedLast()[0] == 0; // `this` === hot3
        },
        callback: function(key, selection, clickEvent) { // Callback for specific option
					this_sheet = this;
					$('#cell_editor_div').fadeIn();
					this_selection = selection;

					cell_editor.setValue(this_sheet.getDataAtCell(selection.start.row, 
																												selection.start.col),-1);
													
					
					
					//var cell_editor_width = parseFloat($("#cell_editor_div").css("width").replace("px",""));

					if($("#help_content").is(":visible")){
						var helper_width = parseFloat($("#help_content").css("width").replace("px",""));
						
						$("#cell_editor_div").animate({
							"width": window.innerWidth - helper_width
						}, 500,function(){
							cell_editor.resize();
						});
					} else {
						$("#cell_editor_div").animate({
							"width": window.innerWidth
						}, 500,function(){
							cell_editor.resize();
						});
					}
        }
      },
			"---------": {
        name: '---------'
      },
			"row_below": {
        name: 'Insert row below'
      },			
			"row_above": {
        name: 'Insert row above'
      },
			"col_left": {
        name: 'Insert column left'
      },
			"col_right": {
        name: 'Insert column right'
      },
			"remove_row": {
        name: 'Remove row'
      },
			"remove_col": {
        name: 'Remove column'
      },
			"undo": {
        name: 'Undo'
      },
			"redo": {
        name: 'Redo'
      },			
			"make_read_only": {
        name: 'Read only'
      },
			"alignment": {
        name: 'Alignment'
      },
		}
	},
	rowHeaders: true,
	});
	return table;    
}

//solution by Jeffrey Harmon at https://stackoverflow.com/questions/1064089/inserting-a-text-where-cursor-is-using-javascript-jquery
function insertAtCaret(areaId, text) {
	var txtarea = document.getElementById(areaId);
	var scrollPos = txtarea.scrollTop;
	var caretPos = txtarea.selectionStart;

	var front = (txtarea.value).substring(0, caretPos);
	var back = (txtarea.value).substring(txtarea.selectionEnd, txtarea.value.length);
	txtarea.value = front + text + back;
	caretPos = caretPos + text.length;
	txtarea.selectionStart = caretPos;
	txtarea.selectionEnd = caretPos;
	txtarea.focus();
	txtarea.scrollTop = scrollPos;
}
/*
$(window).resize(function() {
	resizeTimer = window.setTimeout(function() {
		updateDimensions(stimTable);
	}, 100);
	window.clearTimeout(resizeTimer);        
});
*/