export function getDashboardPath(role) {
  if (role === 'Cliente') return '/client-dashboard';
  if (role === 'Funcionario') return '/employee-dashboard';
  return '/admin-dashboard';
}
