import { readFile } from 'fs/promises';

const file = await readFile('./JSON/productos.json', 'utf-8');
const file2 = await readFile('./JSON/usuarios.json', 'utf-8');
const file3 = await readFile('./JSON/ventas.json', 'utf-8');
const motos= JSON.parse(file);
const usuarios= JSON.parse(file2);
const ventas= JSON.parse(file3);
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

//Muestra detalle de venta y todos los datos
const get_detalleVenta=(id) =>{
    let venta= ventas.find(e => e.id_venta == id);    
    let filtro_producto= venta.productos.map(e =>
    { 
        let prod= motos.find(p=> p.id_producto == e.id_producto);
        return {
            marca: prod.marca,
            descripcion: prod.descripcion,
            cantidad: e.cantidad                         
        };
    });
    let total = venta.productos.reduce((sum, p) => sum + p.subtotal, 0);
    let cliente = usuarios.find(u => u.id_cliente == venta.id_cliente);
    let filtro_cliente = {
        nombre: cliente.Nombre, 
        apellido: cliente.Apellido 
    };
    return {
        fecha: venta.fecha,
        cliente: filtro_cliente,
        productos: filtro_producto,
        Total: total
    };   
}
console.log("DETALLE DE VENTAA")
console.log(get_detalleVenta(2))
