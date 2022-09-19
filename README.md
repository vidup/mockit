This is a fun little experiment I'm doing to build a lightweight Mokito inspired mocking library.

For now it's functional and allows you to mock out methods by returning custom values,
executing a custom function, or throwing a custom exception as well as a custom error message.

This is a work in progress and is subject to change completely. If you come across this package, I suggest
you don't use it in production yet.

Next steps:

- [x] Check if the mock has been called.
- [x] Check if the mock has been called a specific number of times.
- [x] Check if the mock has been called with specific arguments.
- [x] Check if the mock has been called with specific arguments a specific number of times.
- [x] Use prototype to generate stubs that cover all the functions of a class.
- [x] Use generics to provide auto-completion for the mock, spy and when functions.
- [x] Use generics to avoid requiring to pass an instance of the class instead of the class itself.
