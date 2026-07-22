 //ubicamos el archivo y el nombre del a hoja de calculo para buscar los valores 

 
let hoja = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1076169836");//indicamos el archivo
let formulario = hoja.getSheetByName("Respuestas de formulario 3"); //indicamos el nombre del archivo

function prueba() {

SpreadsheetApp.getActiveSpreadsheet()

   }

   
//Funcion Que envia mail del formulario de BHI

function sendConfirmationEmail1(e) {


console.log(e.values)

  
  if (e.values[4].length > 6) {
    // El evento se activó desde el formulario esperado, realizar acciones necesarias
    // Tu código para enviar el correo de confirmación o cualquier otra acción
    // ...


agregarFolioRegistro();
  
  try {
  } catch (error) {
    console.error("Error en agregarFolioRegistro2: " + error);
  }

  
    

  const hoja = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1076169836");
   const formulario = hoja.getSheetByName("Respuestas de formulario 3");

  

  const lastRow = formulario.getLastRow();

  const nombre = formulario.getRange(lastRow, 5).getValue();
  const ri = formulario.getRange(lastRow, 4).getValue();
  const comentarios = formulario.getRange(lastRow, 6).getValue();
  const registro = formulario.getRange(lastRow, 1).getValue();
  const mail= formulario.getRange(lastRow, 3).getValue();
  const memo1 = formulario.getRange(lastRow, 7).getValue();
  const presupuesto1 = formulario.getRange(lastRow, 12).getValue();


  const recipient = mail;
  const subject = `Registro número ${registro}`;
  const emailcomun = "asdasd";
  

  const body = `<p>Se registró la solicitud del servicio para la oficina <strong>${nombre}</strong></p>
		<p>Su número de seguimiento es: <span style="color: green; font-size: 40px;"><strong>${registro}</strong></span></p>
		<p>Tu solicitud fue:<br>${comentarios}</p>
    <p>el ri es :<br>${ri}</p>
    <p>su presupuesto fue :<br>${presupuesto1}</p>
    <p>su memo fue :<br>${memo1}</p>
		<p>Gracias.</p>
		<em>Dirección de talleres</em></p>
	  <p></p>`;

  const optsAvanzadas = { name: "Direccion de talleres BHI", htmlBody: body };
  GmailApp.sendEmail(recipient, subject, emailcomun, optsAvanzadas);

  PasarDatos()
  }
  else
  console.log("no fue actuado");
  
}





function agregarFolioRegistro() {
  const hoja = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1076169836");
  const es = hoja.getSheetByName("Respuestas de formulario 3");
  const renglon = es.getLastRow();
  const registro = renglon - 1;
  const folioRegistro = `BHI-${Utilities.formatString("%04d", registro)}-26`;
  es.getRange(renglon, 1).setValue(folioRegistro);
  return folioRegistro;
}





