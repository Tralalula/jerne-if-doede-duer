using NJsonSchema.Generation;
using NSwag.Generation.Processors;
using NSwag.Generation.Processors.Contexts;
using Service.Auth;
using Service.Models.Requests;

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
                if (property.Key.Equals("phoneNumber", StringComparison.OrdinalIgnoreCase)) { continue; }
                if (property.Key.Equals("newEmail", StringComparison.OrdinalIgnoreCase)) { continue; }
                
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
        { typeof(RegisterRequest), new { email = "børge@example.com", firstName = "Børge", lastName = "Steensen", phoneNumber = "12345678"  } },
        { typeof(BoardPickRequest), new { amount = 1, selectedNumbers = new List<int> { 1, 2, 3, 4, 5 } } }
    };

    public void Process(SchemaProcessorContext context)
    {
        if (_examples.TryGetValue(context.ContextualType.Type, out var example))
        {
            context.Schema.Example = example;
        }
    }
}