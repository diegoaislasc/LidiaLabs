function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
    var row = [];
    
    if (headers[0] === "") {
      headers = ["Timestamp", "Negocio", "Horarios", "Servicios", "FAQs", "Políticas", "MetaBusiness", "Contacto", "Recordatorios"];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    row.push(new Date());
    row.push(JSON.stringify(data.negocio || {}));
    row.push(JSON.stringify(data.horarios || {}));
    row.push(JSON.stringify(data.servicios || []));
    row.push(JSON.stringify(data.faqs || []));
    row.push(JSON.stringify(data.politicas || {}));
    row.push(JSON.stringify(data.metaBusiness || {}));
    row.push(JSON.stringify(data.contacto || {}));
    row.push(JSON.stringify(data.recordatorios || []));
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}
