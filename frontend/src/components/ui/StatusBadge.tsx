interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  // Booking statuses
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100   text-blue-800',
  active:     'bg-green-100  text-green-800',
  completed:  'bg-gray-100   text-gray-800',
  cancelled:  'bg-red-100    text-red-800',
  // Vehicle statuses
  approved:   'bg-green-100  text-green-800',
  rejected:   'bg-red-100    text-red-800',
  maintenance:'bg-orange-100 text-orange-800',
  // Payment statuses
  succeeded:  'bg-green-100  text-green-800',
  failed:     'bg-red-100    text-red-800',
  refunded:   'bg-purple-100 text-purple-800',
};

export default function StatusBadge({ status, size = 'sm' }: BadgeProps) {
  const colorClass = colorMap[status] ?? 'bg-gray-100 text-gray-600';
  const sizeClass  = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium capitalize ${colorClass} ${sizeClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
}