# BUILD image: docker build -t jensoleg/mqtt .
# RUN image  :  docker run --name mqtt -e "APP=app.js" -p 8082:8082 -p 1883:1883 -d jensoleg/mqtt
FROM node:0.12.2

MAINTAINER Jens-Ole Graulund <jensole@graulund.net>

RUN npm install -g pm2@0.12.10

EXPOSE 8082
EXPOSE 1883

ADD start.sh /tmp/

RUN chmod +x /tmp/start.sh

CMD ./tmp/start.sh

