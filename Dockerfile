from node:8-alpine

WORKDIR /usr/src/app

RUN apk add alpine-sdk python2 libexecinfo-dev \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    imagemagick

COPY . .

RUN npm install

ENTRYPOINT [ "npm", "start" ]
