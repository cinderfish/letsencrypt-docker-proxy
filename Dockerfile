FROM rezzza/docker-node:latest

MAINTAINER Shaun Burdick <docker@shaunburdick.com>

ENV NODE_ENV=production \
    EMAIL= \
    TCP_PORT= \
    HTTP_REDIRECT=

ADD . /usr/src/myapp

WORKDIR /usr/src/myapp

RUN ["npm", "install"]

CMD ["npm", "start"]
