using System.Text.Json.Serialization;
using Newtonsoft.Json.Converters;

namespace Service.Users;

[JsonConverter(typeof(StringEnumConverter))]
public enum UserOrderBy
{
    Timestamp,
    Email,
    Credits,
    Status
}

[JsonConverter(typeof(StringEnumConverter))]
public enum RoleType
{
    Admin,
    Player
}