function PasarDatos() {
  const hojaFormulario = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1076169836");
  const formulario = hojaFormulario.getSheetByName("Respuestas de formulario 3");
  const ultimaCeldaFormulario = formulario.getLastRow();



  const id = formulario.getRange(ultimaCeldaFormulario, 1).getValue();
  const fechaRecibida = formulario.getRange(ultimaCeldaFormulario, 2).getValue();
  const email = formulario.getRange(ultimaCeldaFormulario, 3).getValue();
  const ri = formulario.getRange(ultimaCeldaFormulario, 4).getValue();
  const oficina = formulario.getRange(ultimaCeldaFormulario, 5).getValue();
  const detalle = formulario.getRange(ultimaCeldaFormulario, 6).getValue();
  const memo = formulario.getRange(ultimaCeldaFormulario, 7).getValue();
  const telefono = formulario.getRange(ultimaCeldaFormulario, 9).getValue();
  const observaciones = formulario.getRange(ultimaCeldaFormulario, 11).getValue();
  const presupuesto = formulario.getRange(ultimaCeldaFormulario, 12).getValue();
  const fechaPresupuesto = formulario.getRange(ultimaCeldaFormulario, 13).getValue();
  const fechaMemo = formulario.getRange(ultimaCeldaFormulario, 14).getValue();
  const kilometraje = formulario.getRange(ultimaCeldaFormulario, 15).getValue();

  const hojaSolicitudes = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  const solicitudes = hojaSolicitudes.getSheetByName("Solicitudes Generales");
  let dataColumn = solicitudes.getRange("A:A").getValues();
  let ultimaCeldaSolicitudes = dataColumn.filter(String).length + 2;
  console.log(ultimaCeldaSolicitudes)

  const checkboxValidation = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
  const enviarMailsValidation = SpreadsheetApp.newDataValidation().requireValueInList(["solo al mail","mail y delegaciones"]).build();
  const rechazarMailsValidation = SpreadsheetApp.newDataValidation().requireValueInList(["Falta Memo", "Falta Presupuesto", "Motivo Escrito", "Actualizar Presupuesto"]).build();
  
  const memoModificado = CortalinkSalto(memo);
  const presupuestoModificado = CortalinkSalto(presupuesto);
  
  solicitudes.getRange(ultimaCeldaSolicitudes, 1).setValue(id);
  solicitudes.getRange(ultimaCeldaSolicitudes, 2).setValue(fechaRecibida);
  solicitudes.getRange(ultimaCeldaSolicitudes, 3).setValue(ri);
  solicitudes.getRange(ultimaCeldaSolicitudes, 4).setValue(memoModificado);
  solicitudes.getRange(ultimaCeldaSolicitudes, 5).setValue(presupuestoModificado);
  solicitudes.getRange(ultimaCeldaSolicitudes, 6).setDataValidation(checkboxValidation).setValue(false);
  solicitudes.getRange(ultimaCeldaSolicitudes, 7).setDataValidation(enviarMailsValidation);
  solicitudes.getRange(ultimaCeldaSolicitudes, 8).setValue("Pendiente");
  solicitudes.getRange(ultimaCeldaSolicitudes, 10).setDataValidation(rechazarMailsValidation);
  solicitudes.getRange(ultimaCeldaSolicitudes, 11).setValue("Pendiente");
  solicitudes.getRange(ultimaCeldaSolicitudes, 12).setValue(oficina);
  solicitudes.getRange(ultimaCeldaSolicitudes, 13).setValue(detalle);
  solicitudes.getRange(ultimaCeldaSolicitudes, 14).setValue(observaciones);
  solicitudes.getRange(ultimaCeldaSolicitudes, 15).setValue("comentarios");
  solicitudes.getRange(ultimaCeldaSolicitudes, 16).setValue(telefono);
  solicitudes.getRange(ultimaCeldaSolicitudes, 17).setValue(email);
  solicitudes.getRange(ultimaCeldaSolicitudes, 18).setValue(kilometraje);
  solicitudes.getRange(ultimaCeldaSolicitudes, 34).setValue(fechaPresupuesto);
  solicitudes.getRange(ultimaCeldaSolicitudes, 33).setValue(fechaMemo);
}

// Función auxiliar para modificar el formato del memo y presupuesto
function CortalinkSalto(texto) {
  // Realiza las modificaciones necesarias al texto y devuelve el resultado
  return texto;
}














////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





///////////////////////////////////////Editor que controla las funciones de la planilla Solicitudes (Enviar Suministro a FACTURACION , Reenviar Suministro , Rechazar Mails///////////


function mionEdit(e) {

  var sh = e.range.getSheet();
  let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");
  
  let celdaseleccionada = e.range.getRow()
  let suministro = solicitudes.getRange(celdaseleccionada,8).getValue();
  let detalle = solicitudes.getRange(celdaseleccionada,13).getValue();
  let id = solicitudes.getRange(celdaseleccionada,1).getValue();
  let ri = solicitudes.getRange(celdaseleccionada,3).getValue();
  let email = solicitudes.getRange(celdaseleccionada,17).getValue();
  let vale = solicitudes.getRange(celdaseleccionada,4).getValue()
  let presupuesto = solicitudes.getRange(celdaseleccionada,5).getValue()
  let rangocelda8;




  /////////////////////Condicionales para enviar suministro a facturacion y reenviar suministro al Mail//////////////////////////////////////////////////

  //Condicional que crea los 3 valores
  if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 6 && e.range.rowStart > 1 && e.value == "TRUE") {
    e.source.toast("Validacion confirmada");
    let rule = SpreadsheetApp.newDataValidation().requireValueInList(["Pase a Firma","Iniciado" ,"aprobado","pase a fisico"]).build();
    let valor2 = e.range.getRow()
    solicitudes.getRange(valor2,9).setDataValidation(rule);
  }








