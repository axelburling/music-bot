FROM node:16.6.0

WORKDIR /app

COPY package*.json ./
ADD package.json /app/package.json
RUN npm install -g npm
RUN npm install

# Bundle app source
COPY . .

# Specify port

# start app
CMD ["npm", "start"]