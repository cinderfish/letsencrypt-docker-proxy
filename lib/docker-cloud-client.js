'use strict';

const request = require('superagent');
const logger = require('./logger')();

/**
 * Get service info
 *
 * @return {Promise} Promise that resolves with Service object
 * @see https://docs.docker.com/apidocs/docker-cloud/#service
 * {
 *   "autodestroy": "OFF",
 *   "autoredeploy": false,
 *   "autorestart": "ON_FAILURE",
 *   "bindings": [
 *     {
 *         "host_path": null,
 *         "container_path": "/tmp",
 *         "rewritable": true,
 *         "volumes_from": null
 *     },
 *     {
 *         "host_path": "/etc",
 *         "container_path": "/etc",
 *         "rewritable": true,
 *         "volumes_from": null
 *     },
 *     {
 *         "host_path": null,
 *         "container_path": null,
 *         "rewritable": true,
 *         "volumes_from": "/api/app/v1/service/2f4f54e5-9d3b-4ac1-85ad-a2d4ff25a179/"
 *     }
 *   ],
 *   "cap_add": [
 *     "ALL"
 *   ],
 *   "cap_drop": [
 *     "NET_ADMIN",
 *     "SYS_ADMIN"
 *   ],
 *   "container_envvars": [
 *     {
 *       "key": "DB_PASS",
 *       "value": "test"
 *     }
 *   ],
 *   "container_ports": [
 *     {
 *       "endpoint_uri": "http://wordpress-stackable.admin.srv.dockerapp.io:80/",
 *       "inner_port": 80,
 *       "outer_port": 80,
 *       "port_name": "http",
 *       "protocol": "tcp",
 *       "published": true
 *     }
 *   ],
 *   "containers": [
 *     "/api/app/v1/container/6f8ee454-9dc3-4387-80c3-57aac1be3cc6/",
 *     "/api/app/v1/container/fdf9c116-7c08-4a60-b0ce-c54ca72c2f25/"
 *   ],
 *   "cpu_shares": 100,
 *   "cpuset": "0,1",
 *   "cgroup_parent": "m-executor-abcd",
 *   "current_num_containers": 2,
 *   "deployed_datetime": "Mon, 13 Oct 2014 11:01:43 +0000",
 *   "deployment_strategy": "EMPTIEST_NODE",
 *   "destroyed_datetime": null,
 *   "devices": [
 *     "/dev/ttyUSB0:/dev/ttyUSB0"
 *   ],
 *   "dns": [
 *     "8.8.8.8"
 *   ],
 *   "dns_search": [
 *     "example.com"
 *   ],
 *   "domainname": "domainname",
 *   "entrypoint": "",
 *   "extra_hosts": [
 *     "onehost:50.31.209.229"
 *   ],
 *   "hostname": "hostname",
 *   "image_name": "tutum/wordpress-stackable:latest",
 *   "nickname": "wordpress-stackable",
 *   "labels": {
 *     "com.example.description": "Accounting webapp",
 *     "com.example.department": "Finance",
 *     "com.example.label-with-empty-value": ""
 *   },
 *   "link_variables": {
 *     "WORDPRESS_STACKABLE_1_ENV_DB_HOST": "**LinkMe**",
 *     "WORDPRESS_STACKABLE_1_ENV_DB_NAME": "wordpress",
 *     "WORDPRESS_STACKABLE_1_ENV_DB_PASS": "szVaPz925B7I",
 *     "WORDPRESS_STACKABLE_1_ENV_DB_PORT": "**LinkMe**",
 *     "WORDPRESS_STACKABLE_1_ENV_DB_USER": "admin",
 *     "WORDPRESS_STACKABLE_1_ENV_DEBIAN_FRONTEND": "noninteractive",
 *     "WORDPRESS_STACKABLE_1_ENV_HOME": "/",
 *     "WORDPRESS_STACKABLE_1_ENV_PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
 *     "WORDPRESS_STACKABLE_1_PORT": "tcp://wordpress-stackable-1.admin.cont.dockerapp.io:49153",
 *     "WORDPRESS_STACKABLE_1_PORT_80_TCP": "tcp://wordpress-stackable-1.admin.cont.dockerapp.io:49153",
 *     "WORDPRESS_STACKABLE_1_PORT_80_TCP_ADDR": "wordpress-stackable-1.admin.cont.dockerapp.io",
 *     "WORDPRESS_STACKABLE_1_PORT_80_TCP_PORT": "49153",
 *     "WORDPRESS_STACKABLE_1_PORT_80_TCP_PROTO": "tcp",
 *     "WORDPRESS_STACKABLE_2_ENV_DB_HOST": "**LinkMe**",
 *     "WORDPRESS_STACKABLE_2_ENV_DB_NAME": "wordpress",
 *     "WORDPRESS_STACKABLE_2_ENV_DB_PASS": "szVaPz925B7I",
 *     "WORDPRESS_STACKABLE_2_ENV_DB_PORT": "**LinkMe**",
 *     "WORDPRESS_STACKABLE_2_ENV_DB_USER": "admin",
 *     "WORDPRESS_STACKABLE_2_ENV_DEBIAN_FRONTEND": "noninteractive",
 *     "WORDPRESS_STACKABLE_2_ENV_HOME": "/",
 *     "WORDPRESS_STACKABLE_2_ENV_PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
 *     "WORDPRESS_STACKABLE_2_PORT": "tcp://wordpress-stackable-2.admin.cont.dockerapp.io:49154",
 *     "WORDPRESS_STACKABLE_2_PORT_80_TCP": "tcp://wordpress-stackable-2.admin.cont.dockerapp.io:49154",
 *     "WORDPRESS_STACKABLE_2_PORT_80_TCP_ADDR": "wordpress-stackable-2.admin.cont.dockerapp.io",
 *     "WORDPRESS_STACKABLE_2_PORT_80_TCP_PORT": "49154",
 *     "WORDPRESS_STACKABLE_2_PORT_80_TCP_PROTO": "tcp",
 *     "WORDPRESS_STACKABLE_ENV_DB_HOST": "**LinkMe**",
 *     "WORDPRESS_STACKABLE_ENV_DB_NAME": "wordpress",
 *     "WORDPRESS_STACKABLE_ENV_DB_PASS": "szVaPz925B7I",
 *     "WORDPRESS_STACKABLE_ENV_DB_PORT": "**LinkMe**",
 *     "WORDPRESS_STACKABLE_ENV_DB_USER": "admin",
 *     "WORDPRESS_STACKABLE_ENV_DEBIAN_FRONTEND": "noninteractive",
 *     "WORDPRESS_STACKABLE_ENV_HOME": "/",
 *     "WORDPRESS_STACKABLE_ENV_PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
 *     "WORDPRESS_STACKABLE_PORT": "tcp://wordpress-stackable-1.admin.cont.dockerapp.io:49153",
 *     "WORDPRESS_STACKABLE_PORT_80_TCP": "tcp://wordpress-stackable-1.admin.cont.dockerapp.io:49153",
 *     "WORDPRESS_STACKABLE_PORT_80_TCP_ADDR": "wordpress-stackable-1.admin.cont.dockerapp.io",
 *     "WORDPRESS_STACKABLE_PORT_80_TCP_PORT": "49153",
 *     "WORDPRESS_STACKABLE_PORT_80_TCP_PROTO": "tcp",
 *     "WORDPRESS_STACKABLE_DOCKERCLOUD_API_URL": "https://cloud.docker.com/api/app/v1/service/adeebc1b-1b81-4af0-b8f2-cefffc69d7fb/"
 *   },
 *   "linked_from_service": [],
 *   "linked_to_service": [
 *     {
 *       "from_service": "/api/app/v1/service/09cbcf8d-a727-40d9-b420-c8e18b7fa55b/",
 *       "name": "DB",
 *       "to_service": "/api/app/v1/service/72f175bd-390b-46e3-9463-830aca32ce3e/"
 *     }
 *   ],
 *   "mac_address": "02:42:ac:11:65:43",
 *   "memory": 2048,
 *   "memory_swap": 8192,
 *   "name": "wordpress-stackable",
 *   "net": "bridge",
 *   "privileged": false,
 *   "public_dns": "wordpress-stackable.admin.svc.dockerapp.io",
 *   "read_only": true,
 *   "resource_uri": "/api/app/v1/service/09cbcf8d-a727-40d9-b420-c8e18b7fa55b/",
 *   "roles": ["global"],
 *   "run_command": "/run-wordpress.sh",
 *   "running_num_containers": 1,
 *   "security_opt": [
 *   ],
 *   "sequential_deployment": false,
 *   "started_datetime": "Mon, 13 Oct 2014 11:01:43 +0000",
 *   "state": "Partly running",
 *   "stack": "/api/app/v1/stack/46aca402-2109-4a70-a378-760cfed43816/",
 *   "stdin_open": false,
 *   "stopped_datetime": null,
 *   "stopped_num_containers": 0,
 *   "synchronized": true,
 *   "tags": [
 *         {"name": "tag_one"},
 *         {"name": "tag-two"},
 *         {"name": "tagthree3"}
 *   ],
 *   "target_num_containers": 2,
 *   "tty": false,
 *   "user": "root",
 *   "uuid": "09cbcf8d-a727-40d9-b420-c8e18b7fa55b",
 *   "working_dir": "/app"
 * }
 */
function getService (service) {
  service = service || process.env.DOCKERCLOUD_SERVICE_API_URI;
  return new Promise((resolve, reject) => {
    logger.info(`Requesting service info from: ${process.env.DOCKERCLOUD_REST_HOST}${service} using ${process.env.DOCKERCLOUD_AUTH}`);
    request
      .get(`${process.env.DOCKERCLOUD_REST_HOST}${service}`)
      .set({
        'Authorization': process.env.DOCKERCLOUD_AUTH,
        'Accept': 'application/json'
      })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          if (res && res.body) {
            resolve(res.body);
          } else {
            reject(new Error('Could not get service info'));
          }
        }
      });
  });
}

module.exports = {
  getService
};
