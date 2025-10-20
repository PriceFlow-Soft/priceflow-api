# Passo 1: Use uma imagem oficial do Node.js como base.
FROM node:18-slim

# Passo 2: Defina o diretório de trabalho dentro do contêiner.
WORKDIR /usr/src/app

# Passo 3: Copie o arquivo de manifesto (package.json) para o diretório de trabalho.
COPY package.json ./

# Passo 4: Instale as dependências do projeto (o framework Express).
RUN npm install

# Passo 5: Copie todo o resto do código da nossa aplicação para o diretório de trabalho.
COPY . .

# Passo 6: Exponha a porta 8080 para que o Cloud Run possa se comunicar com nosso servidor.
EXPOSE 8080

# Passo 7: Defina o comando que será executado quando o contêiner iniciar.
CMD [ "npm", "start" ]