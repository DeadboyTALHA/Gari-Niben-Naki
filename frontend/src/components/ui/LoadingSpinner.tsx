interface SpinnerProps {
  size?:    'sm' | 'md' | 'lg';
  message?: string;
}

const sizeMap = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

export function LoadingSpinner({ size = 'md', message }: SpinnerProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-8'>
      <svg
        className={`animate-spin text-blue-700 ${sizeMap[size]}`}
        fill='none' viewBox='0 0 24 24'
      >
        <circle className='opacity-25' cx='12' cy='12' r='10'
          stroke='currentColor' strokeWidth='4'/>
        <path className='opacity-75' fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'/>
      </svg>
      {message && <p className='text-gray-500 text-sm'>{message}</p>}
    </div>
  );
}

// Full-page skeleton loader (use on pages while data loads)
export function PageSkeleton() {
  return (
    <div className='max-w-7xl mx-auto px-4 py-8 space-y-4'>
      <div className='h-8 bg-gray-200 rounded-lg w-1/3 animate-pulse' />
      <div className='grid grid-cols-3 gap-6'>
        {[...Array(6)].map((_,i) => (
          <div key={i} className='h-64 bg-gray-200 rounded-xl animate-pulse' />
        ))}
      </div>
    </div>
  );
}

// Card skeleton for individual car cards
export function CardSkeleton() {
  return (
    <div className='bg-white rounded-xl shadow-md overflow-hidden'>
      <div className='h-48 bg-gray-200 animate-pulse' />
      <div className='p-4 space-y-3'>
        <div className='h-5 bg-gray-200 rounded w-3/4 animate-pulse' />
        <div className='h-4 bg-gray-200 rounded w-1/2 animate-pulse' />
        <div className='h-9 bg-gray-200 rounded animate-pulse' />
      </div>
    </div>
  );
}