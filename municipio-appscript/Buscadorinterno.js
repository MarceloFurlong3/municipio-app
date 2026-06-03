let solucitudesgenerales2 =SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  let solicitudes2 = solucitudesgenerales2.getSheetByName("Solicitudes Generales");

  let hojabuscador = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1614757895");
  let buscador = hojabuscador.getSheetByName("CARGA OC");

  // Limpiar celdas
  function Limpiar() {
    
    let formulario = buscador 

    let celdasALimpiar = formulario.getRange('A6:F35').clearContent()
    
  }





  // Guardar celdas
  function Guardar(){

  let hojafacturacion = buscador
  let verificacionG;
  let ultimaceldaG = hojafacturacion.getLastRow()
  let ordenCompraG;
  


  let solicitudes = solicitudes2;
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
      
      
      if (verificacionS === verificacionG && verificacionS != "") {

        proveedorG =  hojafacturacion.getRange(i,4).getValue();
        ordenCompraG = hojafacturacion.getRange(i,5).getValue();
        subidaG = hojafacturacion.getRange(i,6).getValue();
        subidaE = hojafacturacion.getRange(i,7).getValue();

        numerocoluma = hojafacturacion.getRange(i,4).getRow();
       
   

       ordenCompraS = solicitudes.getRange(celdamail,10).setValue(proveedorG);
       ordenCompraS = solicitudes.getRange(celdamail,11).setValue(ordenCompraG);
       ordenCompraS = solicitudes.getRange(celdamail,18).setValue(subidaG);
       ordenCompraS = solicitudes.getRange(celdamail,19).setValue(subidaE);

      

        console.log(`${verificacionS} coincide con ${verificacionG} 
        su suministro1 es ${ordenCompraG} en la celda ${celdamail} `)
      }

      
  }}
  GuardarFacturacion()
  }


// Guardar celdas
  function GuardarFacturacion(){

  let hojafacturacion = buscador
  let verificacionG;
  let ultimaceldaG = hojafacturacion.getLastRow()
  let ordenCompraG;
  

  let hojafacturacion2 = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=317020542");
  let nombreFacturacion = hojafacturacion2.getSheetByName("Facturacion")
  let solicitudes = nombreFacturacion;
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
      
      
      if (verificacionS === verificacionG && verificacionS != "") {

        proveedorG =  hojafacturacion.getRange(i,4).getValue();
        ordenCompraG = hojafacturacion.getRange(i,5).getValue();
        subidaG = hojafacturacion.getRange(i,6).getValue();

        numerocoluma = hojafacturacion.getRange(i,4).getRow();
       
      

       ordenCompraS = solicitudes.getRange(celdamail,7).setValue(proveedorG);
       ordenCompraS = solicitudes.getRange(celdamail,4).setValue(ordenCompraG);
       

      

        console.log(`${verificacionS} coincide con ${verificacionG} 
        su suministro es ${ordenCompraG} en la celda ${celdamail} `)
      }
  }}}




















// Buscar
function Buscar() {

       Limpiar()

  let formulario = buscador; // Nombre de hoja del formulario
  
  let valorS = formulario.getRange("B3").getValue();
  
  let valores = solicitudes2.getDataRange().getDisplayValues(); // Nombre de hoja donde se almacenan datos


  let suministro2;
  let ri;
  let oficina;
  let proveedor ;
  let ordenCompra;
  let subidaOrden;
  let ultimaceldaS2 = formulario.getLastRow();
 console.log(valorS)

  let ListaSuministro = [];
  

    valores.forEach(seguimiento => {
      
    if ( seguimiento[8] == valorS) {
      ListaSuministro.push(seguimiento)
    }
  })
  
 
  ListaSuministro.forEach(elemento => {
  
  suministro2 = elemento[0],
  ri = elemento[2],
  oficina = elemento[11],
  proveedor = elemento[10],
  ordenCompra=elemento[9],
  subidaOrden =elemento[17]
  formulario.getRange(ultimaceldaS2 + 1 ,1).setValue(suministro2);
  formulario.getRange(ultimaceldaS2 + 1 ,2).setValue(ri)
  formulario.getRange(ultimaceldaS2 + 1 ,3).setValue(oficina)
  formulario.getRange(ultimaceldaS2 + 1 ,4).setValue(proveedor)
  formulario.getRange(ultimaceldaS2 + 1 ,5).setValue(ordenCompra)
  formulario.getRange(ultimaceldaS2 + 1 ,6).setValue(subidaOrden)

  ultimaceldaS2 = ultimaceldaS2 +1;

  

  })
    
  
  
}



































































// Actualizar
//function Actualizar(){
  
  //let formulario = buscador; // Nombre de hoja del formulario
  //let datos = solicitudes2; // Nombre de hoja donde se almacenan datos
  
  //let valor = formulario.getRange("B3").getValue();
  //let valores = hojaActiva.getSheetByName("Datos").getDataRange().getValues(); // Nombre de hoja donde se almacenan datos
  //for (let i = 0; i < valores.length; i++) {
    //let fila = valores[i]
    //if(fila[NUM_COLUMNA_BUSQUEDA] == valor) {
      //let INT_R = i+1
      
     // let valores1 = [[formulario.getRange("B6").getValue(),
                //      formulario.getRange("B8").getValue(),
              //        formulario.getRange("B10").getValue(),
            //          formulario.getRange("D6").getValue(),
          //            formulario.getRange("D8").getValue(),
        //              formulario.getRange("D10").getValue()]];
      
      //datos.getRange(INT_R, 1, 1, 6).setValues(valores1);
      //SpreadsheetApp.getUi().alert('Datos actualizados');

      //Limpiar(); // Ejecución de función para limpieza de celdas
    //}
  //}
//}


// Eliminar
// function Eliminar() {
  // let hojaActiva = SpreadsheetApp.getActiveSpreadsheet();
  // let formulario = hojaActiva.getSheetByName("Formulario"); // Nombre de hoja del formulario
  // let datos = hojaActiva.getSheetByName("Datos"); // Nombre de hoja donde se almacenan datos
  
 //  let interface = SpreadsheetApp.getUi();
 //  let respuesta = interface.alert('¿Está seguro de borrar?',interface.ButtonSet.YES_NO);
  
  // Proceso si el usuario responde
  // if (respuesta == interface.Button.YES) {
    
   //  let valor = formulario.getRange("B3").getValue();
    // let valores = hojaActiva.getSheetByName("Datos").getDataRange().getValues(); // Nombre de hoja donde se almacenan datos
    // for (let i = 0; i< valores.length; i++) {
     //  let fila = valores[i];
      // if (fila[NUM_COLUMNA_BUSQUEDA] == valor) {
        // let INT_R = i+1
        
        // datos.deleteRow(INT_R);
        // Limpiar(); // Ejecución de función para limpieza de celdas
      // }
   //  }
  // }