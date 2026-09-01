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

public class InvalidQuantityException : Exception
{
    public string Code => "INVALID_QUANTITY";

    public InvalidQuantityException() : base("La cantidad debe ser mayor a cero.")
    {
    }
}

public class InsufficientStockException : Exception
{
    public string Code => "INSUFFICIENT_STOCK";

    public InsufficientStockException(int stockActual)
        : base($"Stock insuficiente. Disponible: {stockActual}.")
    {
    }
}

public class ProductNotFoundException : Exception
{
    public string Code => "PRODUCT_NOT_FOUND";

    public ProductNotFoundException() : base("El producto seleccionado no existe.")
    {
    }
}

public class ProductExpiredException : Exception
{
    public string Code => "PRODUCT_EXPIRED";

    public ProductExpiredException() : base("El producto se encuentra vencido y no puede registrarse su salida.")
    {
    }
}

public class DuplicateUsernameException : Exception
{
    public string Code => "DUPLICATE_USERNAME";

    public DuplicateUsernameException() : base("El nombre de usuario ya está registrado.")
    {
    }
}

public class UserNotFoundException : Exception
{
    public string Code => "USER_NOT_FOUND";

    public UserNotFoundException() : base("El usuario solicitado no existe.")
    {
    }
}

public class InvalidRoleException : Exception
{
    public string Code => "INVALID_ROLE";

    public InvalidRoleException() : base("El rol seleccionado no es válido.")
    {
    }
}

public class AdminProtectedException : Exception
{
    public string Code => "ADMIN_PROTECTED";

    public AdminProtectedException(string message) : base(message)
    {
    }
}

public class InvalidCredentialsException : Exception
{
    public string Code => "INVALID_CREDENTIALS";

    public InvalidCredentialsException() : base("Usuario o contraseña incorrectos.")
    {
    }
}

public class AccountInactiveException : Exception
{
    public string Code => "ACCOUNT_INACTIVE";

    public AccountInactiveException() : base("La cuenta está inactiva. Contacta al administrador.")
    {
    }
}

public class PendingDeactivationRequestException : Exception
{
    public string Code => "PENDING_DEACTIVATION_REQUEST";

    public PendingDeactivationRequestException()
        : base("Ya existe una solicitud de baja pendiente para esta cuenta.")
    {
    }
}

public class DeactivationRequestNotFoundException : Exception
{
    public string Code => "DEACTIVATION_REQUEST_NOT_FOUND";

    public DeactivationRequestNotFoundException()
        : base("La solicitud de baja no existe.")
    {
    }
}
