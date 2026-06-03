const FacturaFirma = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1484211422");
const HojaFacturaFirma = FacturaFirma.getSheetByName("Factura a Firmar");


const Facturacionlink = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=1484211422");
const FacturacionHoja= Facturacionlink.getSheetByName("Facturacion");



function traerdatosFacturacion(t) {


const traerDatos = t.range.getSheet();


if(traerDatos.getName() == "Facturacion" && t.range.columnStart == 13 && t.range.rowStart > 1 && t.value == "Pase a Impresion") {

 
  let valor2 = t.range.getRow()
  
 let VFacturas = FacturacionHoja.getRange(valor2,9).getValue();  //primer dato
 let VPago1 = FacturacionHoja.getRange(valor2,10).getValue(); // segundo dato
 let VProveedores = FacturacionHoja.getRange(valor2,8).getValue(); // tecer dato
 let VRI = FacturacionHoja.getRange(valor2,4).getValue(); // cuarto dato
 let VOrdenCompra = FacturacionHoja.getRange(valor2,5).getValue(); // quinto dato

  HojaFacturaFirma.getRange(23,4).setValue(VFacturas);
  HojaFacturaFirma.getRange(24,4).setValue(VPago1);
  HojaFacturaFirma.getRange(26,4).setValue(VProveedores);
  HojaFacturaFirma.getRange(27,4).setValue(VRI);
  HojaFacturaFirma.getRange(28,4).setValue(VOrdenCompra);
  HojaFacturaFirma.getRange(6,7).setValue(new Date());  // Dato del dia actual
  HojaFacturaFirma.getRange(25,3).setValue(NumeroALetras(VPago1))
 

}

}




function ColorFacturacion(d) {
  const traerDatos = d.range.getSheet();
  const filaSelec = d.range.rowStart;
 let valor2 = d.range.getRow()
    let RI = FacturacionHoja.getRange(valor2,4).getValue();
    let VProveedores = FacturacionHoja.getRange(valor2,8).getValue();
    let descripcion = FacturacionHoja.getRange(valor2,29).getValue();
    let email = FacturacionHoja.getRange(valor2,30).getValue();


 if (traerDatos.getName() == "Facturacion" && d.range.columnStart == 18 && d.range.rowStart > 1 && d.value == "Enviar Orden y Proveedor1") {

    let ui = SpreadsheetApp.getUi();
 
      if( button == ui.Button.YES ) {

        const recipient = email; //mail a enviar
        const subject = `Registro número ${id}`; //numero de registro
        const emailcomun = "asdasd"
        const body = `<p> Se a generado la Orden De Compra del Ri  ${ri} su numero es ${VProveedores} <p>
		<p>su numero de ri fue:${ri} </p>
		<p>Tu Solicitud fue:<br> ${detalle}</p>
		<p>Gracias.</p>`

        let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
        GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;
        }



 }






















  if (traerDatos.getName() == "Facturacion" && d.range.columnStart == 19 && d.range.rowStart > 1 && d.value == "TRUE") {
    // Selecciona la fila completa usando el método getRange()
    const rangoFila = traerDatos.getRange(filaSelec, 1, 1, traerDatos.getMaxColumns());

    // Cambia el color de fondo del rango de celdas seleccionado
    rangoFila.setBackgroundRGB(182, 215, 168);

        let fila = d.range.getRow();


     // Obtener el número de seguimiento en la columna A de la misma fila
          let codigoSeguimiento = d.source.getRange("A" + fila).getValue();

          let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
            let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");

         // Obtener la hoja "Solicitudes Generales"
          let solicitudesGenerales = solicitudes
          
          // Buscar el código de seguimiento en la columna A de la hoja "Solicitudes Generales"
          let codigoSeguimientoRange = solicitudesGenerales.getRange("A:A").createTextFinder(codigoSeguimiento).findNext();
          
          // Si se encuentra el código de seguimiento
          if (codigoSeguimientoRange) {

                let fila = codigoSeguimientoRange.getRow();

                let filaCompleta = solicitudesGenerales.getRange(fila, 2, 1, solicitudesGenerales.getLastColumn());

                filaCompleta.setBackgroundRGB(182, 215, 168)
            }
  }
  else if (traerDatos.getName() == "Facturacion" && d.range.columnStart == 19 && d.range.rowStart > 1 && d.value == "FALSE") {
    // Selecciona la fila completa usando el método getRange()
    const rangoFila = traerDatos.getRange(filaSelec, 1, 1, traerDatos.getMaxColumns());

    // Cambia el color de fondo del rango de celdas seleccionado
    rangoFila.setBackground('white');
  }









}






