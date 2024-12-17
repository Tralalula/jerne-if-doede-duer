using DataAccess.Models;
using Service.Models;

namespace Service.Users;

public record UserDetailsResponse(Guid Id, 
                                  string Email, 
                                  string PhoneNumber, 
                                  UserStatus Status, 
                                  int Credits, 
                                  DateTime Timestamp,
                                  IReadOnlyList<string> Roles);

public record PagedUserResponse(List<UserDetailsResponse> Items, PagingInfo PagingInfo);