# Letsencrypt Docker Proxy

A docker cloud proxy that allows you to server multiple https applications on the same machine by proxying https calls to linked images based on hostname. This will also get its SSL certificates from [letsencrypt](https://letsencrypt.org/)

This makes heavy use of:
- [Daplie/letsencrypt-express](https://github.com/Daplie/letsencrypt-express)
- [nodejitsu/node-http-proxy](https://github.com/nodejitsu/node-http-proxy)

I also borrow heavily from [docker/dockercloud-haproxy](https://github.com/docker/dockercloud-haproxy)

## How It Works
This image will use the [Docker Cloud API](https://docs.docker.com/apidocs/docker-cloud) to read the environment vars of linked services. Linked services need to have the following environment variables set:

| Variable | Type | Value | Usage |
| --- | --- | --- | --- |
| VIRTUAL_HOST | string | example.com | Requests from this domain should be forwarded to this service |
| TCP_PORT | integer | 8080 | The port the traffic should be forwarded to |

If a request comes in on a matching domain, it will be forward to the linked service and the response will be sent back to the requestor.

## Configuration
Configuration is done via exposed Environment variables:

| Variable | Type | Value | Usage |
| --- | --- | --- | --- |
| EMAIL | string | user@example.com | Letsencrypt registrations will use this email |
| TCP_PORT | integer | 443 | port it should listen on |
| HTTP_REDIRECT | boolean | true | Redirect port 80 to TCP_PORT |
