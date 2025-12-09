import { useLanguage } from '../contexts/LanguageContext';
import { Booking } from '../lib/supabase';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';

type Props = {
  booking: Booking & { 
    service_name?: string;
    provider_name?: string;
    customer_name?: string;
  };
  onClick?: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function BookingCard({ 
  booking, 
  onClick, 
  showActions,
  onAccept,
  onReject,
  onComplete
}: Props) {
  const { t } = useLanguage();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${onClick ? 'hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {booking.service_name || 'Service'}
          </h3>
          <p className="text-sm text-gray-500">
            {booking.provider_name || booking.customer_name}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
          {t(booking.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(booking.scheduled_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{formatTime(booking.scheduled_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="line-clamp-1">{booking.address}</span>
        </div>
        {booking.total_amount && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-medium">${booking.total_amount}</span>
          </div>
        )}
      </div>

      {showActions && booking.status === 'pending' && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onAccept?.(); }}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject?.(); }}
            className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {showActions && booking.status === 'confirmed' && (
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
}

export default BookingCard;