function PasarOrdenes(e) {
  // Verificar si la hoja editada es "facturacion"
  if (e.source.getActiveSheet().getName() == "Facturacion") {
    // Verificar si la columna editada es E (columna 5)
    if (e.range.getColumn() == 5) {
      // Verificar si la celda editada es un checkbox
      if (e.value == "TRUE") {
        // Si la celda editada es el checkbox, mostrar un diálogo para ingresar el número de orden de compra
        let ordenCompra = Browser.inputBox("Agregar número de orden de compra");
        if (ordenCompra) { // Si se ingresó un valor de orden de compra

          // Obtener la fila editada
          let fila = e.range.getRow();
          
          // Obtener el número de seguimiento en la columna A de la misma fila
          let codigoSeguimiento = e.source.getRange("A" + fila).getValue();


          let solucitudesgenerales = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
          let solicitudes = solucitudesgenerales.getSheetByName("Solicitudes Generales");

          
          // Obtener la hoja "Solicitudes Generales"
          let solicitudesGenerales = solicitudes
          
          // Buscar el código de seguimiento en la columna A de la hoja "Solicitudes Generales"
          let codigoSeguimientoRange = solicitudesGenerales.getRange("A:A").createTextFinder(codigoSeguimiento).findNext();
          
          // Si se encuentra el código de seguimiento
          if (codigoSeguimientoRange) {
            // Obtener la fila correspondiente en la hoja "Solicitudes Generales"
            let filaSolicitudesGenerales = codigoSeguimientoRange.getRow();
            
            // Escribir el valor de la orden de compra en la columna 11 correspondiente en la hoja "Solicitudes Generales"
            solicitudesGenerales.getRange(filaSolicitudesGenerales, 11).setValue(ordenCompra);


           let email = solicitudesGenerales.getRange(filaSolicitudesGenerales,17).getValue();
            let ui = SpreadsheetApp.getUi();

          
          //envia el mail al solicitante para que haga el tramite de turno para el proveedor o cualquier cosa uqe necesite hacer
          let button = ui.alert(`Desea enviar la orden y el proveedor a ${email} ?`,ui.ButtonSet.YES_NO);

          if (button == ui.Button.YES) {
              
              let email = solicitudesGenerales.getRange(filaSolicitudesGenerales,17).getValue();
              let RI = solicitudesGenerales.getRange(filaSolicitudesGenerales,3).getValue();
              let VProveedores = Browser.inputBox("Agregar proveedor");
              let descripcion = solicitudesGenerales.getRange(filaSolicitudesGenerales,13).getValue();
              let OrdenCompra = solicitudesGenerales.getRange(filaSolicitudesGenerales,11).getValue();
              let id = solicitudesGenerales.getRange(filaSolicitudesGenerales,1).getValue();


                const recipient = email; //mail a enviar
                const subject = `Registro número ${id}`; //numero de registro
                const emailcomun = "Comunicarse con administracion talleres por consulta de pedido"//mail fallido

                const body = `<p> Se a generado la Orden De Compra del Ri ${RI} <p>
                              <p>su numero es: ${OrdenCompra} <p>
		                          <p>su pedido fue:<br>${descripcion}<br> </p>
		                          <p>Se debera coordinar con el proveedor:<br> ${VProveedores}</p>
		                          <p> Gracias.</p>`

                              let optsAvanzadas = {name: "Direccion de talleres BHI", htmlBody: body};
                              GmailApp.sendEmail(recipient, subject, emailcomun,optsAvanzadas);      ;

                             }
                              
                               
                                
           }

              








          }




















            if (ordenCompra) { // Si se ingresó un valor de orden de compra

          // Obtener la fila editada
          let fila = e.range.getRow();
          
          // Obtener el número de seguimiento en la columna A de la misma fila
          let codigoSeguimiento = e.source.getRange("A" + fila).getValue();


            
      // Obtener la referencia al archivo
        let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192")
      
        // Obtener la hoja en la que deseas escribir
        let hoja = archivo.getSheetByName("2023");

          
          // Obtener la hoja "Solicitudes Generales"
          let solicitudesGenerales = hoja
          
          // Buscar el código de seguimiento en la columna A de la hoja "Solicitudes Generales"
          let codigoSeguimientoRange = solicitudesGenerales.getRange("A:A").createTextFinder(codigoSeguimiento).findNext();
          
          // Si se encuentra el código de seguimiento
          if (codigoSeguimientoRange) {
            // Obtener la fila correspondiente en la hoja "Solicitudes Generales"
            let filaSolicitudesGenerales = codigoSeguimientoRange.getRow();
            
            // Escribir el valor de la orden de compra en la columna 11 correspondiente en la hoja "Solicitudes Generales"
            solicitudesGenerales.getRange(filaSolicitudesGenerales, 25).setValue(ordenCompra);



            }      }




















          }
        }
      }




  if (e.source.getActiveSheet().getName() == "Facturacion") {
    // Verificar si la columna editada es E (columna 5)
    if (e.range.getColumn() == 8) {
      // Verificar si la celda editada es un checkbox
      if (e.value == "TRUE") {
        // Si la celda editada es el checkbox, mostrar un diálogo para ingresar el número de orden de compra
        let ordenCompra = Browser.inputBox("Agregar fecha de orden de compra");
        if (ordenCompra) { // Si se ingresó un valor de orden de compra

          // Obtener la fila editada
          let fila = e.range.getRow();
          
          // Obtener el número de seguimiento en la columna A de la misma fila
          let codigoSeguimiento = e.source.getRange("A" + fila).getValue();


           // Obtener la referencia al archivo
        let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192")
      
        // Obtener la hoja en la que deseas escribir
        let hoja = archivo.getSheetByName("2023");

          
          // Obtener la hoja "Solicitudes Generales"
          let solicitudesGenerales = hoja

          
          // Buscar el código de seguimiento en la columna A de la hoja "Solicitudes Generales"
          let codigoSeguimientoRange = solicitudesGenerales.getRange("A:A").createTextFinder(codigoSeguimiento).findNext();
          
          // Si se encuentra el código de seguimiento
          if (codigoSeguimientoRange) {
            // Obtener la fila correspondiente en la hoja "Solicitudes Generales"
            let filaSolicitudesGenerales = codigoSeguimientoRange.getRow();
            
            // Escribir el valor de la orden de compra en la columna 11 correspondiente en la hoja "Solicitudes Generales"
            solicitudesGenerales.getRange(filaSolicitudesGenerales, 26).setValue(ordenCompra);



    
          }
        }
      }
    }




      if (e.range.getColumn() == 19) {

        let range = e.range;

           if (e.value == "TRUE") {

                  let sheet = range.getSheet();
                  let row = range.getRow();
                  sheet.getRange(row, 20).setValue(new Date());

           }




         }








 }




  if (e.source.getActiveSheet().getName() == "Facturacion") {
    // Verificar si la columna editada es E (columna 5)
    if (e.range.getColumn() == 12) {
      // Verificar si la celda editada es un checkbox
      if (e.value == "TRUE") {
        // Si la celda editada es el checkbox, mostrar un diálogo para ingresar el número de orden de compra
        let ordenCompra = Browser.inputBox("Agregar fecha de facturacion");
        if (ordenCompra) { // Si se ingresó un valor de orden de compra

          // Obtener la fila editada
          let fila = e.range.getRow();
          
          // Obtener el número de seguimiento en la columna A de la misma fila
          let codigoSeguimiento = e.source.getRange("A" + fila).getValue();


           // Obtener la referencia al archivo
        let archivo = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1O-1G0AOfWDIYXZhOMFLcUGwX3BAuKTz56sjT_sgMdOo/edit#gid=231057192")
      
        // Obtener la hoja en la que deseas escribir
        let hoja = archivo.getSheetByName("2023");

          
          // Obtener la hoja "Solicitudes Generales"
          let solicitudesGenerales = hoja

          
          // Buscar el código de seguimiento en la columna A de la hoja "Solicitudes Generales"
          let codigoSeguimientoRange = solicitudesGenerales.getRange("A:A").createTextFinder(codigoSeguimiento).findNext();
          
          // Si se encuentra el código de seguimiento
          if (codigoSeguimientoRange) {
            // Obtener la fila correspondiente en la hoja "Solicitudes Generales"
            let filaSolicitudesGenerales = codigoSeguimientoRange.getRow();
            
            // Escribir el valor de la orden de compra en la columna 11 correspondiente en la hoja "Solicitudes Generales"
            solicitudesGenerales.getRange(filaSolicitudesGenerales, 27).setValue(ordenCompra);



    
           }
        }
      }
    }
 }



  





  }




























































