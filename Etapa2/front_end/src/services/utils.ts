export const convertirCSVaJSON = async (file:File) => {
  // Convertir CSV con columna "data" a JSON con una propiedad "data" que es un array de string, donde cada string es una fila del CSV
  const reader = new FileReader();

  return new Promise((resolve, reject) => {

    if (file.type !== "text/csv") {
      reject("El archivo debe ser de tipo CSV");
    }
    reader.onload = (e) => {
      const contenido = e.target?.result as string;
      const lineas = contenido.split("\n");
      const data = lineas.slice(1).map((linea) => linea.trim());
      resolve({ data: data });
    };
    reader.readAsText(file);
  });
  
  
};
