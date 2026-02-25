import { Link } from 'react-router';
import { getPicture } from '~/utils/getPicture';

interface DashboardCardProps {
  item: {
    id: string;
    name: string;
  };
  type: 'avatars' | 'scenarios' | 'dolls';
  to: string;
  imageHeight?: string;
  children?: React.ReactNode;
}

const DashboardCard = ({ item, type, to, imageHeight = 'h-[200px] sm:h-[152px] lg:h-[120px]', children }: DashboardCardProps) => {
  return (
    <div className='flex flex-col bg-white shadow-bottom-level-1 rounded-xl overflow-hidden'>
      <Link to={to} className={`block ${imageHeight} rounded-xl bg-black relative`}>
        <img
          src={getPicture(item, type, false)}
          srcSet={getPicture(item, type, true)}
          alt={`${item.name} picture`}
          className='object-cover size-full'
        />
      </Link>

      {children && <div className='p-3 flex lg:items-center gap-5 justify-between flex-1'>{children}</div>}
    </div>
  );
};

export default DashboardCard;
