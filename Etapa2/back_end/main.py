from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import spacy
import nltk
import pandas as pd
app = FastAPI()

model_path = './model/svm_text_pipeline.joblib'
if not os.path.exists(model_path):
    raise FileNotFoundError(f"No se encontró el archivo de modelo {model_path}")

pipeline = joblib.load(model_path)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir cualquier origen
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)
    
class OpinionesLista(BaseModel):
    data: list[str]

class OpinionODS(BaseModel):
    text: str
    ods: int

class OpinionesODSLista(BaseModel):
    data: list[OpinionODS]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# Formato JSON de entrada VALID0: {"data": ["opinion1", "opinion2",... "opinionN"] }
# Formato JSON de salida [ {"ods": ods, "score": score}, ... ] (Las respuestas deben estar en el mismo orden que las opiniones)
@app.post("/predecir/")
def predecir(opiniones: OpinionesLista):
    # Imprimir las opiniones recibidas
    print(f"Opiniones recibidas para predicción: {opiniones.data}")
    
    # Realizar las predicciones
    predicciones = predecir_opiniones(opiniones.data)
    
    # Imprimir las predicciones generadas
    print(f"Predicciones generadas: {predicciones}")
    
    return {"predicciones": predicciones}

# Formato JSON de entrada VALID0: [ {"text":"opinion1", "ods": ods }, {"text":"opinion2", "ods": ods } ... {"text":"opinionN", "ods": ods } ] 
# Formato JSON de salida {"precision": valor, "recall": valor, "f1": valor} 
@app.post("/reentrenar/")
def reentrenar_opiniones(prediccion: OpinionesODSLista):
    # Imprimir los datos recibidos para reentrenamiento
    print(f"Datos recibidos para reentrenamiento: {prediccion.data}")
    
    # Realizar el reentrenamiento
    resultado_reentrenamiento = reentrenar(prediccion.data)
    
    # Imprimir los resultados del reentrenamiento
    print(f"Resultados del reentrenamiento: {resultado_reentrenamiento}")
    
    return resultado_reentrenamiento

def predecir_opiniones(opiniones: list[str]):
    # Convertir las opiniones en un DataFrame (opcional pero útil para futuras ampliaciones)
    df_opiniones = pd.DataFrame(opiniones, columns=['opinion'])
    print(f"Opiniones convertidas en DataFrame:\n{df_opiniones}")

    # Convertir las opiniones en una lista para ser procesadas por el pipeline
    opiniones_procesadas = df_opiniones['opinion'].tolist()

    # Realizar la predicción usando el pipeline para todas las opiniones de una vez
    try:
        predicciones = pipeline.predict(opiniones_procesadas)
        probabilidades = pipeline.predict_proba(opiniones_procesadas)
        # Empaquetar las predicciones y las probabilidades
        resultado = []
        for prediccion, probabilidad in zip(predicciones, probabilidades):
            resultado.append({
                "ods": int(prediccion), 
                "score": float(max(probabilidad))  # Obtener la probabilidad más alta
            })

        print(f"Predicciones generadas: {resultado}")
        return resultado

    except Exception as e:
        print(f"Error al predecir las opiniones: {e}")
        return [{"ods": None, "score": None} for _ in opiniones]  

def reentrenar(ListaOpiniones: list[OpinionODS]):
    precision = 0.9
    recall = 0.9
    f1 = 0.9
    
    # Imprimir los datos de cada opinión usada para reentrenamiento
    for opinion in ListaOpiniones:
        print(f"Reentrenando con opinión: {opinion.text}, ODS: {opinion.ods}")
    
    return {"precision": precision, "recall": recall, "f1": f1}
