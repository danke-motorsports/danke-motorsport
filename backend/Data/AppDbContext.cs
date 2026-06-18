using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data 
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // tabelas que o entity framework irá criar e gerenciar(CRUD)
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Funcionario> Funcionarios { get; set; }
        public DbSet<Revisao> Revisoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Cliente>()
                .HasIndex(c => c.Email)
                .IsUnique();

            modelBuilder.Entity<Funcionario>()
                .HasIndex(f => f.Email)
                .IsUnique();
        }
    }
}