if (sh.getName() == "Solicitudes Generales" && e.range.columnStart == 7 && e.range.rowStart > 1 && (e.value == "solo al mail" || e.value == "mail y delegaciones")) {
  const sheet = e.source.getActiveSheet();
  const row = e.range.rowStart;
  const opcion = e.value;

  // Obtener datos de la fila editada
  const email = sheet.getRange(row, 17).getValue().trim(); // Columna Q (17)
  const numeroSolicitud = sheet.getRange(row, 1).getValue(); // Columna A
  const numeroOrden = sheet.getRange(row, 11).getValue(); // Columna K
  const pedido = sheet.getRange(row, 5).getValue(); // Columna E

  // Construir el mensaje
  const asunto = "Orden de compra generada";
  const mensaje = `Se ha generado una orden de compra para la solicitud ${numeroSolicitud}, su número de orden es ${numeroOrden}, y su pedido fue ${pedido}.`;

  let destinatarios = email;

  // Agregar delegacionesc@gmail.com si corresponde
  if (opcion == "mail y delegaciones") {
    destinatarios = [email, "delegacionesc@gmail.com"].filter(Boolean).join(", ");
  }

  // Enviar correo si hay datos válidos
  if (destinatarios && numeroOrden) { // Verificamos al menos que haya número de orden
    GmailApp.sendEmail(destinatarios, asunto, mensaje);
    
    // Registrar envío en columna H (8)
    sheet.getRange(row, 20).setValue(`Enviado: ${new Date().toLocaleString()}`);



   // Colorear toda la fila en verde claro
    const lastColumn = sheet.getLastColumn();
    const rowRange = sheet.getRange(row, 1, 1, lastColumn);
    rowRange.setBackground("#c1f9b8"); // Verde claro



  }

  


}