//tomado de : https://gist.github.com/alfchee/e563340276f89b22042a

//*************************************************************/

// NumeroALetras

// The MIT License (MIT)

// 

// Copyright (c) 2015 Luis Alfredo Chee 

// 

// Permission is hereby granted, free of charge, to any person obtaining a copy

// of this software and associated documentation files (the "Software"), to deal

// in the Software without restriction, including without limitation the rights

// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell

// copies of the Software, and to permit persons to whom the Software is

// furnished to do so, subject to the following conditions:

// 

// The above copyright notice and this permission notice shall be included in all

// copies or substantial portions of the Software.

// 

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR

// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,

// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE

// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER

// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,

// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE

// SOFTWARE.

// 

// @author Rodolfo Carmona

// @contributor Jean (jpbadoino@gmail.com)

/*************************************************************/



function Unidades(num){



    switch(num)

    {

        case 1: return "UN";

        case 2: return "DOS";

        case 3: return "TRES";

        case 4: return "CUATRO";

        case 5: return "CINCO";

        case 6: return "SEIS";

        case 7: return "SIETE";

        case 8: return "OCHO";

        case 9: return "NUEVE";

    }



    return "";

}//Unidades()



function Decenas(num){



    decena = Math.floor(num/10);

    unidad = num - (decena * 10);



    switch(decena)

    {

        case 1:

            switch(unidad)

            {

                case 0: return "DIEZ";

                case 1: return "ONCE";

                case 2: return "DOCE";

                case 3: return "TRECE";

                case 4: return "CATORCE";

                case 5: return "QUINCE";

                default: return "DIECI" + Unidades(unidad);

            }

        case 2:

            switch(unidad)

            {

                case 0: return "VEINTE";

                default: return "VEINTI" + Unidades(unidad);

            }

        case 3: return DecenasY("TREINTA", unidad);

        case 4: return DecenasY("CUARENTA", unidad);

        case 5: return DecenasY("CINCUENTA", unidad);

        case 6: return DecenasY("SESENTA", unidad);

        case 7: return DecenasY("SETENTA", unidad);

        case 8: return DecenasY("OCHENTA", unidad);

        case 9: return DecenasY("NOVENTA", unidad);

        case 0: return Unidades(unidad);

    }

}//Unidades()



