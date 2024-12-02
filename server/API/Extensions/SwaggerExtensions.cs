using NJsonSchema.Generation;
using NSwag.Generation.Processors;
using NSwag.Generation.Processors.Contexts;
using Service.Auth;

namespace API.Extensions;

public class SwaggerExtensions
{
    
}

public class MakeAllPropertiesRequiredProcessor : IDocumentProcessor
{
    public void Process(DocumentProcessorContext context)
    {
        foreach (var schema in context.Document.Definitions.Values)
        {
            foreach (var property in schema.Properties)
            {
                schema.RequiredProperties.Add(property.Key);
            }
        }
    }
}

public class ExampleSchemaProcessor : ISchemaProcessor
{
    private readonly Dictionary<Type, object> _examples = new()
    {
        { typeof(LoginRequest), new { email = "admin@example.com", password = "Kakao1234!" } },
        { typeof(RegisterRequest), new { email = "børge@example.com", password = "SecurePass123!" } },
    };

    public void Process(SchemaProcessorContext context)
    {
        if (_examples.TryGetValue(context.ContextualType.Type, out var example))
        {
            context.Schema.Example = example;
        }
    }
}