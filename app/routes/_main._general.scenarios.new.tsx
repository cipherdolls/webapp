import { redirect, useFetcher, useNavigate, useParams, useRouteLoaderData } from 'react-router';

import { fetchWithAuth } from '~/utils/fetchWithAuth';
import type { Route } from './+types/_main._general.scenarios.new';
import * as Button from '~/components/ui/button/button';

import { Icons } from '~/components/ui/icons';
import * as Input from '~/components/ui/input/input';
import { Fragment, useRef, useState } from 'react';
import type { AiProvider, AiProvidersPaginated, Gender, Avatar, AvatarsPaginated, User } from '~/types';
import * as Textarea from '~/components/ui/input/textarea';
import * as Select from '~/components/ui/input/select';
import * as Slider from '~/components/ui/slider';
import Multiselect from '~/components/ui/input/multiselect';
import ErrorsBox from '~/components/ui/input/errorsBox';
import { formatModelName } from '~/utils/formatModelName';
import * as Modal from '~/components/ui/new-modal';
import { InformationBadge } from '~/components/ui/InformationBadge';
import { cn } from '~/utils/cn';
import ScenarioFormModal from '~/components/ScenarioFormModal';

interface Option {
  label: string;
  value: string;
  recommended: boolean;
}

interface OptionGroup {
  groupName: string;
  options: Option[];
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Scenario' }];
}

export async function clientLoader() {
  const [aiProvidersRes, avatarsRes, publicAvatarsRes] = await Promise.all([
    fetchWithAuth('ai-providers'),
    fetchWithAuth('avatars'),
    fetchWithAuth('avatars?published=true'),
  ]);

  const { data }: AiProvidersPaginated = await aiProvidersRes.json();
  const aiProviders = data;

  const mineAvatars: AvatarsPaginated = await avatarsRes.json();
  const publicAvatars: AvatarsPaginated = await publicAvatarsRes.json();

  // Deduplicate avatars by ID
  const allAvatars = [...mineAvatars.data, ...publicAvatars.data];
  const avatars = allAvatars.filter((avatar, index, self) => index === self.findIndex((a) => a.id === avatar.id));

  return { aiProviders, avatars };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  try {
    const formData = await request.formData();
    const res = await fetchWithAuth('scenarios', {
      method: request.method,
      body: formData,
    });

    if (!res.ok) {
      const responseData = await res.json();
      return {
        errors: responseData.message || 'Request failed',
      };
    }

    await res.json();
    return redirect(`/scenarios`);
  } catch (error: any) {
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export default function ScenarioNew({ loaderData }: Route.ComponentProps) {
  const { aiProviders, avatars } = loaderData as { aiProviders: AiProvider[]; avatars: Avatar[] };
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/scenarios`);
  };


  return <ScenarioFormModal method='POST' onClose={handleClose} aiProviders={aiProviders} avatars={avatars} />;
}
