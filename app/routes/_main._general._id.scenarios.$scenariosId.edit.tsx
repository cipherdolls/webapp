import { useNavigate } from 'react-router';

import type { Route } from './+types/_main._general._id.scenarios.$scenariosId.edit';
import ScenarioFormModal from '~/components/ScenarioFormModal';
import { useUpdateScenario } from '~/hooks/queries/scenarioMutations';
import { useScenario } from '~/hooks/queries/scenarioQueries';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Edit Scenario' }];
}

export default function ScenarioEdit({ params }: Route.ComponentProps) {
  const { data: scenarioData } = useScenario(params.scenariosId);
  const { mutate: updateScenario, error: updateScenarioError, isPending: updateScenarioIsPending } = useUpdateScenario();
  const navigate = useNavigate();

  if (!scenarioData) {
    return null;
  }

  const scenario = scenarioData;

  const handleClose = () => {
    navigate(`/scenarios/${scenario.id}`);
  };

  const handleSubmit = (formData: FormData) => {
    updateScenario(
      { scenarioId: scenario.id, formData },
      {
        onSuccess: () => {
          navigate(`/scenarios/${scenario.id}`);
        },
      }
    );
  };

  return <ScenarioFormModal scenario={scenario} onClose={handleClose} onSubmit={handleSubmit} isLoading={updateScenarioIsPending} errors={updateScenarioError} />;
}
