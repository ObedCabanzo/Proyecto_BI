    
from pydantic import BaseModel

class OpinionesLista(BaseModel):
    data: list[str]

class OpinionODS(BaseModel):
    text: str
    ods: int

class OpinionesODSLista(BaseModel):
    data: list[OpinionODS]
    
class Metricas(BaseModel):
    precision: float
    recall: float
    f1: float