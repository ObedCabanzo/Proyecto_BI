import pandas as pd
import joblib
from sklearn import svm
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import nltk
nltk.download('punkt_tab')

# Importar la clase TextPreprocessor desde el archivo text_preprocessor.py
from text_preprocessor import TextPreprocessor

# Cargar los datos
#data = pd.read_excel('C:\Users\Santiago Tapias\Desktop\inteligencia de negocios\etapa2\Proyecto_BI\Etapa2\back_end\sample_data\ODScat_345.xlsx')
file_path = r'C:\Users\Santiago Tapias\Desktop\inteligencia de negocios\etapa2\Proyecto_BI\Etapa2\back_end\sample_data\ODScat_345.xlsx'

# Cargar los datos
data = pd.read_excel(file_path)

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

# Guardar el pipeline entrenado como archivo .joblib
joblib.dump(pipeline, 'svm_text_pipeline.joblib')

# Realizar predicciones en los datos de prueba
y_pred = pipeline.predict(X_test)

# Mostrar resultados
print("Precisión del modelo SVM:", accuracy_score(y_test, y_pred))
print("Reporte de clasificación:\n", classification_report(y_test, y_pred))
