import type { Doll } from '~/types';

const DollCard = ({ doll }: { doll: Doll }) => {
  const { name } = doll;
  return (
    <div className='sm:bg-[linear-gradient(86.23deg,rgba(254,253,248,0.56)_0%,rgba(255,255,255,0.56s)_100%)] sm:bg-transparent bg-none bg-base-white rounded-xl flex sm:flex-col overflow-hidden sm:p-0 p-3 sm:gap-0 gap-4'>
      <div className='relative'>
        <img
          src='https://s3-alpha-sig.figma.com/img/3aaf/24b2/a14674fb83d28415abf429345a0d0f66?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=OcZ-DWDIXLdrA2q0Flbrrnr1cxJX7FCj3ezD9HMpNT~62ZrebUoVp-uPqffKnH9fTlmp2BLmuQR~LKgGZOOEfoZqLYmuKUHtdRz5UWyc5LXrkKdwVnbTVe2R3YyHMDgmaNs14dF03HCbDkI4Lbdrbb2Ds~iQbZ8XshGI1CFC2ny6vDZoO1ILDp0IpmiwA2d7ZAi5Cgz3sUOSpd0pudmZSGA3XkfyHJVsfAI7UwpUv43Jtyx51BpVtGzLN7AgohuWTWwO5LAVNwZ5fpce7a1TPZoIF76aCHSlWIW4phUSbmHJ9LrlIbGU4LVh~PegJOR3gEp9FpSnBxE-M0Ey8AiwPw__'
          alt='Doll Image'
          className='sm:h-[184px] sm:w-full object-cover object-top size-14 sm:rounded-none rounded-full'
        />
        <div className='size-2.5 rounded-full bg-specials-success border border-white sm:hidden block absolute bottom-1 right-1' />
      </div>
      <div className='sm:py-4 sm:px-4.5 flex items-center'>
        <div className='flex flex-1 flex-col sm:gap-1 gap-0.5'>
          <div className='flex items-center gap-1'>
            <h4 className='sm:text-heading-h4 text-body-lg font-semibold text-base-black'>{name}</h4>
            <div className='size-2.5 rounded-full bg-specials-success border border-white sm:block hidden' />
          </div>
          <div className='flex items-center sm:gap-2 gap-3'>
            <p className='text-body-sm sm:text-body-md text-neutral-01'>Connected to</p>
            <img
              src='https://s3-alpha-sig.figma.com/img/90b8/0393/c306f78d298d8e0bae9d7c12a245f46a?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qt1DtHhx-duZHlRmAyIhdezB7Gb6Iiq6-cmTNOFW9iYmmCQ3FiWFbEYS2ClTygbrXlB4QH6roWg9zwVxHg2gBF7cD-hK7mN9Q1O9O1f5WbhH0cymAyMWaltl9Y8YARKeRc7lqWlAbTLO933cJxJI0Bpvh~HOg9xvhR4en5p95NYBr8jvpGlzylC5G1pFZCXYB8VI186zzdNsWlyxyhNr4ouTrJZHSZTMvjSRQyf~1AW60Ny3zQx2hemqsoerLV-JTlKYM0SfLBVmlqHHEjdXlUz322r64TBL5Oy11HDk9A9ENAkZ8f6KGAb3fEyeX4p8dvKJn5czwfhfhCZsZSPp2Q__'
              alt='Doll Image'
              className='size-5 rounded-full object-cover sm:hidden block -mr-1'
            />
            <span className='text-base-black text-body-sm sm:text-body-md font-semibold'>Loren</span>
          </div>
        </div>
        <div className='sm:block hidden'>
          <img
            src='https://s3-alpha-sig.figma.com/img/90b8/0393/c306f78d298d8e0bae9d7c12a245f46a?Expires=1741564800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=qt1DtHhx-duZHlRmAyIhdezB7Gb6Iiq6-cmTNOFW9iYmmCQ3FiWFbEYS2ClTygbrXlB4QH6roWg9zwVxHg2gBF7cD-hK7mN9Q1O9O1f5WbhH0cymAyMWaltl9Y8YARKeRc7lqWlAbTLO933cJxJI0Bpvh~HOg9xvhR4en5p95NYBr8jvpGlzylC5G1pFZCXYB8VI186zzdNsWlyxyhNr4ouTrJZHSZTMvjSRQyf~1AW60Ny3zQx2hemqsoerLV-JTlKYM0SfLBVmlqHHEjdXlUz322r64TBL5Oy11HDk9A9ENAkZ8f6KGAb3fEyeX4p8dvKJn5czwfhfhCZsZSPp2Q__'
            alt='Doll Image'
            className='size-10 rounded-full object-cover'
          />
        </div>
      </div>
    </div>
  );
};

export default DollCard;
