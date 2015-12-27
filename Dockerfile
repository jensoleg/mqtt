# BUILD image: docker build -t jensoleg/mqtt .
# RUN image  : docker run --name mqtt -e "APP=app.js" -p 8080:8080 -p 1883:1883 -p 8082:8082 -d jensoleg/mqtt

FROM node:0.10

MAINTAINER Jens-Ole Graulund <jensole@graulund.net>

RUN npm install --unsafe-perm --production -g pm2@0.15.6

EXPOSE 8080
EXPOSE 1883
EXPOSE 8082

ADD start.sh /tmp/

RUN chmod +x /tmp/start.sh

CMD ./tmp/start.sh