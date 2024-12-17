namespace Service.Security;

public class DanishPasswordGenerator
{
    private static readonly string[] DanishWords = {
        "Kakao", "Rugbrød", "Pølse", "Hygge", "Smørrebrød", 
        "Wienerbrød", "Kringle", "Æbleskive", "Leverpostej", "Frikadelle",
        "Snaps", "Sild", "Kartoffel", "Kage", "Cykel", "Regnbue", "Ostehaps",
        "Strand", "Kaffe", "Akvavit", "Pepsi", "Twist", "Skumfidus", "Nisse",
        "Bajads", "Blegsotig", "Brødflov", "Charlatan", "Djærv",
        "Dorsk", "Dosmerseddel", "Døgenigt", "Dølgsmål", "Fjæle",
        "Flanere", "Flottenhejmer", "Fløs", "Forfjor", "Forskertse",
        "Forsoren", "Forvorpen", "Fusentast", "Gebommerlig", "Gelassen",
        "Halsstarrig", "Idelig", "Kalas", "Kanalje", "Knarvorn",
        "Knibsk", "Kålhøgen", "Langmodig", "Misliebig", "Mødig",
        "Obsternasig", "Skellig", "Sporenstregs", "Spæge", "Svanger",
        "Sysselsætte", "Træsk", "Trættekær", "Tvætte", "Ufortøvet",
        "Vindbøjtel", "Ødeland", "Kanel",
        "Pølsemix", "Remoulade", "Flæskesteg", "Risalamande", "Medister",
        "Spegepølse", "Agurk", "Småkage", "Bolcher", "Lakrids",
        "Spejlæg", "Morgenmad", "Frokost", "Kanelbolle", "Romkugle",
        "Hyggeligt", "Mobilepay", "Legoklods", "Dagligdag", "Tandlæge",
        "Busrejse", "Forsikring", "Regnjakke", "Solskin", "Lykkelig",
        "Fjernsyn", "Godmorgen", "Hejhej", "Farvel", "Velbekomme",
        "Værsgo",
        "Pindsvin", "Regnvejr", "Solsort", "Sommerfugl", "Blomster",
        "Sneflage", "Jordbær", "Æblemos", "Havudsigt", "Måneskin",
        "Musebøvs", "Tandsmør", "Ørehænger", "Krejler", "Pilskaldet",
        "Paddehat", "Tissemyre", "Rullepølse", "Tandstikker", "Solbader",
        "Rådhus", "Bibliotek", "Badeland", "Legeplads", "Boghandel",
        "Slagter", "Bageri", "Posthus", "Togstation"
    };
    
    private static readonly Random Random = new Random();
    private static readonly object Lock = new object();
    
    public static string GeneratePassword()
    {
        lock (Lock)
        {
            var word = DanishWords[Random.Next(DanishWords.Length)];
            var numbers = Random.Next(10, 100); 
            return $"{word}{numbers}!";
        }
    }
}