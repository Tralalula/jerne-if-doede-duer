using Generated;

namespace ApiIntegrationTests.Auth;

public class AuthTestHelper
{
   public static class Users
   {
      public static readonly LoginRequest Admin = new()
      {
         Email = "admin@example.com",
         Password = "Kakao1234!"
      };
      
      public static readonly LoginRequest Player = new()
      {
         Email = "player@example.com",
         Password = "Pepsitwist69!"
      };
      
      public static readonly LoginRequest NotRegistered = new()
      {
         Email = "notregistered@example.com",
         Password = "Kakao1234!"
      };
      
      public static readonly RegisterRequest NewUser = new()
      {
         Email = "børge@example.com",
         Password = "Kakao1234!"
      };
   }
}