//condicional que ENVIA EL SUMINISTRO Y AVISA QUE LO TIENE MARTIN EN EL ESCRITORIO
  if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 9 && e.range.rowStart > 1 && e.value == "Pase a Firma") {
    
    let traerDatosPase = e.range.getSheet();
    let filaSelec = e.range.rowStart;


    let ui = SpreadsheetApp.getUi();
    let button = ui.alert(`Desea enviar el iniciado al mail ${email} ?`,ui.ButtonSet.YES_NO);
      if( button == ui.Button.YES ) {

        const recipient = email; //mail a enviar
        const subject = `Registro número ${id}`; //numero de registro
        const emailcomun = "asdasd"
        const body = `<p> se a iniciado el proceso del Numero De seguimiento: ${id} <p>
		<p>su numero de ri fue:${ri} </p>
		<p>Tu Solicitud fue:<br> ${detalle}</p>
		<p>Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;
        }

          let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());


    rangoFilaPase.setBackgroundRGB(173, 217, 230 );


   rangocelda8 = e.range.rowStart
     solicitudes.getRange(rangocelda8,22).setValue(horaLocal); //esto le daba la fecha del pase a fisico



































  //pase a martin




  function agregarDatosEnOtroArchivo() {
  var sh = e.range.getSheet();
  let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");
  let pedidos = solucitudesgenerales.getSheetByName("PEDIDOS INTERNOS");

  // Obtener la referencia al archivo
  let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192");

  // Obtener la hoja en la que deseas escribir
  let hoja = archivo.getSheetByName("2023");

  // Obtener la última fila no vacía en la primera columna
  let ultimaFila = hoja.getRange("A:A").getValues().filter(String).length + 2;

  let checkboxf = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();

  let celdaseleccionada = e.range.getRow();
  let seguimiento = solicitudes.getRange(celdaseleccionada, 1).getValue();
  let FechaCargaPedido = solicitudes.getRange(celdaseleccionada, 2).getValue();
  let RIP = solicitudes.getRange(celdaseleccionada, 3).getValue();
  let SuministroM = solicitudes.getRange(celdaseleccionada, 8).getValue();
  let Kilometraje = solicitudes.getRange(celdaseleccionada, 18).getValue();
  let Fvale = solicitudes.getRange(celdaseleccionada, 33).getValue();
  let FPresupuesto = solicitudes.getRange(celdaseleccionada, 34).getValue();

  // Buscar el código de seguimiento en la hoja de cálculo de destino
  let columnaSeguimiento = hoja.getRange("A:A");
  let codigoBuscado = columnaSeguimiento.createTextFinder(seguimiento).findNext();

  if (codigoBuscado) {
    // Si se encuentra el código de seguimiento en la hoja de cálculo de destino
    // Actualizar los valores correspondientes en la fila existente
    let filaExistente = codigoBuscado.getRow();

    let fechaVale = new Date(Fvale);
    fechaVale.setDate(fechaVale.getDate() + 1);

    let fechaPresupuesto = new Date(FPresupuesto);
    fechaPresupuesto.setDate(fechaPresupuesto.getDate() + 2);

    hoja.getRange(filaExistente, 4).setValue(fechaVale);
    hoja.getRange(filaExistente, 5).setValue(fechaPresupuesto);
    hoja.getRange(filaExistente, 6).setValue(FechaCargaPedido);
    hoja.getRange(filaExistente, 13).setValue(SuministroM);
    hoja.getRange(filaExistente, 16).setValue(RIP);
    hoja.getRange(filaExistente, 18).setValue(Kilometraje);
    hoja.getRange(filaExistente, 29).setValue(checkboxf);
  } else {
    let checkboxf = SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
    let fechaVale = new Date(Fvale);
    fechaVale.setDate(fechaVale.getDate() + 1);

    let fechaPresupuesto = new Date(FPresupuesto);
    fechaPresupuesto.setDate(fechaPresupuesto.getDate() + 1);

    // Verificar si la fila a copiar contiene datos
    let filaACopiar = solicitudes.getRange(celdaseleccionada, 1, 1, 34).getValues()[0];
    let tieneDatos = filaACopiar.some((valor) => valor !== "");

    if (tieneDatos) {
      // Buscar la siguiente fila vacía en la hoja de destino
      let siguienteFilaVacia = ultimaFila + 1;
      while (hoja.getRange("A" + siguienteFilaVacia).getValue() !== "") {
        siguienteFilaVacia++;
      }

      // Escribir nuevos datos en la siguiente fila vacía
      const celdaA = hoja.getRange("A" + siguienteFilaVacia);
      const celdaD = hoja.getRange("D" + siguienteFilaVacia);
      const celdaE = hoja.getRange("E" + siguienteFilaVacia);
      const celdaF = hoja.getRange("F" + siguienteFilaVacia);
      const celdaM = hoja.getRange("M" + siguienteFilaVacia);
      const celdaP = hoja.getRange("P" + siguienteFilaVacia);
      const celdaG = hoja.getRange("G" + siguienteFilaVacia);
      celdaA.setValue(seguimiento);
      celdaD.setValue(fechaVale);
      celdaE.setValue(fechaPresupuesto);
      celdaF.setValue(FechaCargaPedido);
      celdaM.setValue(SuministroM);
      celdaP.setValue(RIP);
      //celdaG.setValue(new Date())
    }
  }
}

agregarDatosEnOtroArchivo();

  }






















  //CONDICIONAL QUE ENVIA EL SUMINISTRO A FACTURACION,PREGUNTA SI LO QUERES ENVIAR
   if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 9 && e.range.rowStart > 1 && e.value == "Iniciado") {

       let traerDatosPase = e.range.getSheet();
      let filaSelec = e.range.rowStart;


        let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
        let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");
    
    rangocelda8 = e.range.rowStart
     solicitudes.getRange(rangocelda8,23).setValue(horaLocal);

    let  ui1 = SpreadsheetApp.getUi();
    let button = ui1.alert(`Desea enviar Suministro al mail ${email} ?`,ui1.ButtonSet.YES_NO);
      if( button == ui1.Button.YES ) {

        const recipient = email; //mail a enviar
        const subject = `Registro número ${id}`; //numero de registro
        const emailcomun = "asdasd"
        const body = `<p> se a cargado el proceso en SGC  <p>
		<p>su numero de suministro es:${suministro} </p>
		<p>Tu Solicitud fue:<br> ${detalle}</p>
		<p>Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;

      }





        

        // Obtener la referencia al archivo
        let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192")
      
        // Obtener la hoja en la que deseas escribir
        let hoja = archivo.getSheetByName("2023");
      



       let celdaseleccionada = e.range.getRow()
      //let FechaInicioRafam = solicitudes.getRange(celdaseleccionada,23).getValue();

      


       // Buscar el código de seguimiento en la hoja de cálculo de destino
        let seguimiento = solicitudes.getRange(celdaseleccionada,1).getValue();
        

      let columnaSeguimiento = hoja.getRange("A:A");

      let codigoBuscado = columnaSeguimiento.createTextFinder(seguimiento).findNext();

      

      if (codigoBuscado) { // Si se encuentra el código de seguimiento en la hoja de cálculo de destino
      // Actualizar los valores correspondientes en la fila existente
      
      let filaExistente = codigoBuscado.getRow();


function obtenerFechaExacta() {
  let fechaActual = new Date();

  
 
  
  return fechaActual;
}

      hoja.getRange(filaExistente, 7).setValue(obtenerFechaExacta());


       }








    let  ui2 = SpreadsheetApp.getUi();
    let button2 = ui2.alert(`Desea enviar Suministro a planilla de facturacion?`,ui2.ButtonSet.YES_NO);
      if (button2 == ui2.Button.YES) {
        
          let facturacion = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=317020542");
  let hojafacturacion = facturacion.getSheetByName("Facturacion");

       let valor2f = e.range.getRow()
       let idf= solicitudes.getRange(valor2f,1).getValue()
       let suministrof = solicitudes.getRange(valor2f,8).getValue()
       let rif = solicitudes.getRange(valor2f,3).getValue()
       let ultimaceldaSf = hojafacturacion.getLastRow() + 1;
       let checkboxf=SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
      let descripccion = solicitudes.getRange(valor2f,13).getValue()
       let email = solicitudes.getRange(valor2f,17).getValue();
        
         let rule2 = SpreadsheetApp.newDataValidation().requireValueInList(["Pendiente de Conformidad","Pase a Martin","Firmo Martin"]).build();
     
        
        hojafacturacion.getRange(ultimaceldaSf,1).setValue(idf);
        hojafacturacion.getRange(ultimaceldaSf,2).setValue(suministrof);
        hojafacturacion.getRange(ultimaceldaSf,3).setValue(suministrof);
        hojafacturacion.getRange(ultimaceldaSf,4).setValue(rif);
        hojafacturacion.getRange(ultimaceldaSf,5).setDataValidation(checkboxf).setValue(false);;
         hojafacturacion.getRange(ultimaceldaSf,8).setDataValidation(checkboxf).setValue(false);;
         hojafacturacion.getRange(ultimaceldaSf,13).setDataValidation(checkboxf).setValue(false);;
        hojafacturacion.getRange(ultimaceldaSf,18).setDataValidation(rule2);
        hojafacturacion.getRange(ultimaceldaSf,19).setDataValidation(checkboxf).setValue(false);;
        hojafacturacion.getRange(ultimaceldaSf,30).setValue(descripccion);
        hojafacturacion.getRange(ultimaceldaSf,31).setValue(email);

       
      
         
      }
        let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());


    rangoFilaPase.setBackgroundRGB(245, 255, 176);














     










     
   }
































  
