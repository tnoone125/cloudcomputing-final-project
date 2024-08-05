FROM node:14

WORKDIR /usr/src/app

# pass environment variable https://vsupalov.com/docker-build-pass-environment-variables/
ARG api_ip
ENV TODO_API_IP=${api_ip}

COPY package.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

EXPOSE 5000

# Run the Express server
CMD ["node", "server/index.js"]