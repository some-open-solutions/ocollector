cell_editor.commands.addCommand({
	name: 'enter_break',
	bindKey: {win: 'Shift-Enter',  mac: 'Shift-Enter'},
	exec: function(editor) {
		editor.session.insert(editor.getCursorPosition(), "\n");
	},
	readOnly: true // false if this command should not apply in readOnly mode
});
cell_editor.commands.addCommand({
	name: 'enter_break',
	bindKey: {win: 'Enter',  mac: 'Enter'},
	exec: function(editor) {
		editor.session.insert(editor.getCursorPosition(), "<br>\n");
	},
	readOnly: true // false if this command should not apply in readOnly mode
});

$("#cell_make_bold").on("click",function(){
	cell_wrap_tag(cell_editor,"<b>","</b>",true);
});
$("#cell_make_italic").on("click",function(){
	cell_wrap_tag(cell_editor,"<i>","</i>",true);
});
$("#cell_make_underline").on("click",function(){
	cell_wrap_tag(cell_editor,"<u>","</u>",true);
});
$("#cell_make_header").on("click",function(){
	cell_wrap_tag(cell_editor,"<h2>","</h2>",true);  // this is partially to reduce confusion between the number 1 and the letter l
});

function cell_wrap_tag(editor,tag_open,tag_close,focus_editor){
	var current_range = editor.selection.getRange();
	if(JSON.stringify(current_range.start) == JSON.stringify(current_range.end)){
		editor.session.insert(editor.getCursorPosition(), tag_open + "--------------------DELETE ME-------------" + tag_close);
		editor.find("--------------------DELETE ME-------------");
		var range = editor.selection.getRange();
		editor.session.replace(range, "");	
	} else {
		var selected_text = cell_editor.getSelectedText();
		var range = editor.selection.getRange();
		editor.session.replace(range, tag_open + selected_text + tag_close);
	}
	if(focus_editor){
		cell_editor.focus();
	}	
	this_sheet.setDataAtCell(this_selection.start.row, 
													 this_selection.start.col,
													 cell_editor.getValue());	
}

$("#cell_apply_color").on("click",function(){
	cell_wrap_tag(cell_editor,"<span style='color:" + $("#cell_select_color").val() + "'>","</span>",true);
});

$("#cell_select_color").on("change",function(){
	$("#cell_apply_color").css("background-color",this.value);
	cell_wrap_tag(cell_editor,"<span style='color:" + this.value + "'>","</span>",true);
});

$("#cell_select_color_activate").on("click",function(){
	$("#cell_select_color").click();
});

$("#cell_text_size_btn").on("click",function(){
	bootbox.prompt("What size do you want the selected text to be?",function(response){
		cell_wrap_tag(cell_editor,"<span style='font-size:" + response + "'>","</span>",false);
	});
});

cell_editor.commands.addCommand({
	name: 'enter_bold',
	bindKey: {win: 'Ctrl-B',  mac: 'Command-B'},
	exec: function(editor) {
		cell_wrap_tag(editor,"<b>","</b>",true);	
	},
	readOnly: true // false if this command should not apply in readOnly mode
});
cell_editor.commands.addCommand({
	name: 'enter_italics',
	bindKey: {win: 'Ctrl-I',  mac: 'Command-I'},
	exec: function(editor) {
		cell_wrap_tag(editor,"<i>","</i>",true);
	},
	readOnly: true // false if this command should not apply in readOnly mode
});
cell_editor.commands.addCommand({
	name: 'enter_underline',
	bindKey: {win: 'Ctrl-U',  mac: 'Command-U'},
	exec: function(editor) {
		cell_wrap_tag(editor,"<u>","</u>",true);
	},
	readOnly: true // false if this command should not apply in readOnly mode
});