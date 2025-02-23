# Utilisez une image de base Python
FROM python:3.10.14

# Définissez le répertoire de travail dans le conteneur
WORKDIR /back-end

# Copiez les fichiers de dépendances
COPY requirements.txt .

# Installez les dépendances
RUN apt-get update && apt-get install -y python3

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiez le reste du code de l'application
COPY . .

# Exposez le port sur lequel votre application écoute
EXPOSE 8080

# Commande pour lancer l'application
CMD ["python", "app.py"]  # Remplacez "app.py" par le nom de votre fichier principal