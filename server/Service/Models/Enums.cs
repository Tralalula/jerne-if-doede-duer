using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Service.Models;

[JsonConverter(typeof(StringEnumConverter))]
public enum SortOrder
{
    Asc,
    Desc
}