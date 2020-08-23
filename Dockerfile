FROM johnpapa/angular-cli

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm","start" ]
