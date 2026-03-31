using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace WebApi.Services.EnumFlags;

public enum OrdersEnum
{
    [Description("В корзине")] [Display(Name = "В корзине")]
    Basket = 0,

    [Description("В обработке")] [Display(Name = "В обработке")]
    Processing = 1,

    [Description("Завершен")] [Display(Name = "Завершен")]
    Completed = 2,
}

public static class EnumExtensions  
{
    public static string GetDescription(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = field?.GetCustomAttribute<DescriptionAttribute>();
        return attribute?.Description ?? value.ToString();
    }

    public static string GetDisplayName(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = field?.GetCustomAttribute<DisplayAttribute>();
        return attribute?.Name ?? value.ToString();
    }
}