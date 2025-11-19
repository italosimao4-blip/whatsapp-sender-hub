# Etapa 1: build do projeto (React/Tailwind, Vite, etc.)
FROM node:20-alpine AS build

WORKDIR /app

# Copia dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Gera o build de produção
# Se o script não for "build", ajuste para o comando que existir no package.json
RUN npm run build

# Etapa 2: Nginx servindo o build estático
FROM nginx:alpine

# Remove configuração default e ajusta se quiser (opcional)
RUN rm -rf /usr/share/nginx/html/*

# Copia o build gerado (para Vite normalmente é 'dist'; para CRA é 'build')
# Ajuste se o nome da pasta de saída for diferente
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
