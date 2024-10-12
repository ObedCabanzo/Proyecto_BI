"use client";

import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { postPredecir } from "@/services/api";
import { numeroAPorcentaje } from "@/services/utils";


export default function Form() {
  type Opinion = {
    text: string;
    date: Date;
    ods?: number;
    score?: number;
  };

  type Prediccion = {
    ods: number;
    score: number;
  };

  const MAX_TOKENS = 2000;
  const [opiniones, setOpiniones] = useState<Opinion[]>([]);
  const [opinion, setOpinion] = useState<Opinion>({
    text: "",
    date: new Date(),
  });
  const [valid, setValid] = useState(false);

  // Estados permitidos: "No cargadas", "Cargando", "Cargadas", "Error del servidor", "Respuesta invalida"
  const [estadoPredicciones, setEstadoPredicciones] = useState("No cargadas");

  const handleOpinionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event.target.value.length > MAX_TOKENS) {
      return;
    }
    setOpinion({ ...opinion, text: event.target.value });
  };

  const handleAddOpinion = () => {
    if (opinion.text.length > 0) {
      setOpiniones([...opiniones, { ...opinion, date: new Date() }]);
      setOpinion({ text: "", date: new Date(),  });
    }
  };

  const handleEnviar = async () => {
    const opinionesSinPrediccion = opiniones.filter(
      (opinion) => opinion.ods === undefined
    );
    if (opinionesSinPrediccion.length === 0) {
      setEstadoPredicciones("No hay opiniones para predecir");
      return;
    } else {
      // lista de textos
      const opinionesTextos = opinionesSinPrediccion.map(
        (opinion) => opinion.text
      );

      const response = await postPredecir({data: opinionesTextos});
      setEstadoPredicciones("Cargando");
      cargarPredicciones(response.predicciones);
    }
    setValid(true);
  };

  const cargarPredicciones = (predicciones: Prediccion[]) => {
    const opinionesSinPrediccion = opiniones.filter(
      (opinion) => opinion.ods === undefined
    );
    const opinionesConPrediccion = opiniones.filter(
      (opinion) => opinion.ods !== undefined
    );

    if (opinionesSinPrediccion.length !== predicciones.length) {
      setEstadoPredicciones("Error del servidor");
      return;
    } else if (predicciones.length === 0) {
      setEstadoPredicciones("Respuesta invalida");
      return;
    } else {

      // Opiniones sin prediccion
      const nuevasOpiniones = [...opinionesSinPrediccion];
      for (let i = 0; i < predicciones.length; i++) {
        nuevasOpiniones[i].ods = predicciones[i].ods;
        nuevasOpiniones[i].score = predicciones[i].score;
      }
      setOpiniones([...opinionesConPrediccion, ...nuevasOpiniones]);
      setEstadoPredicciones("Cargadas");
    }
  };

  const getDate = (date: Date) => {
    if (date === null) {
      return "";
    }
    // Si la fecha es de hoy, mostrar "Hoy"
    else if (date.toDateString() === new Date().toDateString()) {
      return "Hoy";
    }
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatOds = (ods: number) => {
    switch (ods) {
      case 3:
        return "ODS 3: Salud y bienestar";
      case 4:
        return "ODS 4: Educación de calidad";
      case 5:
        return "ODS 5: Igualdad de género";
      default:
        return "No definido";
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center ">
      {opiniones.length > 0 && (
        <div className="flex flex-col gap-4 w-full">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold py-2">
            Tus opiniones
          </h1>
          {opiniones.map((opinion, index) => {
            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full items-start  bg-white shadow-2xl rounded-xl p-4 "
              >
                <div className="flex flex-col px-4 py-2 justify-center items-center bg-slate-200 rounded-lg">
                  <p className="font-semibold">{getDate(opinion.date)}</p>
                  <p className="font-semibold text-xl ">
                    {getTime(opinion.date)}
                  </p>
                </div>
                <div className="flex flex-col lg:flex-row w-full justify-between gap-4 items-start">
                  <p className="break-all whitespace-normal overflow-hidden">
                    {opinion.text}
                  </p>
                  <div className="flex flex-col gap-2 items-center">
                    {
                      // Si la opinión tiene una predicción, mostrarla
                      opinion.ods !== undefined && opinion.score  && (
                        <>
                        <p className="font-semibold">
                          {formatOds(opinion.ods)} 
                        </p>
                        <p className="font-semibold">
                          Probabilidad: {numeroAPorcentaje(opinion.score)}
                        </p>
                        </>
                      )
                    }
                    <button
                      className="flex gap-4 px-4 py-2 bg-red-500 text-white rounded-2xl items-center h-fit"
                      onClick={() => {
                        setOpiniones(opiniones.filter((_, i) => i !== index));
                      }}
                    >
                      <p className="font-semibold text-xs sm:text-sm">
                        Eliminar opinión
                      </p>
                      <IoClose
                        className="cursor-pointer h-6 w-auto text-white"
                        onClick={() => {
                          setOpiniones(opiniones.filter((_, i) => i !== index));
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex flex-col items-start gap-2 w-full">
        <div className="w-full h-full">
          <textarea
            className="w-full p-4 max-h-64 rounded-2xl border-2 min-h-48 relative"
            placeholder="Escribe tu opinión"
            value={opinion.text}
            onChange={handleOpinionChange}
          ></textarea>
          <p className="font-semibold pb-4">
            {" "}
            {opinion.text.length} / {MAX_TOKENS} caracteres permitidos{" "}
          </p>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-center items-center sm:justify-evenly gap-2 ">
          <button
            className={"px-8 py-4 w-fit h-fit rounded-2xl bg-slate-600 text-white ".concat(
              opinion.text.length === 0
                ? " cursor-not-allowed bg-opacity-50"
                : "cursor-pointer "
            )}
            onClick={handleAddOpinion}
          >
            Añadir Opinion
          </button>
          <button
            className={"px-16 py-4 bg-green-500 w-fit h-fit  rounded-2xl shadow-2xl text-white ".concat(
              opiniones.length === 0
                ? " cursor-not-allowed bg-green-400 bg-opacity-50"
                : "cursor-pointer bg-green-500"
            )}
            onClick={handleEnviar}
          >
            Predecir
          </button>
        </div>
      </div>
      {valid && (
        <div
          className="fixed top-0 flex justify-center items-center w-full h-screen z-[200]  bg-black bg-opacity-50"
          onClick={() => {
            setValid(false);
          }}
        >
          <div
            className="flex flex-col gap-2 bg-white rounded-2xl p-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            
            {estadoPredicciones === "Cargando" && (
              <p className="font-semibold">Obteniendo predicciones...</p>
            )}
            {!(
              estadoPredicciones === "Cargadas" ||
              estadoPredicciones === "Cargando"
            ) && (
              <p className="font-semibold">
                No se pudo completar la predicción: {estadoPredicciones}
              </p>
            )}
            {estadoPredicciones === "Cargadas" && (
                <p className="font-semibold">Opiniones predecidas correctamente.</p>
              )}
            <button
              className="bg-[#243642] rounded-xl p-2 w-fit h-fit text-white font-semibold"
              onClick={() => {
                setValid(false);
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
