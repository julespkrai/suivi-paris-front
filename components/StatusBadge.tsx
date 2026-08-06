export default function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    'En cours':   'badge-encours',
    'Gagné':      'badge-gagne',
    'Perdu':      'badge-perdu',
    'Remboursé':  'badge-rembourse',
    'Annulé':     'badge-annule',
    'À compléter':'badge-encours',
    'Cash Out':   'badge-cashout',
  };
  return <span className={`badge ${map[statut] || 'badge-annule'}`}>{statut}</span>;
}
