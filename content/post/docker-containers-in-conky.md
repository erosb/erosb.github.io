+++
title = "Displaying Docker containers in Conky"
date = "2017-02-06"
draft = true

+++

After using Docker over a couple of months for managing a development environment locally, I felt a bit tired of repeatedly
checking the status of the  containers several times each day. So I looked after how can I display the current status of
the containers in the Conky system monitor.

<!--more-->

It turned out that Conky doesn't support Docker out of the box, but it is customizable with its `exec`-like commands. So
I started looking after what is the best solution I can achieve from the shell. One option would be to call `docker ps` 
then alter its output using `awk` or `sed` to extract the information I want to see in Conky. But I wanted a bit cleaner
approach than that, so I decided to use the Python client library to list the containers. The REST API of the docker engine
provides all information one will ever need in JSON format, so picking a client library which uses the REST API seemed to
be a good way to go. I chose python, because it is installed on most linux systems by default, so there is no need to install
any additional language runtime or compiler to run the script.


I installed the client library with `sudo pip install docker`, then I put the following (executable) python script to `/home/erosb/bin/docker-status.py`:

```
#!/usr/bin/env python

import docker
client = docker.from_env()
for container in client.containers.list():
  print '{:40} {}'.format(container.attrs['Config']['Image'], container.status)
```



And finally I added this single line to my `.conkyrc`: 

`${exec /home/erosb/bin/docker-status.py}`

Voila! It just works.
