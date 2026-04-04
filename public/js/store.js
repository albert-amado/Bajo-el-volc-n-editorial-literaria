// Variables globales compartidas
export let todosLosLibros = [];
export let todosLosAutores = [];

export function setLibros(libros) {
  todosLosLibros = libros;
}

export function setAutores(autores) {
  todosLosAutores = autores;
}