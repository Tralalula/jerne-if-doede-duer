# Install NSwag globally
dotnet tool install -g NSwag.ConsoleCore

# Generate a C# client from OpenAPI specification
nswag openapi2csclient `
    /input:http://localhost:5009/swagger/v1/swagger.json `
    /output:SwaggerClient.cs `
    /namespace:Generated `
    /wrapResponses:true