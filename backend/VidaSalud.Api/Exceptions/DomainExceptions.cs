namespace VidaSalud.Api.Exceptions;

public class DuplicateProductException : Exception
{
    public string Code => "DUPLICATE_PRODUCT";

    public DuplicateProductException(string message = "El producto ya existe en el sistema.") : base(message)
    {
    }
}

public class CategoryNotFoundException : Exception
{
    public string Code => "CATEGORY_NOT_FOUND";

    public CategoryNotFoundException(string message = "La categoría especificada no existe.") : base(message)
    {
    }
}

public class BusinessValidationException : Exception
{
    public string Code => "VALIDATION_ERROR";

    public BusinessValidationException(string message) : base(message)
    {
    }
}
