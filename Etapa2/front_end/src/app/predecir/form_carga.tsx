"use client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  convertirCSVaJSON,
  verificarValidezJSON,
  verificarValidezCSV,
  verificarTipoArchivo,
  generarCSVPredicciones,
} from "@/services/utils";

import { postPredecir } from "@/services/api";

type FileAccepted = {
  file: File | null;
  tipo: "csv" | "json" | null;
};

type OpinionDataSet = {
  data: string[];
};

export default function FormCarga() {
  const [file, setFile] = useState<FileAccepted>({ file: null, tipo: null });
  const [fileState, setFileState] = useState<string>("no cargado");
  const [error, setError] = useState<string | null>(null);
  // Estados permitidos: "No cargadas", "Cargando", "Cargadas", "Error del servidor", "Respuesta invalida"
  const [estadoPredicciones, setEstadoPredicciones] = useState("no cargadas");
  const [csv, setCsv] = useState<string | null>(null);

  const handleFileUpload = async (event: any) => {
    const file = event.target.files[0];
    setFileState("cargando");
    if (file === undefined) {
      cambiarEstadoArchivo(
        "error",
        null,
        "No se ha seleccionado un archivo",
        null,
        true
      );
      return;
    }
    const tipo = await verificarTipoArchivo(file);
    if (tipo !== "csv" && tipo !== "json") {
      cambiarEstadoArchivo(
        "error",
        null,
        "El archivo debe ser de tipo CSV o JSON",
        null,
        true
      );
      return;
    }

    if (tipo === "csv") {
      verificarValidezCSV(file, "prediccion")
        .then((validacion) => {
          if (validacion !== "valido") {
            cambiarEstadoArchivo("error", null, validacion, null, true);
            return;
          }
        })
        .catch((error) => {
          cambiarEstadoArchivo("error", null, error, null, true);
          return;
        });
    } else if (tipo === "json") {
      verificarValidezJSON(file, "prediccion")
        .then((validacion) => {
          if (validacion !== "valido") {
            cambiarEstadoArchivo("error", null, validacion, null, true);
            return;
          }
        })
        .catch((error) => {
          cambiarEstadoArchivo("error", null, error, null, true);
          return;
        });
    }

    cambiarEstadoArchivo("cargado", file, null, tipo, false);
    // Verificar que el archivo es CSV o JSON
  };

  const handleEnviarArchivo = async () => {
    const archivo = file.file;
    const tipo = file.tipo;

    if (estadoPredicciones === "cargando") {
      return;
    }
    if (archivo === null) {
      cambiarEstadoArchivo(
        "error",
        null,
        "No se ha seleccionado un archivo",
        null,
        true
      );
      return;
    }

    setEstadoPredicciones("cargando");

    if (tipo === "csv") {
      convertirCSVaJSON(archivo, "prediccion")
        .then((json) => {
          postPredecir(json)
            .then((response) => {
              const final = json as OpinionDataSet;
              const csv = generarCSVPredicciones(
                final.data,
                response.predicciones
              );
              setCsv(csv);
              setEstadoPredicciones("cargadas");
              removeFile();
            })
            .catch((error) => {
              cambiarEstadoArchivo("error", null, error, null, true);
            });
        })
        .catch((error) => {
          setEstadoPredicciones("error");
        });
    } else if (tipo === "json") {
      const json = JSON.parse(await archivo.text());
      postPredecir(json)
        .then((response) => {
          const final = json as OpinionDataSet;
          const csv = generarCSVPredicciones(final.data, response.predicciones);
          setCsv(csv);
          setEstadoPredicciones("cargadas");
          removeFile();
        })
        .catch((error) => {
          cambiarEstadoArchivo("error", null, error, null, true);
        });
    }
  };

  const handleDescargarCSV = () => {
    if (csv === null) {
      return;
    }
    // usar csv para descargar
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "predicciones.csv";
    a.click();
  };

  const cambiarEstadoArchivo = (
    estado: string,
    file: File | null,
    error: string | null,
    tipo: "csv" | "json" | null,
    remove: Boolean
  ) => {
    setFileState(estado);
    setError(error);
    if (file !== null) {
      setFile({ file: file, tipo: tipo });
    }
    if (remove) {
      removeFile();
    }
  };

  const removeFile = () => {
    setFile({
      file: null,
      tipo: null,
    });
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="py-8 flex flex-col gap-2 ">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold py-2">
        Cargar opiniones desde un archivo
      </h1>
      <p>
        Cargar archivo <span className="font-semibold">(CSV o JSON)</span> con
        múltiples instancias de datos para predecir.
      </p>
      <div>
        <p className="text-[#091057] font-semibold">
          Si el archivo es un CSV debe tener una unica columna llamada{" "}
          <span className="font-bold">"data"</span> con los textos.
        </p>
        <p className="text-[#091057] font-semibold">
          Si el archivo es un JSON debe tener una unica propiedad llamada{" "}
          <span className="font-bold">"data"</span> con una lista de textos.
        </p>
      </div>
      {
        // Si hay un error, mostrarlo
        error !== null && (
          <p className="text-red-500 font-semibold">
            Ha ocurrido un problema: {error}
          </p>
        )
      }

      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <label
          className={"px-8 py-4 rounded-2xl bg-[#0D92F4] text-white w-fit inline-block  ".concat(
            file.file !== null
              ? "bg-opacity-50 cursor-not-allowed "
              : "cursor-pointer"
          )}
        >
          Cargar Archivos
          <input
            type="file"
            accept=".csv, .json"
            onChange={(e) => handleFileUpload(e)}
            className="hidden"
            id="fileInput" // Agregar un id al input para poder referenciarlo
            disabled={file.file !== null}
          />
        </label>
        <button
          className={"px-8 py-4 rounded-2xl bg-green-400 text-white w-fit ".concat(
            file.file === null || estadoPredicciones === "cargando" ? "bg-opacity-50 cursor-not-allowed" : ""
          )}
          onClick={handleEnviarArchivo}
        >
          Predecir
        </button>
      </div>
      {
        // Si el archivo está cargando, mostrarlo
        fileState === "cargando" && (
          <p className="font-semibold">Cargando archivo, por favor espere...</p>
        )
      }
      {
        // Si el archivo está cargando, mostrarlo
        estadoPredicciones === "cargando" && (
          <p className="font-semibold">
            Cargando predicciones, por favor espere...
          </p>
        )
      }
      {
        // Si hay un archivo cargado, mostrarlo
        file.file !== null && error === null && (
          <div className="flex gap-4 items-center">
            <p className="font-semibold">Archivo cargado:</p>
            <p>{file.file.name}</p>
            <IoClose
              className="w-8 h-auto text-red-500 cursor-pointer"
              title="Remover archivo"
              onClick={(e) => {
                removeFile();
              }}
            />
          </div>
        )
      }
      {
        // Si las predicciones están cargadas, mostrar el botón de descarga
        estadoPredicciones === "cargadas" && (
          <div className="flex flex-col gap-2 ">
            <p className="font-semibold">
              Predicciones cargadas correctamente.
            </p>
            <button
              className="bg-[#243642] rounded-xl py-2 px-4 w-fit h-fit text-white font-semibold"
              onClick={() => {
                handleDescargarCSV();
              }}
            >
              Descargar CSV con predicciones
            </button>
          </div>
        )
      }
    </div>
  );
}
