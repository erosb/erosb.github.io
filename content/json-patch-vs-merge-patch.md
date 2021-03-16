+++
title = "JSON Patch and JSON Merge Patch"
date = "2016-05-14"
draft = false

+++

Partly as a side effect of the `PATCH` HTTP verb gaining attention in the recent years, people started to come up
with ideas about representing JSON-driven PATCH formats which declaratively describe differences between two JSON documents.
The number or home-grew solutions is probably countless, two formats have been published by IETF as RFC documents to solve
this problem: [RFC 6902 (JSON Patch)](https://tools.ietf.org/html/rfc6902) and
[RFC 7396 (JSON Merge Patch)](https://tools.ietf.org/html/rfc7386). Both have advantages and disadvantages, and none of
them will fit everybody's usecases, so lets have a quick look at which one to use.
<!-- more -->

## JSON Patch

The JSON Patch format is similar to a database transaction: it is an array of mutating operations on a JSON document,
which is executed atomically by a proper implementation. It is basically a series of `"add"`, `"remove"`, `"replace"`,
`"move"` and `"copy"` operations.

As a short example lets consider the following JSON document:

```
{
	"users" : [
		{ "name" : "Alice" , "email" : "alice@example.org" },
		{ "name" : "Bob" , "email" : "bob@example.org" }
	]
}

```

We can run the following patch on it, which changes Alice's email address then adds a new element to the array:
```
[
	{
		"op" : "replace" ,
		"path" : "/users/0/email" ,
		"value" : "alice@wonderland.org"
	},
	{
		"op" : "add" ,
		"path" : "/users/-" ,
		"value" : {
			"name" : "Christine",
			"email" : "christine@example.org"
		}
	}
]

```

The result will be:
```
{
	"users" : [
		{ "name" : "Alice" , "email" : "alice@wonderland.org" },
		{ "name" : "Bob" , "email" : "bob@example.org" },
		{ "name" : "Christine" , "email" : "christine@example.org" }
	]
}

```

So the outline of the operations described in a JSON Patch is

* the `"op"` key denotes operation
* the arguments of the operation are described by the other keys
* there is always a `"path"` argument, which is JSON Pointer pointing to the document fragment which is the target of the operation

An interesting option of the JSON Patch specification is its `"test"` operator: its evaluation doesn't come with any side
effects, so it isn't a data manipulating operator. Instead it can be used to describe assertions on the document at
given points of the JSON Patch execution. If the `"test"` evaluates to false then an error occurs, subsequent operations
won't be executed, and the document is rolled back to its initial state. I think the `"test"` can be useful for checking
preconditions before a patch execution or may be a safety net to check at the end of execution if everything looks all
right. Patches are run atomically by implementations therefore if a `"test"` finds inconsistency in the document then you can
safely assume that the document is still in consistent (initial) state after patch failure.




## JSON Merge Patch

Alongside JSON Patch there is an other JSON-based format, [JSON Merge Patch - RFC 7386](https://tools.ietf.org/html/rfc7386) ,
which can be used more or less for the same purpose, ie. it describes a changed version of a JSON document. The conceptual
difference compared to JSON Patch is that JSON Merge Patch is similar to a diff file. It simply contains the nodes of the
document which should be different after execution.

As a quick example ([taken from the spec](https://tools.ietf.org/html/rfc7386#section-1)) if we have the following document:
```
{
	"a": "b",
	"c": {
		"d": "e",
		"f": "g"
	}
}
```

Then we can run the following patch on it:
```
{
	"a":"z",
	"c": {
		"f": null
	}
}

```

which will change the value of `"a"` to `"z"` and will delete the `"f"` key.

The simplicity of the format may look first promising at the first glance, since most probably anyone understanding 
the schema of the original document will also instantly understand a merge patch document too. It is just a standardization
of one may naturally call a patch of a JSON document.

But this simplicity comes with some limitations:

* Deletion happens by setting a key to `null`. This inherently means that it isn't possible to change a key's value to
`null`, since such modification cannot be described by a merge patch document.
* Arrays cannot be manipulated by merge patches. If you want to add an element to an array, or mutate any of its elements
then you have to include the entire array in the merge patch document, even if the actually changed parts is minimal.
* the execution of a merge patch document never results in error. Any malformed patch will be merged, so it is a very liberal
format. It is not necessarily good, since you will probably need to perform programmatic check after merge, or run a JSON
Schema validation after the merge.

 
## Summary

JSON Merge Patch is a naively simple format, with limited usability. Probably it is a good choice if you are building something
small, with very simple JSON Schema, but you want offer a quickly understandable, more or less working method for clients
to update JSON documents. A REST API designed for public consumption but without appropriate client libraries might be
a good example.

For more complex usecases I'd pick JSON Patch, since it is applicable to any JSON documents (unline merge patch, which is
not able to set keys to `null`). The specification also ensures atomic execution and robust error reporting.
