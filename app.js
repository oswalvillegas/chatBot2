const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


//solisitar archivos
const path = require("path");
const fs = require("fs");
//menu
const menuPath = path.join(__dirname,"mensajes","menu.txt");
const menu = fs.readFileSync(menuPath,"utf8");

//forma de pagos
const pagoPath = path.join(__dirname,"mensajes","pagos.txt");
const metodosPagos = fs.readFileSync(pagoPath,"utf8");
const arrayPagos = metodosPagos.split(',');
//Planes
const panPath = path.join(__dirname,"mensajes","planes.txt");
const planes = fs.readFileSync(panPath,"utf8");
const arrayPlanes = planes.split(',');



process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});


//función para el precio del dolar
const axios = require("axios");
var precioEnBs =0;
//https://v6.exchangerate-api.com/v6/5af75fe4b9d3575b0d69b224/latest/USD
async function obtenerPrecioDolar() {
  try {
    const response = await axios.get("https://open.er-api.com/v6/latest/USD");
    const precios = response.data.rates;
    precioEnBs = precios.VES; // Ejemplo para Peso Mexicano (MXN)
    console.log("Precio actual dólar a Bolivares:", precioEnBs);
  } catch (error) {
    console.error("Error al obtener precio del dólar:", error);
  }
}

obtenerPrecioDolar();





//mensaje de bienvenida
var bienvenida = '🙌¡Hola! Bienvenid@ al área administrativa de Boom Solutions.';
var hola=['hola', 'buenas', 'buenos'];


const salir = addKeyword(EVENTS.ACTION)//menu principal
  .addAnswer(['Bot de administración desconectado. ¡Que tengas un buen día! 👋🏻',
    'Cuando quieras volver, solo escribe "Boom"'
  ])


const menuPrincipal = addKeyword([EVENTS.ACTION,'boom'])//menu principal
  .addAnswer(menu,
    { capture: true },
    async (ctx, {fallBack, gotoFlow, flowDynamic }) => {  // <- async agregado 
        if (!['1', '2', '3', '0'].includes(ctx.body)) {


          return fallBack("❗  Por favor, envía solo una de las opciones mencionadas: 1, 2, 3 o 0");
        }

        switch(ctx.body){
            case '1':
               return gotoFlow(saldo);//dar saldo al cliente
                

  case '2':
               return gotoFlow(pagos);//métodos de pagos

  case '3':
               return gotoFlow(asesor);//cuentas disponibles para cancelar
               
    case '0':
               return gotoFlow(salir);//salir del Bot
  

        }

    
    }
  );




//consulta de saldo
const pagos = addKeyword(EVENTS.ACTION)
 .addAnswer(arrayPagos[0],//lista de formas de pagos

 { capture: true },
    async (ctx, {fallBack, gotoFlow, flowDynamic }) => {  // <- async agregado 
        if (!['1', '2', '3', '4','0'].includes(ctx.body)) {


          return fallBack("❗  Por favor, envía solo una de las opciones mencionadas: 1, 2, 3, 4 o 0");
        }else{
              switch(ctx.body){
            case '1':
               return fallBack(arrayPagos[1].trim());//Cuenta Zelle
                

            case '2':
               return fallBack(arrayPagos[2].trim());//Cuenta Binance

            case '3':
              return fallBack(arrayPagos[4].trim());//transferencia

            case '4':
               
                return fallBack(arrayPagos[3].trim());//transferencia
             case '0':
               return gotoFlow(menuPrincipal);//menu primcipal

} 


        }

         

})




var nombre='';
const asesor = addKeyword(EVENTS.ACTION)
.addAnswer('Ingrese sus datos')
  .addAnswer('Nombre:', { capture: true }, async (ctx, { state }) => {
    nombre = ctx.body;
    await state.update({ nombre: ctx.body});

  })
  .addAnswer('Ingrese sus datos')
  .addAnswer('Cédula:', { capture: true }, async (ctx, { state }) => {
    cedula = ctx.body;
    await state.update({ cedula: ctx.body});

  })
  .addAnswer('Razón de su solicitud:', { capture: true }, async (ctx, { state, flowDynamic, fallBack, gotoFlow,  endFlow}) => {
    await state.update({ razon: ctx.body });
    const data = await state.getMyState();
    
    if(['n','N'].includes(ctx.body)){

      return gotoFlow(asesor);


    }else if (['s','S'].includes(ctx.body)) {
      return endFlow(`Gracias ${data.nombre}, He registrado su solicitud. Te atenderemos en la brevedad posible`);
    }
    
    
    
    
    
return fallBack(`Verifique sus datos:
*Nombre:* ${data.nombre}
*Cédula:* ${data.cedula}
*Razón:* ${data.razon}
*ingrese: S o N*`);
  })

//saldo del cliente
const saldo = addKeyword(EVENTS.ACTION)
  .addAnswer(arrayPlanes[0],
    { capture: true },
    async (ctx, {fallBack, gotoFlow, flowDynamic }) => {  // <- async agregado 
        if (!['1', '2', '3', '4','0'].includes(ctx.body)) {


          return fallBack("❗  Por favor, envía solo una de las opciones mencionadas: 1, 2, 3, 4 o 0");
        }

        switch(ctx.body){
            case '1':
                var bolivares= arrayPlanes[1].trim() * precioEnBs;
               return fallBack(arrayPlanes[1].trim()+' Dolares\n'+bolivares.toFixed(2)+' Bolivares\n'+arrayPlanes[5].trim());//plan Megas
                

            case '2':
                var bolivares= arrayPlanes[2].trim() * precioEnBs;
               return fallBack(arrayPlanes[2].trim()+' Dolares\n'+bolivares.toFixed(2)+' Bolivares\n'+arrayPlanes[5].trim());//Plan Ultra

            case '3':
                var bolivares= arrayPlanes[3].trim() * precioEnBs;
              return fallBack(arrayPlanes[3].trim()+' Dolares\n'+bolivares.toFixed(2)+' Bolivares\n'+arrayPlanes[5].trim());//Plan Premiun

            case '4':
                var bolivares= arrayPlanes[4].trim() * precioEnBs;
               return fallBack(arrayPlanes[4].trim()+' Dolares\n'+bolivares.toFixed(2)+' Bolivares\n'+arrayPlanes[5].trim());//Plan Platino
            case '0':
               return gotoFlow(menuPrincipal);//menu primcipal
  

        }

    
    })



//flojo principal
const flowPrincipal = addKeyword(hola)
  .addAnswer(bienvenida)
  .addAnswer(
   menu,
    { capture: true },
    async (ctx, {fallBack, gotoFlow, flowDynamic }) => {  // <- async agregado 
        if (!['1', '2', '3', '0'].includes(ctx.body)) {


          return fallBack("❗  Por favor, envía solo una de las opciones mencionadas: 1, 2, 3 o 0");
        }

        switch(ctx.body){
            case '1':
               return gotoFlow(saldo);//dar saldo al cliente
                

  case '2':
               return gotoFlow(pagos);//métodos de pagos

  case '3':
               return gotoFlow(asesor);//cuentas disponibles para cancelar
  case '0':
               return gotoFlow(salir);//salir del Bot
  

        }

    
    }
  );


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, saldo, pagos, asesor, menuPrincipal, salir])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb({port:8001})
}

main()
