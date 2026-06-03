function doGet(e) {
  // Si viene con action= es llamada de la PWA → API JSON
  if (e && e.parameter && e.parameter.action) {
    return doGetAPI(e);
  }
  // Sin parámetros → HTML del buscador original
  const html = HtmlService.createTemplateFromFile("moduloBuscar")
  .evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

function doPost(e) {
  return doPostAPI(e);
}


function buscarMantenimientos(numeroPSeguimiento = "BHI-0003"){

  let mantenimienosRealizados = [];

  const SS = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  const solicitudes = SS.getSheetByName("Solicitudes Generales"); 
  const numeroSeguimiento = solicitudes.getDataRange().getDisplayValues();

  numeroSeguimiento.forEach(seguimiento => {
    if ( seguimiento[0].toUpperCase() === numeroPSeguimiento.toUpperCase()) {
      mantenimienosRealizados.push(seguimiento)
    }else if (seguimiento[2].toUpperCase() === numeroPSeguimiento.toUpperCase()){
      mantenimienosRealizados.push(seguimiento)
    }
    else if (seguimiento[16].toUpperCase() === numeroPSeguimiento.toUpperCase()){
      mantenimienosRealizados.push(seguimiento)
      console.log(seguimiento)
    }
  })
  
  return mantenimienosRealizados
}


//function include(filename) { return HtmlService.createHtmlOutputFromFile(filename).getContent()};


