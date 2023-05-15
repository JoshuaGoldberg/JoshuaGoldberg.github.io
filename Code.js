//This is code to be placed in a Google App Script connected to the attendance sheet
//Attendance sheet should be formatted with teachers in the A column starting on line 2, 
//and with the blocks on row 1 starting from column B.

var output = new String('');
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
var rows = sheet.getRange('A1:Z1').getDisplayValues();;

function doGet() {
    update();
    return ContentService.createTextOutput(output);
}

function update() {
    SpreadsheetApp.setActiveSheet(sheet);
    for (var i = 2; sheet.getRange('A' + i).getDisplayValue() != 0; i++) {
        SpreadsheetApp.setActiveRange(sheet.getRange('A' + i + ':' + 'I' + i));
        addBlocks();
    }
}

function addBlocks() {
    var activeRow = SpreadsheetApp.getActiveRange().getValues();
    var attendingAllBlocks = true;
    var absentAllBlocks = true;

    for (var j = 0; j < activeRow.length; j++) {
        for (var k = 1; k < activeRow[j].length; k++) {
            if (activeRow[j][k] == true) {
                attendingAllBlocks = false;
            }
            else if (activeRow[j][k] == false) {
                absentAllBlocks = false;
            }
        }
    }

    if (attendingAllBlocks) {
        //Nothing needs to happen, because the teacher is here
    } else
        if (absentAllBlocks) {
            output += SpreadsheetApp.getCurrentCell().getDisplayValue() + ": All Blocks<br>";
        } else {
            //Loop through the row to check which blocks should be added
            output += SpreadsheetApp.getCurrentCell().getDisplayValue() + ":";
            for (var j = 0; j < activeRow.length; j++) {
                for (var k = 1; k < activeRow[j].length; k++) {
                    if (activeRow[j][k] == true) {
                        output += ' ' + rows[0][k];
                    }
                }
            }
            output += '<br>';
        }
}