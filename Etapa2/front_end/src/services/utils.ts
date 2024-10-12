type OpinionDataSet = {
  data: string[];
};

// el formato es un json con una lista de objetos de esta forma {text: string, ods: number}
type OpinionODSDataSet = {
  data: { text: string; ods: number }[];
};

export const convertirCSVaJSON = async (file: File, tipo: string) => {
  // Convertir CSV con columna "data" a JSON con una propiedad "data" que es un array de string, donde cada string es una fila del CSV
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const contenido = e.target?.result as string;
      const lineas = contenido.split("\n");

      if (tipo == "prediccion") {
        const data = lineas
          .slice(1)
          .map((linea) => {
            if (linea !== "") {
              return linea.split("||")[0].trim();
            }
          })
          .filter((linea) => linea !== undefined);
        resolve({ data: data });
      }

      if (tipo == "reentrenamiento") {
        const columnas = lineas[0].split("||").map((columna) => columna.trim());
        console.log(columnas);
        const indiceOds = columnas.indexOf("ods");
        const indiceText = columnas.indexOf("text");

        // Si encuentra lineas vacias las elimina
        const data = lineas
          .slice(1)
          .map((linea) => {
            if (linea !== "") {
              const partes = linea.split("||");
              return {
                text: partes[indiceText].trim(),
                ods: parseInt(partes[indiceOds].trim()),
              };
            }
          })
          .filter((linea) => linea !== undefined);
        resolve({ data: data });
      }
    };
    reader.readAsText(file);
  });
};

export const verificarValidezJSON = async (file: File, tipo: string) => {
  // Verificar que el archivo JSON tenga una propiedad "data" que es un array de string
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    if (file.type !== "application/json") {
      reject("El archivo debe ser de tipo JSON");
    }
    reader.onload = (e) => {
      const contenido = e.target?.result as string;
      try {
        if (tipo === "prediccion") {
          const json = JSON.parse(contenido) as OpinionDataSet;
          if (!json.hasOwnProperty("data")) {
            reject(
              "El archivo JSON debe tener una propiedad llamada 'data', con una lista de textos"
            );
          }
        } else if (tipo === "reentrenamiento") {
          const json = JSON.parse(contenido) as OpinionODSDataSet;
          if (!json.hasOwnProperty("data")) {
            reject(
              "El archivo JSON debe tener una propiedad llamada 'data', con objetos que tengan las propiedades 'text' y 'ods'"
            );
          }
          if (json.data.length === 0) {
            reject("El archivo JSON está vacío");
          }
          for (const opinion of json.data) {
            if (
              !opinion.hasOwnProperty("text") ||
              !opinion.hasOwnProperty("ods")
            ) {
              reject(
                "Cada objeto del archivo JSON debe tener las propiedades 'text' y 'ods'"
              );
            }
          }
        }
        resolve("valido");
      } catch (error) {
        reject("El archivo JSON no es válido");
      }
    };
    reader.readAsText(file);
  });
};

export const verificarValidezCSV = async (file: File, tipo: string) => {
  // Verificar que el archivo CSV tenga una única columna llamada "data"
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    if (file.type !== "text/csv") {
      reject("El archivo debe ser de tipo CSV");
    }
    reader.onload = (e) => {
      const contenido = e.target?.result as string;
      const lineas = contenido.split("\n");
      const columnas = lineas[0].split("||").map((columna) => columna.trim());

      if (lineas.length <= 1) {
        reject("El archivo está vacío");
      }

      if (tipo === "prediccion") {
        if (columnas.length !== 1 || columnas[0] !== "data") {
          reject("El archivo CSV debe tener una única columna llamada 'data'");
        }
      } else if (tipo === "reentrenamiento") {
        if (
          columnas.length !== 2 ||
          columnas[0] !== "text" ||
          columnas[1] !== "ods"
        ) {
          reject(
            "El archivo CSV debe tener dos columnas llamadas 'text' y 'ods'"
          );
        }
      }
      resolve("valido");
    };
    reader.readAsText(file);
  });
};

export const verificarTipoArchivo = async (file: File) => {
  // Verificar si el archivo es de tipo CSV o JSON
  return new Promise<string>((resolve) => {
    if (file.type === "text/csv") {
      resolve("csv");
    } else if (file.type === "application/json") {
      resolve("json");
    } else {
      resolve("Formato de archivo invalido");
    }
  });
};

export const numeroAPorcentaje = (numero: number): string => {
  return (numero * 100).toFixed(1) + "%";
};

export const generarCSVPredicciones = (
  opiniones: string[],
  predicciones: { score: number; ods: number }[]
) => {
  // Generar un CSV con dos columnas: "opinion" y "ods"
  let csv = "text,ods,score\n";
  for (let i = 0; i < opiniones.length; i++) {
    csv += `${opiniones[i]},${predicciones[i].ods},${predicciones[i].score}\n`;
  }
  return csv;
};
