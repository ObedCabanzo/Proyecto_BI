import FormCarga from "./form_carga";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Reentrenamiento - Análisis ODS",
  description: "Reentrenamiento del modelo de clasificación de opiniones.",
};
export default function ReentrenarPage() {
  return (
    <div className="flex flex-col px-8 sm:px-16 md:px-24 lg:px-32 py-4 sm:py-8 md:py-16 gap-4 ">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
        Reentrenamiento de modelo
      </h1>
      <div className="flex flex-col gap-4 text-xs sm:text-sm">
        <p>
          Si eres administrador o analista, contribuye al mejoramiento del
          modelo subiendo nuevos datos de entrenamiento. Reentrena el sistema
          para mejorar su precisión y visualizar las métricas del rendimiento
          actualizado del modelo.
        </p>
        <FormCarga />
      </div>
    </div>
  );
}
