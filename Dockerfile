FROM rezzza/docker-node:latest

MAINTAINER Shaun Burdick <docker@shaunburdick.com>

ENV NODE_ENV=production \
    EMAIL= \
    TCP_PORT=8443 \
    HTTP_REDIRECT= \
    REDIRECT_PORT=8080

ADD . /usr/src/myapp

WORKDIR /usr/src/myapp

EXPOSE 8443 8080

RUN ["npm", "install"]

CMD ["npm", "start"]
