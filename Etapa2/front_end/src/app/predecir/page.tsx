import Form from "./form";
import FormCarga from "./form_carga";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Predicción - Análisis ODS",
  description: "Predicción de opiniones relacionadas con los ODS.",
};

export default function PredecirPage(props: {}) {
  // Formulario con los campos: Opinion y boton de enviar, se pueden añadir varias opiniones
  return (
    <div className="flex flex-col px-8 sm:px-16 md:px-24 lg:px-32 py-4 sm:py-8 md:py-16 gap-4  ">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
        Comparte tus opiniones
      </h1>
      <div className="flex flex-col gap-4 text-xs sm:text-sm">
        <p>
          Envía tus opiniones o comentarios para analizar cómo se alinean con
          los Objetivos de Desarrollo Sostenible. Puedes ingresar texto
          directamente o cargar un archivo con múltiples opiniones (CSV o JSON)
          para obtener predicciones detalladas.
        </p>
        <div>
          <p>
            Salud y bienestar <span className="font-semibold">(ODS 3)</span>
          </p>
          <p>
            Educación de calidad <span className="font-semibold">(ODS 4)</span>
          </p>
          <p>
            Igualdad de género <span className="font-semibold">(ODS 5)</span>
          </p>
        </div>
        <Form />
        <FormCarga />
      </div>
    </div>
  );
}
