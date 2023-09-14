FROM node:14

WORKDIR /opt/project

RUN apt-get update 

RUN npm install -g webpack@5
RUN npm install -g webpack-cli@5

ENTRYPOINT npx webpack