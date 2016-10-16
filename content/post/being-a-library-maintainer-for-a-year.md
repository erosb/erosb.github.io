+++
title = "Being a library maintainer for a year"
date = "2016-09-30"
draft = false

+++

A year passed since the first public version of the [`everit-org/json-schema`](http://github.com/everit-org/json-schema) library was published on maven central. I think it may be interesting to look back for a summary of what I learned during this year.

This started out as an unimportant side-project, basically I was simply bored on a Friday evening, and I looked for something to hack.
I started getting familiar with JSON Schema a few weeks before. I had some concerns with the existing java implementation of the specification, and
also the schema spec didn't look too difficult, so I thought "why not". I started working on a new implementation.


Now, one year later I don't work for Everit anymore and I don't use the library for any of my current projects. Still I keep maintaining it. You may wonder what makes a library interesting if it is not even closely related to my job, so I make no use of it.

The most important factor is attention. It is not a very popular library, but still there are a good number of people using it. Userbase matters. Feedback matters, regardless if it is the number of bugreports, pull requests, stars or daily visitors of the GitHub project page. Seeing the value provided by the library is the primary thing that keeps me going on and improving it. We, software engineers, work in an industry where approx. 70% of the projects fail - and such failure happened to me too multiple times in the recent years. After spending countless hours on working on software that never made it to production, it is just stirring to see that this library provides some value for people. This is the #1 reason why I work on it.

Since its initial release the library gained a lot of attention. Nowadays it isn't simply used by big companies but also utilized by open-source projects like [RESTHeart](https://github.com/SoftInstigate/restheart), [Nakadi](https://github.com/zalando/nakadi) or [Apache NiFi](https://github.com/apache/nifi). Yet another thing I'm very happy about.

An other noteworthy motive is the technical "fun factor". This started out as one of the first projects in which I can facilitate Java8 language features, and the elegance of multiparadigm programming means a level of convenience that is motivational on its own.

## Lessons learnt

The most important thing I recognized during the last year is that one can never underestimate the importance of backward-compatibility. Although the library has nearly doubled in lines of code since its first stable version, the most simple usecase supported that time still works as it is put in the [quickstart guide](https://github.com/everit-org/json-schema#quickstart). Version 1.0.0 literally didn't know anything else, just a single method performing a schema validation.

Of course, the backward-compatibility of the external interface sometimes requires crazy hacks for the internal implementation. But being able to live together with earlier bad design decisions while also delivering new features and bugfixes is just essential if you want your library to be taken seriously. Also, incrementing major version number all the time, just to be permitted to break the API in the name of semantic versioning (and not maintaining earlier versions), is just a very little better than directly breaking the API. Reliability comes from long-term support of compatible versions. This is an essential treshold for any library which is willing to gain attention, therefore should be kept in mind by library developers. As once Linus Torvalds wrote ["'we need to do that to improve things' is not an excuse"](https://plus.google.com/115250422803614415116/posts/hMT5kW8LKJk).

An other thing I learnt - slightly related to the previous one - is the value of member visibilities. When someone is arguing about why Java has quite baroque visibility rules, he/she will probably come up with reasons like why the client should be considered "stupid", how unwanted usage of an API can cause harmful and mysterious bugs, and many other ways of saying that _the client shouldn't see this because the client is stupid_ . Such reasoning is likely to be felt weak, or even arrogant, and it usually doesn't take too much time until a python guy tells that he never bit himself with python's everything-is-public approach, pointing out the unimportance of defending the client.

In fact a much more important value that I only understood while working on `everit-org/json-schema` is the other direction of protectiveness of visibility rules: it doesn't protect the client from making stupid things, instead *it protects the library author from the necessity of maintaining compatibility*. Simply put, if a method is `private` (or package-private), I can be sure about that no client code relies on it, therefore I'm free to change its behavior, change its name or signature, or I can even remove it. By not exposing it publicly I give myself space and freedom to change it, and over the last one year I found this a much more serious benefit of visibility than protecting clients from directly invoking internal methods.

Keeping visibility rules in mind is not the only considerable strategy to maintain backward-compatibility. An other thing I found quite useful is not going super-small in library size. Sometimes I can feel that in newer platform ecosystems - especially the ones which consider automated package management as a core feature - a re-occurring problem is that people break up their solutions into too small libraries. It is basically about utilizing the presence of the automated package management and taking a _"lets go extremely small so clients won't have to include any code that they don't need"_ approach. This is a wise idea, but it has a harmful side-effect: very small libraries performing a very small piece of job are simply not maintainable. Since they don't really have a massive internal layer which can be a subject of refactoring, small libraries can't adopt, therefore they will go unmaintained, deprecated, or will break compatibility [even on a patch level change](https://medium.com/@wob/the-sad-state-of-web-development-1603a861d29f#.c4yplz2xj). So for library authors I'd suggest making a healthy and responsible compromise between going extremely monolithic and extremely modular.

The last but still interesting things is that the Java6/7 compatibility still matters. My code heavily relies on java8 language features and I was somewhat surprised about how lot of people are asking for/about java6 support. I think this problem will become less and less relevant, and the java6 compatibility requirement will just fade away, but still, it was surprising to see.
