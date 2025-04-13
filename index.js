import { readFile } from 'fs/promises';

const file = await readFile('./JSON/productos.json', 'utf-8');
const motos= JSON.parse(file);
//console.log(motos);
console.log("MOTO 2")
console.log(motos[2].marca)

//Nombre de todas las motos que sean de una marca especifica
const get_marca= (marca)=> {
    let filtro_marca = motos.filter(e =>e.marca == marca); //Filtra por marca    
    filtro_marca=filtro_marca.map(e=>e.descripcion); //Devuelve solo la descripcion
    return filtro_marca;
}

const get_Arraymarca= (marca)=> {
    let res= [];
    let filtro_marca = motos.filter(e =>e.marca == marca); //Filtra por marca    
    filtro_marca.forEach(e => {
        res.push({modelo: e.descripcion})
    });
    return res; //Devuelve un arreglo
}

console.log(get_marca("Corven"))
console.log(get_Arraymarca("Honda"))

//Todas las motos que valgan menos de 15000
const get_ArrayValor= ()=> {
    let res= [];
    let filtro_marca = motos.filter(e =>e.precio < 15000); //Filtra por marca    
    filtro_marca.forEach(e => {
        res.push({modelo: e.descripcion,
                precio: e.precio
        })
    });
    return res; //Devuelve un arreglo
}
console.log(get_ArrayValor())

//Todas las motos en un rango de precio
const get_rango = (min,max)=>{
    let rango_precio= motos.filter(e => e.precio >=min && e.precio<=max) 
    return rango_precio
}
console.log("RANGO DE PRECIOS")
console.log(get_rango(30000,120000))
