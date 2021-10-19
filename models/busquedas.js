const fs = require('fs');

const axios = require('axios');

class Busquedas {
    historial = [];
    dbPath = './bd/database.json';

    constructor() {
        this.leerBd();
    }
    get historialCapitalizado()  {

        return this.historial.map( lugar => {
            let palabras = lugar.split( ' ' );
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join( ' ' );
        })
    }

    get paramsMapbox() {
        return{
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWheather() {
        return {
           appid : process.env.OPENWEATHER_KEY,
           language: 'es',
           units: 'metric'
        }
    }

    async ciudad( lugar = '' ) {

try {
   //petición http
      const instance = axios.create({
        
         baseURL:`https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
          params: this.paramsMapbox
      });

      const resp = await instance.get();

   return resp.data.features.map( lugar => ({
       id: lugar.id,
       nombre: lugar.place_name,
       lng: lugar.center[0],
       lat: lugar.center[1],
   }));

} catch (error) {
    return [];
}
     
    }

   
    async climaLugar (lat, lon ) {

        try{

            // instance axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
               params: { ...this.paramsWheather, lat, lon }
            })

            // resp.data
            const resp = await instance.get();
           const {weather, main } = resp.data;

           return  {
            desc: weather[0].description,
            min: main.temp_min,
            max: main.temp_max,
            temp: main.temp
           }

        }catch (error) {
            console.log(error);

        }
    }

    agregarHistorial ( lugar = ' ') {
       
        if( this.historial.includes( lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial = this.historial.splice(0, 5);
        this.historial.unshift( lugar.toLocaleLowerCase() );

        this.guardarDB();

    }


    guardarDB() {
        const playload = {
            historial: this.historial
        };
        fs.writeFileSync( this.dbPath, JSON.stringify( playload ));
    }

    leerBd() {

        if ( !fs.existsSync( this.dbPath ) ) return;
        const info = fs.readFileSync ( this.dbPath, { encoding: 'utf-8'} );
        const data = JSON.parse( info );

        this.historial = data.historial;
    }

}


module.exports = Busquedas;