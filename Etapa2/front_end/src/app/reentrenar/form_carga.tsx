"use client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import {
  convertirCSVaJSON,
  verificarValidezJSON,
  verificarValidezCSV,
  verificarTipoArchivo,
  numeroAPorcentaje,
} from "@/services/utils";

import { postReentrenar } from "@/services/api";

type FileAccepted = {
  file: File | null;
  tipo: "csv" | "json" | null;
};

type Metricas = {
  precision: number;
  recall: number;
  f1: number;
};

type OpinionODSDataSet = {
  data: { text: string; ods: number }[];
};

export default function FormCarga() {
  const [file, setFile] = useState<FileAccepted>({ file: null, tipo: null });
  const [fileState, setFileState] = useState<string>("no cargado");
  const [error, setError] = useState<string | null>(null);
  // Estados permitidos: "completado", "Cargando",  "Error del servidor", "Respuesta invalida"
  const [estadoReentrenamiento, setEstadoReentrenamiento] =
    useState("no cargadas");
  const [metricas, setMetricas] = useState<Metricas | null>(null);

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
      verificarValidezCSV(file, "reentrenamiento")
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
      verificarValidezJSON(file, "reentrenamiento")
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

    setEstadoReentrenamiento("cargando");

    if (tipo === "csv") {
      convertirCSVaJSON(archivo, "reentrenamiento")
        .then((json) => {
          const final : OpinionODSDataSet = json as OpinionODSDataSet;
          console.log(final)
          postReentrenar(final)
            .then((response) => {
              setEstadoReentrenamiento("completado");
              const data: Metricas = response;
              setMetricas(data);
              removeFile();
            })
            .catch((error) => {
              cambiarEstadoArchivo("error", null, error, null, true);
            });
        })
        .catch((error) => {
          setEstadoReentrenamiento("error");
        });
    } else if (tipo === "json") {
      const json: OpinionODSDataSet = JSON.parse(await archivo.text());
      console.log(json)
      postReentrenar(json)
        .then((response) => {
          setEstadoReentrenamiento("completado");
          const data: Metricas = response;
          setMetricas(data);
          removeFile();
        })
        .catch((error) => {
          cambiarEstadoArchivo("error", null, error, null, true);
        });
    }
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
          Si el archivo es un CSV debe tener dos columnas llamadas{" "}
          <span className="font-bold">"text"</span> y{" "}
          <span className="font-bold">"ods"</span>.
        </p>
        <p className="text-[#091057] font-semibold">
          Si el archivo es un JSON debe tener una unica propiedad llamada{" "}
          <span className="font-bold">"data"</span>, la cual es una lista de
          objetos, cada objeto debe tener las propiedades{" "}
          <span className="font-bold">"text"</span> y{" "}
          <span className="font-bold">"ods"</span>.
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

      <div className="flex gap-4 py-4">
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
            file.file === null ? "bg-opacity-50 cursor-not-allowed" : ""
          )}
          onClick={handleEnviarArchivo}
        >
          Reentrenar
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
        estadoReentrenamiento === "cargando" && (
          <p className="font-semibold">
            Reentrenando modelo, por favor espere...
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
        // Si el archivo está cargando, mostrarlo
        estadoReentrenamiento === "completado" && metricas !== null && (
          <>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold py-2 text-green-600">
              Reentrenamiento de modelo completado
            </h1>
            <p className="font-semibold">
              El modelo ha sido reentrenado exitosamente.
            </p>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold py-2 text-[#091057]">
              Metricas del modelo
            </h1>
            <div className=" flex flex-col gap-1">
              <p className="font-semibold">
                Precision: {numeroAPorcentaje(metricas.precision)}
              </p>
              <p className="font-semibold">
                Recall: {numeroAPorcentaje(metricas.recall)}
              </p>
              <p className="font-semibold">
                F1: {numeroAPorcentaje(metricas.f1)}
              </p>
            </div>
          </>
        )
      }
    </div>
  );
}
