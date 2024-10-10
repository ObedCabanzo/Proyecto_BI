import Link from "next/link";
import Image from "next/image";
import Background from "@/assets/images/bg_1.png";
export default function Home() {
  return (
    <div className="flex flex-col lg:flex-row h-fit px-8 sm:px-16 md:px-24 lg:px-32 gap-8  items-center justify-center lg:h-[90vh] py-4 sm:py-8 md:py-16 ">
      <div className="w-full flex flex-col gap-2 order-2 lg:order-1 lg:pr-32">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          Análisis de Opiniones Basado en los Objetivos de Desarrollo Sostenible
          (ODS)
        </h1>
        <div className="flex flex-col gap-4 text-xs sm:text-sm">
          <p>
            Esta plataforma, en colaboración con el Fondo de Población de las
            Naciones Unidas (UNFPA), está diseñada para recopilar y analizar las
            opiniones de los ciudadanos en torno a tres Objetivos de Desarrollo
            Sostenible (ODS) fundamentales:
          </p>
          <div>
            <p>
              Salud y bienestar <span className="font-semibold">(ODS 3)</span>
            </p>
            <p>
              Educación de calidad{" "}
              <span className="font-semibold">(ODS 4)</span>
            </p>
            <p>
              Igualdad de género <span className="font-semibold">(ODS 5)</span>
            </p>
          </div>
          <p>
            {" "}
            Utiliza nuestras herramientas de inteligencia artificial para
            obtener predicciones y contribuir al mejoramiento del análisis con
            nuevos datos.
          </p>

          <Link
            href={"/predecir"}
            className="px-8 py-4 rounded-lg bg-slate-700 text-white w-fit h-fit font-semibold"
          >
            Contribuir
          </Link>
        </div>
      </div>
      <div className="w-full relative order-1 lg:order-2 h-[200px] sm:h-[300px] lg:h-[70vh] flex items-center justify-center shadow-2xl rounded-3xl overflow-hidden">
        <Image
          src={Background}
          alt="background"
          priority={true}
          fill
          className="rounded-3xl object-cover"
          quality={100} // (Opcional) Mejor calidad de imagen
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 70vh" // Ajusta según tu diseño
        />
      </div>
    </div>
  );
}
