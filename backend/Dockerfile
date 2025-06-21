FROM oven/bun:1.1.8-slim

# Instala herramientas adicionales si las necesitás (como git, build-essential, python3)
RUN apt-get update && apt-get install -y git build-essential python3 && apt-get clean

# Crea y entra al directorio de la app
WORKDIR /app

# Copia los archivos de dependencias y los instala
COPY bun.lock package.json ./
RUN bun install

# Copia el resto del proyecto
COPY . .

# Expone el puerto
EXPOSE 1337

# Comando por defecto para desarrollo
CMD ["bun", "run", "dev"]
