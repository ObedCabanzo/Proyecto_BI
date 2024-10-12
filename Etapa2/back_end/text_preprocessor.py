import re
import unicodedata
import nltk
import spacy
from sklearn.base import BaseEstimator, TransformerMixin
import pandas as pd

# Descargar los recursos necesarios de NLTK
nltk.download('punkt')
nltk.download('stopwords')

# Cargar el modelo de Spacy para español
nlp = spacy.load('es_core_news_sm')

# Clase personalizada para aplicar preprocesamiento
class TextPreprocessor(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        # Si X es un DataFrame o Series de pandas, aplicamos el preprocesamiento con `apply`
        if isinstance(X, pd.Series) or isinstance(X, pd.DataFrame):
            X = X.dropna()
            return X.apply(self._preprocess_text)
        # Si es una lista, iteramos sobre los elementos para preprocesar cada uno
        elif isinstance(X, list):
            return [self._preprocess_text(text) for text in X]
        else:
            raise ValueError("El tipo de dato no es soportado. Se esperaba una lista, pandas.Series o pandas.DataFrame")

    def _preprocess_text(self, text):
        # Tokenización
        tokens = nltk.word_tokenize(text)
        
        # Minúsculas
        tokens = [w.lower() for w in tokens]
        
        # Eliminación de puntuación
        tokens = [re.sub(r'[^\w\s]', '', w) for w in tokens]
        
        # Normalización ASCII
        tokens = [unicodedata.normalize('NFKD', w).encode('ascii', 'ignore').decode('utf-8', 'ignore') for w in tokens]
        
        # Eliminación de stopwords
        stop_words = set(nltk.corpus.stopwords.words('spanish') + ['mas'])
        tokens = [w for w in tokens if w not in stop_words]
        
        # Lematización con Spacy
        tokens = [token.lemma_ for token in nlp(" ".join(tokens))]
        
        return " ".join(tokens)
