+++
title = "System notifications for Maven on Ubuntu"
date = "2017-01-24"
draft = false

+++


Builds can be slow and sloppy. If your job involves executing maven builds frequently during your work - and if you are a
java developer than most probably you do so - then you spend significant time on waiting for build jobs.

Of curse we usually don't just stare at the console, waiting for the maven build to finish, at least because the log messages
flooding on the screen just harmful for the eyes. Instead we something else in an other window.

During those (hopefully) short build periods I don't like periodically checking if the build has finished yet, but I want
to know exactly when it is done. To let myself get notified about it I created a simple wrapper on the top of the `mvn`
command which just pops up a unity system notification on ubuntu after the build. I have been using this utility for
years, so I thought why not to share it.

<!--more-->

So I put a the script below to `~/bin/mvn` and I made sure that `~/bin/` precedes the maven installation directory on
the `$PATH` (referred as `$MVN_HOME/bin` in the script):


```
#!/bin/bash

args="$*"
$MVN_HOME/bin/mvn $*
let x=$?
if [[ $x -eq 0 ]]; then
    notify-send --urgency=normal -i "face-laugh" "mvn $args success"
else
    notify-send --urgency=normal -i "error" "mvn $args failure"
fi

exit $x
```

This wrapper script runs the real `mvn` executable then displays a success or error notification depending on maven's exit
code, in the top-right corner of the screen. They look like this:


<img src="/img/mvn-success.png" />

<img src="/img/mvn-failure.png" />

The same trick will probably work for any build tools, since all you need is a command to be wrapped.
