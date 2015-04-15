FROM node:0.12.2

MAINTAINER Jens-Ole Graulund <jensole@graulund.net>

EXPOSE 8080
EXPOSE 1883

ADD start.sh /tmp/

RUN chmod +x /tmp/start.sh

CMD ./tmp/start.sh

