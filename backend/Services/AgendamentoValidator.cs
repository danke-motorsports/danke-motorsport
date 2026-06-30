namespace backend.Services;

public static class AgendamentoValidator
{
    private const int OpenHour = 8;
    private const int CloseHour = 18;

    private static readonly TimeZoneInfo BrazilTimeZone = TimeZoneInfo.FindSystemTimeZoneById(
        OperatingSystem.IsWindows() ? "E. South America Standard Time" : "America/Sao_Paulo");

    public static bool TryValidate(DateTime datAgendamento, out string? errorMessage)
    {
        var agendamentoUtc = datAgendamento.Kind switch
        {
            DateTimeKind.Utc => datAgendamento,
            DateTimeKind.Local => datAgendamento.ToUniversalTime(),
            _ => DateTime.SpecifyKind(datAgendamento, DateTimeKind.Utc)
        };

        var local = TimeZoneInfo.ConvertTimeFromUtc(agendamentoUtc, BrazilTimeZone);
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, BrazilTimeZone);

        if (local <= nowLocal)
        {
            errorMessage = "O agendamento não pode ser no passado.";
            return false;
        }

        var time = local.TimeOfDay;
        var open = new TimeSpan(OpenHour, 0, 0);
        var close = new TimeSpan(CloseHour, 0, 0);

        if (time < open || time > close)
        {
            errorMessage = "Horário fora do expediente. Agendamentos das 08:00 às 18:00.";
            return false;
        }

        errorMessage = null;
        return true;
    }
}
