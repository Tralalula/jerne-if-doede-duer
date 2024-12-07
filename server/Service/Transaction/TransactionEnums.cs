using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Service.Transaction;

[JsonConverter(typeof(StringEnumConverter))]
public enum TransactionStatus
{
    Pending,
    Accepted,
    Denied
}

[JsonConverter(typeof(StringEnumConverter))]
public enum TransactionOrderBy
{
    Timestamp,
    Credits,
    Status
}