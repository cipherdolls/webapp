import { Link, redirect } from 'react-router';
import { Card } from '~/components/card';
import DashboardBanner from '~/components/dashboardBanner';
import HowToAddDollModal from '~/components/howToAddDollModal';
import { Icons } from '~/components/ui/icons';
import type { Route } from './+types/_main._index';
import type { Avatar, Doll } from '~/types';





export async function clientLoader() {
  const backendUrl = 'https://api.cipherdolls.com';
  const localStorageToken = localStorage.getItem('token');
  if (!localStorageToken) {
    return redirect('/signin');
  }
  const headers = {
    headers: {
      Authorization: `Bearer ${localStorageToken?.replaceAll('"', '')}`,
    },
  };
  try {
    const [avatarsRes, dollsRes] = await Promise.all([
      fetch(`${backendUrl}/avatars`, headers),
      fetch(`${backendUrl}/dolls`, headers),
    ]);
    if (!avatarsRes.ok || !dollsRes.ok) {
      throw new Error("Failed to fetch data");
    }
    const avatars: Avatar[] = await avatarsRes.json();
    const dolls: Doll[] = await dollsRes.json();

    return { avatars, dolls };
  } catch (error) {
    return redirect('/signin');
  }
}




export default function Dashbaord({ loaderData }: Route.ComponentProps) {

  const { avatars, dolls } = loaderData;

  return (
    <div className='flex flex-col lg:gap-16 md:gap-12 gap-8 flex-1'>
      <div className='flex flex-col sm:gap-4 gap-7'>
        <h3 className='text-heading-h3 py-3 sm:block hidden'>Dashboard</h3>
        <div className='sm:hidden block ml-[18px] '>
          <Icons.mobileLogo />
        </div>
        <DashboardBanner variant='welcome' description='What do you want to start from?' />
      </div>

      <div className='flex sm:flex-row flex-col-reverse sm:gap-0 gap-8 sm:flex-1 sm:divide-x divide-neutral-04'>
        <Card.Root className='sm:pr-4'>
          <Card.Label>Your Avatars</Card.Label>
          <Card.Main className='max-h-max'>
            <Card.Header>
              <Link to='/avatars'>
                <Card.HeaderSection>
                  <Icons.add />
                  Add Avatar
                </Card.HeaderSection>
              </Link>
              <Link to='/avatars/new'>
                <Card.HeaderSection>
                  <Icons.pen />
                  Create Avatar
                </Card.HeaderSection>
              </Link>
            </Card.Header>
            <Card.Content>
              {avatars.length === 0 ? (
                <div className='sm:pb-14'>
                  <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
                    <h1 className='sm:text-heading-h1 text-heading-h2'>🎨</h1>
                    <div className='flex flex-col sm:gap-2 gap-1'>
                      <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Avatars Yet</h4>
                      <p className='text-body-md text-neutral-01 sm:text-center'>You can add public avatar, or create a brand new own</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </Card.Content>
          </Card.Main>
        </Card.Root>

        <Card.Root className='sm:pl-4 sm:max-w-[352px]'>
          <Card.Label>Your Dolls</Card.Label>
          <Card.Main className='max-h-max'>
            <Card.Content>
              {dolls.length === 0 ? (
                <div className='sm:py-14'>
                  <div className='py-6 sm:py-4 px-6 flex sm:flex-col flex-row items-center sm:justify-center sm:gap-2 gap-6'>
                    <h1 className='sm:text-heading-h1 text-heading-h2'>🤷‍♀️</h1>
                    <div className='flex flex-col sm:gap-2 gap-1'>
                      <h4 className='sm:text-heading-h4 text-body-lg text-base-black sm:text-center'>You Have No Dolls Yet</h4>
                      <HowToAddDollModal />
                    </div>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
            </Card.Content>
          </Card.Main>
        </Card.Root>
      </div>
    </div>
  );
};

