import { useNavigate } from 'react-router';
import type { Route } from './+types/_main._general.account.scenarios.new';
import ScenarioFormModal from '~/components/ScenarioFormModal';
import { useCreateScenario } from '~/hooks/queries/scenarioMutations';
import { ROUTES } from '~/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New Scenario' }];
}

export default function AccountScenarioNew() {
  const { mutate: createScenario, error: createScenarioError } = useCreateScenario();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(ROUTES.account);
  };

  const handleSubmit = (data: Record<string, any>) => {
    createScenario(data, {
      onSuccess: (newScenarioData) => {
        navigate(`${ROUTES.scenarios}/${newScenarioData.id}`);
      },
    });
  };

  return <ScenarioFormModal onClose={handleClose} onSubmit={handleSubmit} errors={createScenarioError} />;
}
