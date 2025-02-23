# Utilisez une image de base Node.js
FROM node:20

# Définissez le répertoire de travail dans le conteneur
WORKDIR /front-end

# Copiez les fichiers de dépendances
COPY package.json yarn.lock ./

# Installez les dépendances
RUN yarn install

# Copiez le reste du code de l'application
COPY . .

# Construisez l'application React
RUN yarn build

# Exposez le port sur lequel votre application écoute
EXPOSE 5173

# Commande pour lancer l'application
CMD ["yarn", "start"]