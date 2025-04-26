import { readFile, writeFile } from 'fs/promises';
const usersJson = await readFile('./JSON/usuarios.json', 'utf-8');
const users= JSON.parse(usersJson);
//Obtiene la ultima Id de usuario y suma 1
export const getUltId= ()=> {    
    const maxId = Math.max(...users.map(u => u.id_cliente));
    return maxId + 1;
};
