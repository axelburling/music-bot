FROM ubuntu

WORKDIR /app

RUN apt update && apt upgrade -y

RUN apt install -y \
    ffmpeg \
    nodejs \
    npm \
    wget \
    unzip 

COPY ./package*.json ./

COPY . ./app/

RUN npm install

CMD npm run start