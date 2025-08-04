import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.scenarios.new';
import ScenarioFormModal from '~/components/ScenarioFormModal';
import { useCreateScenario } from '~/hooks/queries/scenarioMutations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Scenario' }];
}

export default function ScenarioNew({ loaderData }: Route.ComponentProps) {
  const { mutate: createScenario, error: createScenarioError } = useCreateScenario();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(`/scenarios`);
  };

  const handleSubmit = (formData: FormData) => {
    createScenario(formData, {
      onSuccess: (newScenarioData) => {
        console.log(newScenarioData);
        navigate(`/scenarios/${newScenarioData.id}`);
      },
    });
  };

  return <ScenarioFormModal onClose={handleClose} onSubmit={handleSubmit} errors={createScenarioError} />;
}
