
//ubicamos el archivo y el nombre del a hoja de calculo para buscar los valores 
let hoja2 = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=985866588");//indicamos el archivo
const formulario2 = hoja2.getSheetByName("PEDIDOS INTERNOS"); //indicamos el nombre del archivo






function sendConfirmationEmail2(e) {
  
 try {
    agregarFolioRegistro2();
    PasarDatos2();
  } catch (error) {
    console.error("Error en agregarFolioRegistro2: " + error);
  }

  
//valores de casilla utilisados al mail 
const valores2 = formulario2.getLastRow() //guardamos la ultima celda en valores
//especificamos que columna toma el ultimo valor 
let nombre2 = formulario2.getRange(valores2, 7).getValue(); //Ultima celda valor Columna 5
let ri = formulario2.getRange(valores2, 4).getValue(); // Ultima celda valor 2
let comentarios2 = formulario2.getRange(valores2, 10).getValue(); //ultima celda valor 6
let registro2 =formulario2.getRange(valores2, 1).getValue(); //ultima celda valor 1
let mail = formulario2.getRange(valores2, 3).getValue(); //ultima celda valor 1
let vale2 = formulario2.getRange(valores2 ,9).getValue();
let presupuesto2 = formulario2.getRange(valores2,11).getValue();


  //let valeUrl = DriveApp.getFilesByName(vale2).next();

  //let blob1 = valeUrl.getBlob();
 //let contenidoUrl = valeUrl.getContent();

 //let blob = Utilities.newBlob(contenidoUrl, 'application/pdf', 'valename.pdf');

//let archivado = [blob1]




 let recipient2 = mail; // Cambia esto por la dirección de correo que quieras corregir

if (recipient2.toLowerCase().includes("depo") || recipient2.toLowerCase().includes("talleres")) {
  // Reemplazar las palabras o letras y corregir el correo
  recipient2 = "depositotalleres@bahiablanca.gov.ar";
}

console.log(recipient2); // Esto imprimirá la dirección de correo corregida o la original si no necesitaba corrección

  const subject2 = `Registro número ${registro2}`;

  const emailcomun2 = "asdasd"

  const body2 = `<p> se  registro la solicitud del servicio para la oficina <strong>${nombre2}</strong></p>
		<p>su numero de seguimiento es: <span style="color: green;font-size: 40px";><strong>${registro2}</strong></span></p>
		<p>Tu Solicitud fue:<br> ${comentarios2}</p>
    <p>Para el Ri: ${ri}</p>
    <p>Vale Cargado: ${vale2}</p>
    <p>Presupuesto Cargado: ${presupuesto2}</p>
		<p>Gracias.</p>
		<p>Atentamente,<br /> <img src="data:image/png;base64,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" height="150" /><br />
		<em>Direccion de talleres</em></p>`
	;


  //       let optsAvanzadas2 = {
  //attachments: archivado
//};   

       let optsAvanzadas2 = {name: "Direccion de talleres BHI", htmlBody: body2};    



  GmailApp.sendEmail(recipient2, subject2, emailcomun2,optsAvanzadas2);
  

  
 

}


// ${e.response.getEditResponseUrl()};




function agregarFolioRegistro2() {
 


   // Obtiene la hoja donde se guardan las respuestas
       const hoja2 = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=985866588");
       const es2 = hoja2.getSheetByName("PEDIDOS INTERNOS");
    let renglon2 = es2.getLastRow();
    // Establece el número de registro, que es el número de renglón - 1, considerando el renglón de las cabeceras
    let registro2 = renglon2 - 1;
    // Puedes combinarlo con texto si así lo quieres o solamente registrar el número, aquí lo combino con texto,
    // para que quede como ABC-0123, con mínimo 4 dígitos, con ceros a la izquierda.
    let folioRegistro2 = `PIB-${Utilities.formatString("%04d", registro2)}-26`;
    // Escribe el número de registro en la celda especificada
    // IMPORTANTE: Cambia el número 4 por el número de la columna donde lo vayas a escribir (A=1, B=2, C=3, D=4, etc.)
    es2.getRange(renglon2, 1).setValue(folioRegistro2);
    // Regresa el número de folio
    return folioRegistro2;

}



