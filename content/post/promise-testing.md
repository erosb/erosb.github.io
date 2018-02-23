+++
date = "2016-05-23T10:51:01+02:00"
draft = true
title = "Unit testing Promise-based code"

+++

Promise-based programming is becoming a more and more common pattern in javascript.

Testing asynchronous behaviour can be tricky to unittest. The core problem is that the vast majority of testing
frameworks have been designed with having synchronous execution in mind, 
