from typing import Union

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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
    list[OpinionODS]
    


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# Formato JSON de entrada VALID0: {"data": ["opinion1", "opinion2",... "opinionN"] }
# Formato JSON de salida [ {"ods": ods, "score": score}, ... ] (Las respuestas deben estar en el mismo orden que las opiniones)

@app.post("/predecir/")
def predecir( opiniones: OpinionesLista):
    return ({"predicciones": predecir_opiniones(opiniones.data)})

# Formato JSON de entrada VALID0: [ {"text":"opinion1", "ods": ods }, {"text":"opinion2", "ods": ods } ... {"text":"opinionN", "ods": ods } ] 
# Formato JSON de salida {"precision": valor, "recall": valor, "f1": valor} 

@app.post("/reentrenar/")
def predecir( prediccion: OpinionesODSLista):
    return (reentrenar(prediccion))



def predecir_opiniones(opiniones: list[str]):
    predicciones = []
    for _ in opiniones:
        predicciones.append({"ods": 3, "score": 0.9})
    return predicciones

def reentrenar (ListaOpiniones: OpinionesODSLista):
    precision = 0.9
    recall = 0.9
    f1 = 0.9
    return {"precision": precision, "recall": recall, "f1": f1}




     
    