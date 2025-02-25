import type { Avatar } from '~/types';

export const AvatarCard = ({ avatar }: { avatar: Avatar }) => {
  const { name, shortDesc } = avatar;
  return (
    <div className='lg:p-4 sm:p-3.5 p-3 flex items-center justify-between gap-4 sm:gap-[18px] flex-wrap'>
      <div className='sm:gap-[18px] gap-4 flex items-center'>
        <div className='shrink-0'>
          <img
            src='https://s3-alpha-sig.figma.com/img/90b8/0393/c306f78d298d8e0bae9d7c12a245f46a?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qt1DtHhx-duZHlRmAyIhdezB7Gb6Iiq6-cmTNOFW9iYmmCQ3FiWFbEYS2ClTygbrXlB4QH6roWg9zwVxHg2gBF7cD-hK7mN9Q1O9O1f5WbhH0cymAyMWaltl9Y8YARKeRc7lqWlAbTLO933cJxJI0Bpvh~HOg9xvhR4en5p95NYBr8jvpGlzylC5G1pFZCXYB8VI186zzdNsWlyxyhNr4ouTrJZHSZTMvjSRQyf~1AW60Ny3zQx2hemqsoerLV-JTlKYM0SfLBVmlqHHEjdXlUz322r64TBL5Oy11HDk9A9ENAkZ8f6KGAb3fEyeX4p8dvKJn5czwfhfhCZsZSPp2Q__'
            alt='Avatar Image'
            className='lg:size-20 sm:size-16 size-14 rounded-full'
          />
        </div>
        <div className='flex flex-1 gap-0.5 flex-col'>
          <h4 className='text-base-black sm:text-heading-h4 text-body-lg font-semibold'>{name}</h4>
          <p className='sm:text-body-md text-body-sm text-neutral-01'>{shortDesc}</p>
        </div>
      </div>
      <button className='bg-base-black rounded-full py-3 sm:py-2.5 text-body-sm sm:text-body-md font-semibold text-base-white sm:px-6 px-5'>
        Chat
      </button>
    </div>
  );
};