//CONDICIONAL QUE CAMBIA DE COLOR
    if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 9 && e.range.rowStart > 1 && e.value == "aprobado") {

        let traerDatosPase = e.range.getSheet();
    let filaSelec = e.range.rowStart;
    
       let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
        let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");

    rangocelda8 = e.range.rowStart
    solicitudes.getRange(rangocelda8,24).setValue(horaLocal);
    
  

     let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());


    rangoFilaPase.setBackgroundRGB(245, 255, 176);






   // Obtener la referencia al archivo
        let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192")
      
        // Obtener la hoja en la que deseas escribir
        let hoja = archivo.getSheetByName("2023");
      



       let celdaseleccionada = e.range.getRow()
        let FechaAprobadoRafam = solicitudes.getRange(celdaseleccionada,24).getValue();




       // Buscar el código de seguimiento en la hoja de cálculo de destino
        let seguimiento = solicitudes.getRange(celdaseleccionada,1).getValue();
      let columnaSeguimiento = hoja.getRange("A:A");
      let codigoBuscado = columnaSeguimiento.createTextFinder(seguimiento).findNext();

      

      if (codigoBuscado) { // Si se encuentra el código de seguimiento en la hoja de cálculo de destino
      // Actualizar los valores correspondientes en la fila existente
      let filaExistente = codigoBuscado.getRow();


      function obtenerFechaExacta() {
      let fechaActual = new Date();

  
 
  
      return fechaActual;
}
      hoja.getRange(filaExistente, 10).setValue(obtenerFechaExacta());



  }


  
  }
    


  //CONDICIONAL QUE CAMBIA DE COLOR
  if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 9 && e.range.rowStart > 1 && e.value ==  "pase a fisico") {

       let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
        let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");

       rangocelda8 = e.range.rowStart
     solicitudes.getRange(rangocelda8,25).setValue(horaLocal);


   let  ui3 = SpreadsheetApp.getUi();
    let button = ui3.alert(`Desea enviar el aprobado de sgc al mail ${email} ?`,ui3.ButtonSet.YES_NO);
      if( button == ui3.Button.YES ) {

        const recipient = email; //mail a enviar
        const subject = `Registro número ${id}`; //numero de registro
        const emailcomun = "asdasd"
        const body = `<p> se a aprobado el proceso  <p>
		<p>El suministro ${suministro} ya se puede visualizar en la mesa de entrada  </p>
		<p>Tu Solicitud fue:<br> ${detalle}</p>
		<p>Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;
        }



         let traerDatosPase = e.range.getSheet();
        let filaSelec = e.range.rowStart;
    
  

     let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());
  


    rangoFilaPase.setBackgroundRGB(255, 215, 145);
    






    
     
      // Obtener la referencia al archivo
        let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192")
      
        // Obtener la hoja en la que deseas escribir
        let hoja = archivo.getSheetByName("2023");
      



       let celdaseleccionada = e.range.getRow()
        let FechaPaseFisico = solicitudes.getRange(celdaseleccionada,25).getValue();




       // Buscar el código de seguimiento en la hoja de cálculo de destino
        let seguimiento = solicitudes.getRange(celdaseleccionada,1).getValue();
      let columnaSeguimiento = hoja.getRange("A:A");
      let codigoBuscado = columnaSeguimiento.createTextFinder(seguimiento).findNext();

      

      if (codigoBuscado) { // Si se encuentra el código de seguimiento en la hoja de cálculo de destino
      // Actualizar los valores correspondientes en la fila existente
      let filaExistente = codigoBuscado.getRow();


      function obtenerFechaExacta() {
      let fechaActual = new Date();

  
 
  
      return fechaActual;
}



      hoja.getRange(filaExistente, 11).setValue(obtenerFechaExacta());



      }




















    
     
     //solicitudes.getRange(rangocelda8,8).setValue(horaLocal); //esto le daba la fecha del pase a fisico

    

       }



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

























/////////////////////////////////////////////////////Condicionales Para reenviar Suministros////////////////////////////////////////////////

 

   if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 7 && e.range.rowStart > 1 && e.value == "A Martin") {

          recipient = "martinbuiani@hotmail.com"; //mail a enviar
         subject = `Registro número ${id}`; //numero de registro
         emailcomun = "asdasd"
          body = `<p> se a iniciado el proceso de compra el Ri: ${ri}<p>
		<p>su numero de suministro es:${suministro} </p>
		<p>Tu Solicitud fue:<br> ${detalle}</p>
		<p>Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;




  }

   if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 7 && e.range.rowStart > 1 && e.value == "A Cristian") {

          recipient = "muja301984@gmail.com"; //mail a enviar
         subject = `Registro número ${id}`; //numero de registro
         emailcomun = "asdasd"
          body = `<p> se a iniciado el proceso de compra el Ri: ${ri}<p>
		<p>su numero de suministro es:${suministro} </p>
		<p>Tu Solicitud fue:<br> ${detalle}</p>
		<p>Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;




  }







































////////////////////////////////////////////////////////////////////////////////////////////Condicionales Para Rechazar solicitudes/////////////////



    if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 10 && e.range.rowStart > 1 && e.value == "Falta Memo") {

      let traerDatosPase = e.range.getSheet();
        let filaSelec = e.range.rowStart;


          recipient = email; //mail a enviar
         subject = `Registro Rechazado número ${id}`; //numero de registro
         emailcomun = "asdasd"
          body = `<p>Se ha rechazado el proceso de compra del Ri: ${ri} debido a un error o falta en el Memo.</p>
                  <p>Por favor, realice una nueva solicitud incluyendo toda la información necesaria.</p>
                  <p>Si necesita ayuda para completar la solicitud, no dude en contactarnos.</p>
                  <p>Gracias por su comprensión.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;


      let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());


        rangoFilaPase.setBackgroundRGB(255, 63, 63 );

  }


  
     if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 10 && e.range.rowStart > 1 && e.value == "Falta Presupuesto") {

         let traerDatosPase = e.range.getSheet();
        let filaSelec = e.range.rowStart;

          recipient = email; //mail a enviar
         subject = `Registro Rechazado número ${id}`; //numero de registro
         emailcomun = "asdasd"
              body = `<p>Se ha rechazado el proceso de compra del Ri: ${ri} debido a un error o falta en el Presupuesto.</p>
                      <p>Por favor, realice una nueva solicitud incluyendo toda la información necesaria.</p>
                      <p>Si necesita ayuda para completar la solicitud, no dude en contactarnos.</p>
                      <p>Gracias por su comprensión.</p>>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;


        let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());


        rangoFilaPase.setBackgroundRGB(255, 63, 63 );

  }



     if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 10 && e.range.rowStart > 1 && e.value == "Actualizar Presupuesto") {

        let traerDatosPase = e.range.getSheet();
        let filaSelec = e.range.rowStart;

          recipient = email;
         subject = `Registro Rechazado número ${id}`;
         emailcomun = "asdasd"
          body = `<p>Se ha rechazado el proceso de compra del Ri: ${ri} debido a que se debe actualizar el presupuesto.</p>
                  <p>Por favor, realice una nueva solicitud incluyendo el presupuesto actualizado.</p>
                  <p>Si necesita ayuda para completar la solicitud, no dude en contactarnos.</p>
                  <p>Gracias por su comprensión.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun, optsAvanzadas);

        let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());
        rangoFilaPase.setBackgroundRGB(255, 63, 63);
  }


     if(sh.getName() == "Solicitudes Generales" && e.range.columnStart == 10 && e.range.rowStart > 1 && e.value == "Motivo Escrito") {

         let traerDatosPase = e.range.getSheet();
        let filaSelec = e.range.rowStart;

         let solucitudesgeneralesR = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
          let solicitudesR = solucitudesgeneralesR.getSheetByName("Solicitudes Generales");


          recipient = email; //mail a enviar
         subject = `Registro Rechazado número ${id}`; //numero de registro
         emailcomun = "asdasd"

        let message = Browser.inputBox("Escribe tu mensaje");

          if (message == "cancelar" || message == "cancel" ) {
              return;
            }

            body = `<p> se a Rechazado el proceso de compra del Ri: ${ri}<p>
		<p>El motivo es : ${message}   </p>
		<p>Tu Solicitud Debe ser Realizada de nuevo con todos los datos necesarios :<br> </p>
    <p>Su Memo/Vale fue : ${vale}.</p>
    <p>Su Presupuesto fue : ${presupuesto}.</p>
		<p>Muchas Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;

        let rangoceldaM = e.range.rowStart

        solicitudesR.getRange(rangoceldaM,27).setValue(message);



 let rangoFilaPase = traerDatosPase.getRange(filaSelec, 2, 1, traerDatosPase.getMaxColumns());


    rangoFilaPase.setBackgroundRGB(255, 63, 63 );


  }



  
}





function Hora()
{
   const now     = new Date();
   const year    = now.getFullYear();
   const month   = now.getMonth()  + 1;
   const day     = now.getUTCDate();
  // const hora    = now.getHours();
  // const minutos = now.getMinutes();

   const stringHora = day + "/" + month + "/" + year ;// + "-" + hora + ":" +  minutos + "\n";

   return stringHora

}

const horaLocal = Hora()




function DevolucionFacturacion() {
           let facturacion = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=317020542");
  let hojafacturacion = facturacion.getSheetByName("Facturacion");
  let verificacionG;
  let ultimaceldaG = hojafacturacion.getLastRow()
  let ordenCompraG;
  

let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");
  let ultimaceldaS = solicitudes.getLastRow()
  let verificacionS;
  let ordenCompraS ;
  let celdamail;
  let numerocolumna;
  
 
  for (let i = 1; i <= ultimaceldaS ; i++) {
    verificacionS = solicitudes.getRange(i,1).getValue();
    celdamail = solicitudes.getRange(i,1).getRow();

      for(let i = 1; i <= ultimaceldaG ; i++) {
      verificacionG = hojafacturacion.getRange(i,1).getValue();
      ordenCompraS = solicitudes.getRange(i,10).getValue();
      
      
      if (verificacionS === verificacionG && ordenCompraS == "") {
        
        ordenCompraG = hojafacturacion.getRange(i,4).getValue();
        numerocoluma = hojafacturacion.getRange(i,4).getRow();
       
        ordenCompraS = solicitudes.getRange(celdamail,10).setValue(ordenCompraG);

        console.log(`${verificacionS} coincide con ${verificacionG} su suministro es ${ordenCompraG} en la celda ${celdamail} `)
      }
      }
      
  }


}








function moverFila() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let hojaSolicitudes = ss.getSheetByName("Solicitudes Generales");
  let hojaRechazados = ss.getSheetByName("Trabajos Rechazados");
  let hojaFinalizados = ss.getSheetByName("Trabajos Finalizados");
  let hojaConOC = ss.getSheetByName("Trabajos con Numero OC");

  let data = hojaSolicitudes.getDataRange().getValues();
  let backgrounds = hojaSolicitudes.getDataRange().getBackgrounds();
  let columna7 ; 
  let columna8 ; ;
  let columna10 ; 
      
      for (let i = data.length - 1; i >= 0; i--) {
      let fila = i + 1;
      let colorCelda = backgrounds[i][1]; // Verificar color en la segunda columna (índice 1)
        columna7 =  hojaSolicitudes.getRange(fila, 8).getValue();      
        columna8 =   hojaSolicitudes.getRange(fila, 9).getValue();
        columna10 =   hojaSolicitudes.getRange(fila, 11).getValue();

        

         // console.log(typeof columna10)

           if (colorCelda === "#ff3f3f") { // Color deseado (RGB: 182, 215, 168)
                      let filaDatos = hojaSolicitudes.getRange(fila, 1, 1, hojaSolicitudes.getLastColumn());
                      let datos = filaDatos.getValues()[0];
                      hojaRechazados.appendRow(datos);
                      hojaSolicitudes.deleteRow(fila);
                      console.log("paso la fila ", data.length)
              }

              else if (colorCelda === "#b6d7a8") { 
                      let filaDatos = hojaSolicitudes.getRange(fila, 1, 1, hojaSolicitudes.getLastColumn());
                      let datos = filaDatos.getValues()[0];
                      hojaFinalizados.appendRow(datos);
                      hojaSolicitudes.deleteRow(fila);
                      console.log("paso la fila ", data.length)
              }

               else if (typeof columna7 == "number" && columna8 == "pase a fisico" && typeof columna10 == "number") {

                  let filaDatos = hojaSolicitudes.getRange(fila, 1, 1, hojaSolicitudes.getLastColumn());
                   let datos = filaDatos.getValues()[0];
                      hojaConOC.appendRow(datos);
                      hojaSolicitudes.deleteRow(fila);
                      


              }





      }


}