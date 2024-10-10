"use client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { convertirCSVaJSON } from "@/services/utils";

export default function FormCarga() {
  const [validFile, setValidFile] = useState<Boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Boolean>(false);

  const handleFileUpload = async (event: any) => {
    setError(null); // Reiniciar el error al seleccionar un nuevo archivo
    setValidFile(false); // Reiniciar el estado de validez
    const file = event.target.files[0];

    // Espera a que se verifique la validez del archivo
    const isFileValid = await verificarValidezArchivo(file);

    if (isFileValid) {
      setFile(file);
      setValidFile(true);
      console.log("Archivo cargado", file);
    } else {
      removeFile();
    }
  };

  const handleEnviarArchivo = async () => {
    if (validFile && file) {
      if (file.type === "text/csv") {
        const jsonDict = await convertirCSVaJSON(file);
        const json = JSON.stringify(jsonDict);
        setSuccess(true);
        console.log(json);
      } else if (file.type === "application/json") {
        console.log(file);
        setSuccess(true);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setValidFile(false);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validarArchivo = (file: File) => {
    if (!file) {
      setError("No se ha cargado ningún archivo");
      return false;
    }

    if (file.type !== "application/json" && file.type !== "text/csv") {
      setError("El archivo debe ser de tipo CSV o JSON");
      return false;
    }
    return true;
  };

  const verificarValidezArchivo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!validarArchivo(file)) {
        resolve(false);
        return;
      }

      const reader = new FileReader();

      if (file.type === "text/csv") {
        reader.onload = (e) => {
          const contenido = e.target?.result as string;
          const lineas = contenido.split("\n");

          if (lineas.length === 0) {
            setError("El archivo está vacío");
            resolve(false);
            return;
          }

          const columnas = lineas[0].split(",");
          if (columnas.length !== 1 || columnas[0] !== "data") {
            setError(
              "El archivo CSV debe tener una única columna llamada 'data'"
            );
            resolve(false);
            return;
          }
          resolve(true);
        };
        reader.readAsText(file);
      } else if (file.type === "application/json") {
        reader.onload = (e) => {
          const contenido = e.target?.result as string;
          try {
            const json = JSON.parse(contenido);
            if (!json.hasOwnProperty("data")) {
              setError(
                "El archivo JSON debe tener una propiedad llamada 'data'"
              );
              resolve(false);
              return;
            }
            resolve(true);
          } catch (error) {
            setError("El archivo JSON no es válido");
            resolve(false);
          }
        };
        reader.readAsText(file);
      } else {
        setError("El archivo debe ser de tipo CSV o JSON");
        resolve(false);
      }
    });
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

      <div className="flex gap-4 py-4">
        <label
          className={"px-8 py-4 rounded-2xl bg-[#0D92F4] text-white w-fit inline-block  ".concat(
            file !== null
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
            disabled={file !== null}
          />
        </label>
        <button
          className={"px-8 py-4 rounded-2xl bg-green-400 text-white w-fit ".concat(
            !validFile ? "bg-opacity-50 cursor-not-allowed" : ""
          )}
          onClick={handleEnviarArchivo}
        >
          Predecir
        </button>
      </div>
      {
        // Si hay un archivo cargado, mostrarlo
        file !== null && (
          <div className="flex gap-4 items-center">
            <p className="font-semibold">Archivo cargado:</p>
            <p>{file.name}</p>
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
      {success && (
        <div
          className=" fixed top-0 left-0 flex justify-center items-center w-full h-screen z-[200]  bg-black bg-opacity-50"
          onClick={(e) => {
            setSuccess(false);
          }}
        >
          <div
            className="flex flex-col gap-2 bg-white rounded-2xl p-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <p className="font-semibold">Opiniones predecidas correctamente</p>
            <button
              className="bg-green-400 rounded-xl p-2 w-fit h-fit text-white font-semibold"
              onClick={() => {
                setSuccess(false);
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