//hoja Pedidos internos
function PasarDatos2() {


let hoja2 = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=985866588");//indicamos el archivo
const formulario2 = hoja2.getSheetByName("PEDIDOS INTERNOS");
 
 let ultimacelda2 = formulario2.getLastRow() 
 
  let id2 = formulario2.getRange(ultimacelda2,1).getValue()
  let fecharecibida2 =formulario2.getRange(ultimacelda2,2).getValue()
  let email2 =formulario2.getRange(ultimacelda2,3).getValue()
  let ri2 = formulario2.getRange(ultimacelda2,4).getValue()
  let fechavale2 = formulario2.getRange(ultimacelda2,5).getValue()
  let seccion = formulario2.getRange(ultimacelda2,7).getValue()
  let observaciones2 = formulario2.getRange(ultimacelda2,8).getValue()
  let vale = formulario2.getRange(ultimacelda2,9).getValue()
  let detalle2 = formulario2.getRange(ultimacelda2,10).getValue()
  let presupuesto2 =formulario2.getRange(ultimacelda2,11).getValue()
  let fechapresupuesto2 =formulario2.getRange(ultimacelda2,12).getValue()
  let NumeroOt =formulario2.getRange(ultimacelda2,13).getValue()
  let Numerovale = formulario2.getRange(ultimacelda2,6).getValue()



 

    
  let solucitudesgenerales2 =SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1d3FZ11SDTQV95chadTbErnGzrgAvhkvOPqam9qZ8cLo/edit#gid=2129160541");
  let solicitudes2 = solucitudesgenerales2.getSheetByName("Solicitudes Generales");
  //let ultimaceldaS2 = solicitudes2.getLastRow() + 1
  let dataColumn = solicitudes2.getRange("A:A").getValues();
  let ultimaceldaS2 = dataColumn.filter(String).length + 2;

  let checkbox2=SpreadsheetApp.newDataValidation().requireCheckbox().setAllowInvalid(false).build();
    //valores creados
  let valemodificado;
  let presupuestoModificado2;

   
    valemodificado = CortalinkSalto(vale)
    presupuestoModificado2 = CortalinkSalto(presupuesto2)

    let enviarmails = SpreadsheetApp.newDataValidation().requireValueInList(["solo al mail","mail y delegaciones"]).build();
   let casilla = solicitudes2.getRange(ultimaceldaS2,7).setDataValidation(enviarmails);

   let rechazarmails = SpreadsheetApp.newDataValidation().requireValueInList(["Falta Memo" ,"Falta Presupuesto","Motivo Escrito"]).build();
   let casilla11 = solicitudes2.getRange(ultimaceldaS2,10).setDataValidation(rechazarmails);

 
   

    solicitudes2.getRange(ultimaceldaS2,1).setValue(id2);
    solicitudes2.getRange(ultimaceldaS2,2).setValue(fecharecibida2);
    solicitudes2.getRange(ultimaceldaS2,3).setValue(ri2);
    solicitudes2.getRange(ultimaceldaS2,4).setValue(valemodificado);
    solicitudes2.getRange(ultimaceldaS2,5).setValue(presupuestoModificado2);
    solicitudes2.getRange(ultimaceldaS2, 6).setDataValidation(checkbox2).setValue(false);
    //solicitudes2.getRange(ultimaceldaS2,7).setValue("pase fisico2");
    solicitudes2.getRange(ultimaceldaS2,8).setValue("Pendiente");
    //solicitudes2.getRange(ultimaceldaS2,9).setValue("casilla2");
    //solicitudes2.getRange(ultimaceldaS2,10).setValue("Pendiente");
    solicitudes2.getRange(ultimaceldaS2,11).setValue("Pendiente");
    solicitudes2.getRange(ultimaceldaS2,12).setValue(seccion);
    solicitudes2.getRange(ultimaceldaS2,13).setValue(detalle2);
    solicitudes2.getRange(ultimaceldaS2,14).setValue(observaciones2);
    solicitudes2.getRange(ultimaceldaS2,15).setValue("comentarios2");
    solicitudes2.getRange(ultimaceldaS2,17).setValue(email2);
    solicitudes2.getRange(ultimaceldaS2,33).setValue(fechavale2);
    solicitudes2.getRange(ultimaceldaS2,34).setValue(fechapresupuesto2);
    solicitudes2.getRange(ultimacelda2,36).setValue(Numerovale);
    solicitudes2.getRange(ultimacelda2,37).setValue(NumeroOt);
    



  //Creo el chex box en la ultima linea en el renglon 16 (renglon,16) con el valor en falso , sin tilde , (setvalue false)
 


  //returna checkbox;
};




//acorta y saltea los links
function CortalinkSalto (link) {
//Ultimo valor agregado
const valores = formulario.getLastRow() //guardamos la ultima celda en valores
//especificamos que columna toma el ultimo valor 

let email = link

let i ;
let coma ;
let letraFinal;
let generadorURl = "";
let guardalink = [];


 //generadorURl = generadorURl + email[i + 1]
for (i = 0 ; i <= email.length ; i + 1) {
  
  coma = email[i]
  letraFinal= email.length
  if(coma === "," || letraFinal === i) {
  guardalink.push(generadorURl)
  generadorURl = ""

  }

  if (email[i] !== " " && email[i] !== ",") {
  generadorURl = generadorURl + email[i];
   
  }
  
  i = i + 1
 
}

let arrayacortado = []
guardalink.forEach(element => arrayacortado.push(acortar(element)))

let acortado = arrayacortado.join("\n");

return acortado; 

}



function acortar(vale) {
url = vale;
    url='http://tinyurl.com/api-create.php?url='+url;
    let response = UrlFetchApp.fetch(url,{muteHttpExceptions:true});
    let valemodificado = response.getContentText()
    return valemodificado
};




function completarNumeros() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("pedidos internos");
  const range = sheet.getRange("A:A");
  const values = range.getValues();

  const numerosExistentes = obtenerNumerosExistentes(values);
  const numerosFaltantes = encontrarNumerosFaltantes(numerosExistentes);

  if (numerosFaltantes.length > 0) {
    llenarHuecosConNumeros(sheet, values, numerosFaltantes);
  }
}

function obtenerNumerosExistentes(values) {
  const numeros = [];
  values.forEach(row => {
    const value = row[0];
    if (value && value.trim().match(/^PIB-(\d+)-24$/)) {
      const numero = parseInt(value.trim().match(/^PIB-(\d+)-24$/)[1], 10);
      numeros.push(numero);
    }
  });
  return numeros;
}

function encontrarNumerosFaltantes(numerosExistentes) {
  const numerosFaltantes = [];
  const maxNumero = Math.max(...numerosExistentes);
  for (let i = 1; i <= maxNumero; i++) {
    if (!numerosExistentes.includes(i)) {
      numerosFaltantes.push(i);
    }
  }
  return numerosFaltantes;
}

function llenarHuecosConNumeros(sheet, values, numerosFaltantes) {
  let numeroIndex = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i][0];
    if (!value || !value.trim().match(/^PIB-(\d+)-24$/)) {
      if (numeroIndex < numerosFaltantes.length) {
        sheet.getRange(i + 1, 1).setValue(`PIB-${numerosFaltantes[numeroIndex]}-24`);
        numeroIndex++;
      } else {
        break;
      }
    }
  }
}


















