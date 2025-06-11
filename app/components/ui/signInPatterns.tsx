const SignInPatterns = () => {
  return (
    <>
      <span className='absolute top-0 left-0 pointer-events-none z-0'>
        <img src='/sign-in-patterns/top-left.png' alt='Cipherdolls' className='object-cover  sm:block hidden' />
        <img src='/sign-in-patterns/mobile-top-left.png' alt='Cipherdolls' className='object-cover sm:hidden block' />
      </span>
      <span className='absolute bottom-0 left-0 sm:block hidden pointer-events-none z-0'>
        <img src='/sign-in-patterns/bottom-left.png' alt='Cipherdolls' className='object-cover' />
      </span>
      <span className='absolute bottom-0 right-0  pointer-events-none z-0'>
        <img src='/sign-in-patterns/bottom-right.png' alt='Cipherdolls' className='object-cover sm:block hidden' />
        <img src='/sign-in-patterns/mobile-bottom-right.png' alt='Cipherdolls' className='object-cover sm:hidden block' />
      </span>
    </>
  );
};

export default SignInPatterns;
