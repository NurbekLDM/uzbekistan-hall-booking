
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hall } from '@/store/hallsStore';

interface HallCardProps {
  hall: Hall;
  showApprovalStatus?: boolean;
}

const HallCard = ({ hall, showApprovalStatus = false }: HallCardProps) => {
  return (
    <Card className="overflow-hidden card-hover">
      <div className="relative h-48 overflow-hidden">
        {hall.images && hall.images.length > 0 ? (
          <img 
            src={hall.images[0]} 
            alt={hall.name}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {showApprovalStatus && (
            <Badge className={hall.approved ? 'bg-green-500' : 'bg-amber-500'}>
              {hall.approved ? 'Approved' : 'Pending'}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="pt-4">
        <h3 className="font-serif text-xl font-semibold mb-2">{hall.name}</h3>
        <p className="text-gray-600 text-sm mb-1">
          {hall.district} • {hall.address}
        </p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <span className="text-sm text-gray-700">Capacity</span>
            <span className="font-semibold">{hall.capacity} guests</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-700">Price per guest</span>
            <span className="font-semibold text-gold">${hall.pricePerSeat}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/halls/${hall.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HallCard;
