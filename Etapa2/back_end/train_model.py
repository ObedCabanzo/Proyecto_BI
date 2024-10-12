import pandas as pd
import joblib
from sklearn import svm
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from clases import Metricas, OpinionODS
import nltk
import json

nltk.download('punkt_tab')

# Importar la clase TextPreprocessor desde el archivo text_preprocessor.py
from text_preprocessor import TextPreprocessor


def reentrenar(df): 
    # Cargar los datos
    print("\nEntrenando modelo...\n")
    #data = pd.read_excel('C:\Users\Santiago Tapias\Desktop\inteligencia de negocios\etapa2\Proyecto_BI\Etapa2\back_end\sample_data\ODScat_345.xlsx')
    file_path = './data/model/ODScat_345.xlsx'

    # Cargar los datos
    data = pd.read_excel(file_path)
    
    #Sumar los datos de la nueva data
    if (df is not None):
        data = pd.concat([data, df], ignore_index=True)
        print(data.head())

    # Definir las características (X) y etiquetas (y)
    X = data['Textos_espanol']
    y = data['sdg']

    # Crear el pipeline
    pipeline = Pipeline([
        ('preprocessor', TextPreprocessor()),  # Preprocesamiento de texto
        ('tfidf', TfidfVectorizer()),          # Vectorización TF-IDF
        ('svm', svm.SVC(C=10, kernel="rbf", gamma=1, probability=True))  # Clasificación con SVM
    ])

    # Dividir los datos en entrenamiento y prueba
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.4, random_state=0)

    # Entrenar el pipeline
    pipeline.fit(X_train, y_train)

    # Realizar predicciones en los datos de prueba
    y_pred = pipeline.predict(X_test)
    
    
    report = classification_report(y_test, y_pred, output_dict=True)
    # Mostrar resultados
    print("Precisión del modelo SVM:", accuracy_score(y_test, y_pred))
    print("Reporte de clasificación:\n", report)
    
    weighted_avg = report['weighted avg']
    
    
    if (df is None):
        metricas = crear_metricas(weighted_avg['precision'], weighted_avg['recall'], weighted_avg['f1-score'])
        cambiar_metricas(metricas)
    
    if (df is not None):
        metricas_prev = cargar_metricas('./data/model/metricas.json')
        if (validar_metricas(metricas_prev, weighted_avg['precision'], weighted_avg['recall'], weighted_avg['f1-score'])):
            new_metricas = crear_metricas(weighted_avg['precision'], weighted_avg['recall'], weighted_avg['f1-score'])
            reemplazar_modelo(pipeline, new_metricas)
    
def reemplazar_modelo(pipeline, metricas: Metricas):
    # Guardar el modelo en un archivo
    joblib.dump(pipeline, './model/svm_text_pipeline.joblib')
    cambiar_metricas(metricas)
    
    print("Modelo guardado exitosamente en './model/svm_text_pipeline.joblib'")
        
# Función para cargar el archivo JSON y convertirlo a un objeto Metricas
def cargar_metricas(path: str) -> Metricas:
    # Leer el archivo JSON
    with open(path, 'r') as file:
        data = json.load(file)
    
    # Crear una instancia de Metricas usando el diccionario cargado
    metricas = Metricas(**data)
    
    return metricas

def cambiar_metricas(metricas: Metricas):
    # Convertir el objeto Metricas a un diccionario
    metricas_dict = metricas.model_dump()
    
    # Guardar el diccionario en un archivo JSON
    with open('./data/model/metricas.json', 'w') as file:
        json.dump(metricas_dict, file)
    print("Metricas guardadas exitosamente en '.data/model/metricas.json'")

# Función para convertir OpinionesODSLista a un DataFrame
def convertir_a_dataframe(opiniones_ods_lista: list[OpinionODS]) -> pd.DataFrame:
    # Crear el DataFrame con dos columnas: 'Textos_espanol' y 'sdg'
    df = pd.DataFrame({
        'Textos_espanol': [opinion.text for opinion in opiniones_ods_lista],
        'sdg': [opinion.ods for opinion in opiniones_ods_lista]
    })
    
    return df

def validar_metricas(metricas_prev: Metricas, precision, recall, f1) -> bool:
    if precision > metricas_prev.precision and recall > metricas_prev.recall and f1 > metricas_prev.f1:
        return True
    else:
        return False
    
def crear_metricas(precision, recall, f1):
    metricas = Metricas(precision=precision, recall=recall, f1=f1, support=0)
    return metricas
