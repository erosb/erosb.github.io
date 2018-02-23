+++
title = "How to use RAML for testing Angular applications"
draft = true
date = "2017-09-04"
+++

One drawback of creating the necessary isolation for testing is the risk of improperly simulating the behavior of the remote by the test double. For example, let's assume you write a naively simple store service, and you

 * the server returns stock quantities in an array, where each object has `"name"` and a `"quantity"` keys. You implement this backend and also add service tests ensuring that the proper array is returned, for example

```
[
  {"productName": "product-01", "quantity": 2},
  {"productName": "product-02", "quantity": 3}
]
```

 * then you implement a frontend, write an angular service which sends the proper HTTP request, then it expects the response to be an object of product name - stock quantity pairs. You also write a unittest, you use a stub `Http` implementation which yields the following JSON to your client:

 ```
{
  "product-01": 2,
  "product-02": 3
}
 ```

As you probably realized, the service sends back the stock quantities in a different format. The tests of both services pass, so in a sense they are both correct. Still, they are unable to interact - they speak slightly different languages, so the frontend doesn't understand what the backend tries to say.

A plently of similar problems are possible. Endpoint URLs, response status codes, header formats are all subjects to mismatch.

Of course, we don't want to release services which are not inter-operable, and also we don't want to waste time on additional manual testing. So what options do we have to avoid such problems? How can we verify that our applications which pass their own tests will also be able to operate together in integration?

One way to overcome this problem is to develop a massive end-to-end test suite, so that we can verify in every possible ways that they interact properly. But has serious drawbacks.

An other way to go is trying to verify that the expectations and test doubles of the two components match the interface. In other words, we want to define a contract exactly describing the communication protocol between them, and we want to use this to _verify our tests_ . If we don't only verify our production code with tests, but we also add automation for ensuring that the tests properly simulate the real component, then we already excluded a huge category of pitfalls and production failures. Of course we may still add in end-to-end tests, but much less of them will be sufficient.

RAML (stands for REST API Markup Language) is a YAML dialect designed for describing REST APIs.

If you are more familiar of the SOAP jargon, you can think about RAML as an analogy of WSDL in the REST world. It is a declarative collection of endpoint sigantures.


So these are the ingredients: RAML and Angular MockBackend. So what we do? We take the RAML definition and generate a MockBackend from it. This setup will verify that the behavior of the MockBackend will match the whatever.
