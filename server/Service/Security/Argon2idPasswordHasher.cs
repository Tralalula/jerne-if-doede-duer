using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Identity;

namespace Service.Security;

public class Argon2idPasswordHasher<TUser> : IPasswordHasher<TUser> where TUser : class
{
    private const string Name = "argon2id";
    
    public string HashPassword(TUser user, string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);
        byte[] hash = GenerateHash(password, salt);
        return $"{Name}${Encode(salt)}${Encode(hash)}";
    }

    public PasswordVerificationResult VerifyHashedPassword(TUser user, string hashedPassword, string providedPassword)
    {
        string[] parts = hashedPassword.Split('$');
        var salt = Decode(parts[1]);
        var storedHash = Decode(parts[2]);
        var providedHash = GenerateHash(providedPassword, salt);
        return ByteArraysEqual(storedHash, providedHash) ? PasswordVerificationResult.Success : PasswordVerificationResult.Failed;
    }
    
    protected string Encode(byte[] value)
    {
        return Convert.ToBase64String(value);
    }
    
    protected byte[] Decode(string value)
    {
        return Convert.FromBase64String(value);
    }
    
    private static byte[] GenerateHash(string password, byte[] salt)
    {
        using var hashAlgorithm = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            MemorySize = 12288,
            Iterations = 3,
            DegreeOfParallelism = 1
        };
        
        return hashAlgorithm.GetBytes(256 / 8);
    }
    
    // Compares two byte arrays for equality. The method is specifically written so that the loop is not optimized.
    // From: https://github.com/aspnet/AspNetIdentity/blob/main/src/Microsoft.AspNet.Identity.Core/Crypto.cs
    [MethodImpl(MethodImplOptions.NoOptimization)]
    private static bool ByteArraysEqual(byte[] a, byte[] b)
    {
        if (a.Length != b.Length) return false;
        
        bool areSame = true;
        for (int i = 0; i < a.Length; i++)
        {
            areSame &= a[i] == b[i];
        }
        
        return areSame;
    }
}