function DecenasY(strSin, numUnidades) {

    if (numUnidades > 0)

    return strSin + " Y " + Unidades(numUnidades)



    return strSin;

}//DecenasY()



function Centenas(num) {

    centenas = Math.floor(num / 100);

    decenas = num - (centenas * 100);



    switch(centenas)

    {

        case 1:

            if (decenas > 0)

                return "CIENTO " + Decenas(decenas);

            return "CIEN";

        case 2: return "DOSCIENTOS " + Decenas(decenas);

        case 3: return "TRESCIENTOS " + Decenas(decenas);

        case 4: return "CUATROCIENTOS " + Decenas(decenas);

        case 5: return "QUINIENTOS " + Decenas(decenas);

        case 6: return "SEISCIENTOS " + Decenas(decenas);

        case 7: return "SETECIENTOS " + Decenas(decenas);

        case 8: return "OCHOCIENTOS " + Decenas(decenas);

        case 9: return "NOVECIENTOS " + Decenas(decenas);

    }



    return Decenas(decenas);

}//Centenas()



function Seccion(num, divisor, strSingular, strPlural) {

    cientos = Math.floor(num / divisor)

    resto = num - (cientos * divisor)



    letras = "";



    if (cientos > 0)

        if (cientos > 1)

            letras = Centenas(cientos) + " " + strPlural;

        else

            letras = strSingular;



    if (resto > 0)

        letras += "";



    return letras;

}//Seccion()



function Miles(num) {

    divisor = 1000;

    cientos = Math.floor(num / divisor)

    resto = num - (cientos * divisor)



    strMiles = Seccion(num, divisor, "UN MIL", "MIL");

    strCentenas = Centenas(resto);



    if(strMiles == "")

        return strCentenas;



    return strMiles + " " + strCentenas;

}//Miles()



function Millones(num) {

    divisor = 1000000;

    cientos = Math.floor(num / divisor)

    resto = num - (cientos * divisor)



    strMillones = Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");

    strMiles = Miles(resto);



    if(strMillones == "")

        return strMiles;



    return strMillones + " " + strMiles;

}//Millones()



function NumeroALetras(num) {

    var data = {

        numero: num,

        enteros: Math.floor(num),

        centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),

        letrasCentavos: "",

        letrasMonedaPlural: 'PESOS',//Córdobas, "PESOS", 'Dólares', 'Bolívares', 'etcs'

        letrasMonedaSingular: 'PESO', //Córdoba, "PESO", 'Dólar', 'Bolivar', 'etc'



        letrasMonedaCentavoPlural: "CENTAVOS",

        letrasMonedaCentavoSingular: "CENTAVO"

    };



    if (data.centavos > 0) {

        data.letrasCentavos = "CON " + (function (){

            if (data.centavos == 1)

                return Millones(data.centavos) + " " + data.letrasMonedaCentavoSingular;

            else

                return Millones(data.centavos) + " " + data.letrasMonedaCentavoPlural;

            })();

    };



    if(data.enteros == 0)

        return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;

    if (data.enteros == 1)

        return Millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;

    else

        return Millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;

}//NumeroALetras() 


